mod commands;
mod services;
mod utils;

use std::sync::Mutex;
use commands::window::CurrentShortcut;
use services::db::AppState;
use tauri::{
    tray::{TrayIconBuilder, MouseButton, MouseButtonState, TrayIconEvent},
    menu::{Menu, MenuItem},
    Manager,
};

/// 唤起主窗口（显示、还原最小化、聚焦），托盘 / 单实例共用。
pub fn show_main_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

/// 全局快捷键切换主窗口：可见且有焦点时隐藏（与关闭按钮一致，收进托盘），否则唤起。
pub fn toggle_main_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let visible = window.is_visible().unwrap_or(false);
        let focused = window.is_focused().unwrap_or(false);
        if visible && focused {
            let _ = window.hide();
        } else {
            show_main_window(app);
        }
    }
}

/// 启动注册失败后的后台重试：每 10 秒一次、最多 5 次，注册动作派发到主线程执行。
fn spawn_shortcut_retry(app_handle: tauri::AppHandle, shortcut_str: String) {
    std::thread::spawn(move || {
        for _ in 0..5 {
            std::thread::sleep(std::time::Duration::from_secs(10));
            let (tx, rx) = std::sync::mpsc::channel();
            let handle = app_handle.clone();
            let target = shortcut_str.clone();
            let inner = handle.clone();
            let dispatched = handle.run_on_main_thread(move || {
                let _ = tx.send(commands::window::register_if_unset(&inner, &target));
            });
            if dispatched.is_err() {
                return; // 应用正在退出
            }
            match rx.recv_timeout(std::time::Duration::from_secs(30)) {
                // Ok(true)=本次注册成功；Ok(false)=用户已从设置页注册了其他快捷键，放弃重试
                Ok(Ok(_)) => {
                    eprintln!("[shortcut] 全局快捷键 {shortcut_str} 重试注册成功");
                    return;
                }
                Ok(Err(_)) => continue,
                Err(_) => return,
            }
        }
        eprintln!("[shortcut] 全局快捷键 {shortcut_str} 多次重试后仍未注册成功");
    });
}

pub fn run() {
    let state = AppState::new().expect("Failed to initialize database");
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            show_main_window(app);
        }))
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_fs::init())
        .manage(state)
        .manage(CurrentShortcut(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![
            commands::translate::translate,
            commands::history::get_history,
            commands::history::search_history,
            commands::history::add_history,
            commands::history::clear_history,
            commands::history::export_history_csv,
            commands::config::get_config,
            commands::config::save_config,
            commands::window::minimize_window,
            commands::window::toggle_maximize,
            commands::window::hide_window,
            commands::window::set_always_on_top,
            commands::window::register_shortcut,
        ])
        .setup(|app| {
            // Tray icon
            let show_item = MenuItem::with_id(app, "show", "打开主界面", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "退出软件", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_item, &quit_item])?;
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(move |app, event| match event.id().as_ref() {
                    "show" => show_main_window(app),
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        show_main_window(tray.app_handle());
                    }
                })
                .build(app)?;
            // 全局快捷键：启动即注册（早于 WebView 前端），失败则后台定时重试
            let app_handle = app.handle().clone();
            let stored_shortcut = app
                .state::<AppState>()
                .get_config_value("shortcut")
                .ok()
                .flatten()
                .filter(|s| !s.trim().is_empty())
                .unwrap_or_else(|| "Alt+T".to_string());
            match commands::window::register_if_unset(&app_handle, &stored_shortcut) {
                Ok(_) => eprintln!("[shortcut] 已注册全局快捷键: {stored_shortcut}"),
                Err(e) => {
                    eprintln!("[shortcut] 全局快捷键 {stored_shortcut} 注册失败: {e}，将每 10 秒重试（最多 5 次）");
                    spawn_shortcut_retry(app_handle, stored_shortcut);
                }
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let _ = window.hide();
                api.prevent_close();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
