use std::sync::Mutex;
use tauri::Manager;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState, Modifiers, Code, ShortcutEvent};
use crate::services::db::AppState;

fn parse_shortcut_str(s: &str) -> Result<Shortcut, String> {
    // Try standard parse first
    if let Ok(shortcut) = s.parse::<Shortcut>() {
        return Ok(shortcut);
    }

    // Custom parse: "Alt+T" or "Alt+KeyT" style
    let parts: Vec<&str> = s.split('+').collect();
    if parts.is_empty() {
        return Err("Empty shortcut".to_string());
    }

    let key_part = parts.last().unwrap();
    let key_code = match *key_part {
        // Single letters
        "A" | "KeyA" => Code::KeyA, "B" | "KeyB" => Code::KeyB, "C" | "KeyC" => Code::KeyC,
        "D" | "KeyD" => Code::KeyD, "E" | "KeyE" => Code::KeyE, "F" | "KeyF" => Code::KeyF,
        "G" | "KeyG" => Code::KeyG, "H" | "KeyH" => Code::KeyH, "I" | "KeyI" => Code::KeyI,
        "J" | "KeyJ" => Code::KeyJ, "K" | "KeyK" => Code::KeyK, "L" | "KeyL" => Code::KeyL,
        "M" | "KeyM" => Code::KeyM, "N" | "KeyN" => Code::KeyN, "O" | "KeyO" => Code::KeyO,
        "P" | "KeyP" => Code::KeyP, "Q" | "KeyQ" => Code::KeyQ, "R" | "KeyR" => Code::KeyR,
        "S" | "KeyS" => Code::KeyS, "T" | "KeyT" => Code::KeyT, "U" | "KeyU" => Code::KeyU,
        "V" | "KeyV" => Code::KeyV, "W" | "KeyW" => Code::KeyW, "X" | "KeyX" => Code::KeyX,
        "Y" | "KeyY" => Code::KeyY, "Z" | "KeyZ" => Code::KeyZ,
        // Digits
        "0" | "Digit0" => Code::Digit0, "1" | "Digit1" => Code::Digit1,
        "2" | "Digit2" => Code::Digit2, "3" | "Digit3" => Code::Digit3,
        "4" | "Digit4" => Code::Digit4, "5" | "Digit5" => Code::Digit5,
        "6" | "Digit6" => Code::Digit6, "7" | "Digit7" => Code::Digit7,
        "8" | "Digit8" => Code::Digit8, "9" | "Digit9" => Code::Digit9,
        // Function keys
        "F1" => Code::F1, "F2" => Code::F2, "F3" => Code::F3, "F4" => Code::F4,
        "F5" => Code::F5, "F6" => Code::F6, "F7" => Code::F7, "F8" => Code::F8,
        "F9" => Code::F9, "F10" => Code::F10, "F11" => Code::F11, "F12" => Code::F12,
        // Other keys
        "Escape" => Code::Escape, "Tab" => Code::Tab, "Space" => Code::Space,
        "Enter" => Code::Enter, "Backspace" => Code::Backspace, "Delete" => Code::Delete,
        "ArrowUp" => Code::ArrowUp, "ArrowDown" => Code::ArrowDown,
        "ArrowLeft" => Code::ArrowLeft, "ArrowRight" => Code::ArrowRight,
        "Home" => Code::Home, "End" => Code::End, "PageUp" => Code::PageUp,
        "PageDown" => Code::PageDown, "Insert" => Code::Insert,
        _ => return Err(format!("Unsupported key: {}", key_part)),
    };

    let mut modifiers = Modifiers::empty();
    for part in &parts[..parts.len() - 1] {
        match part.to_lowercase().as_str() {
            "ctrl" | "control" => modifiers |= Modifiers::CONTROL,
            "shift" => modifiers |= Modifiers::SHIFT,
            "alt" => modifiers |= Modifiers::ALT,
            "meta" | "super" => modifiers |= Modifiers::META,
            _ => {}
        }
    }

    let modifier_opt = if modifiers.is_empty() { None } else { Some(modifiers) };
    Ok(Shortcut::new(modifier_opt, key_code))
}

#[tauri::command]
pub fn minimize_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(w) = app.get_webview_window("main") {
        w.minimize().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn toggle_maximize(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(w) = app.get_webview_window("main") {
        if w.is_maximized().unwrap_or(false) {
            w.unmaximize().map_err(|e| e.to_string())?;
        } else {
            w.maximize().map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[tauri::command]
pub fn hide_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(w) = app.get_webview_window("main") {
        w.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn set_always_on_top(app: tauri::AppHandle, always_on_top: bool) -> Result<(), String> {
    if let Some(w) = app.get_webview_window("main") {
        w.set_always_on_top(always_on_top).map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// 当前已注册的全局快捷键（应用内只维护这一个）。
pub struct CurrentShortcut(pub Mutex<Option<Shortcut>>);

fn handle_shortcut_event(app: &tauri::AppHandle, _shortcut: &Shortcut, event: ShortcutEvent) {
    if event.state == ShortcutState::Pressed {
        crate::toggle_main_window(app);
    }
}

fn register_new(app: &tauri::AppHandle, new_shortcut: Shortcut) -> Result<(), String> {
    app.global_shortcut()
        .on_shortcut(new_shortcut, handle_shortcut_event)
        .map_err(|e| format!("注册失败，快捷键可能已被其他程序占用: {e}"))
}

/// 注册新快捷键并替换旧注册；新键注册失败时旧键保持不变。
pub fn set_shortcut(app: &tauri::AppHandle, shortcut_str: &str) -> Result<(), String> {
    let new_shortcut = parse_shortcut_str(shortcut_str)?;
    let state = app.state::<CurrentShortcut>();
    let mut current = state.0.lock().map_err(|e| e.to_string())?;
    if current.as_ref() == Some(&new_shortcut) {
        return Ok(());
    }
    register_new(app, new_shortcut)?;
    if let Some(old) = current.take() {
        let _ = app.global_shortcut().unregister(old);
    }
    *current = Some(new_shortcut);
    Ok(())
}

/// 仅当尚未注册任何快捷键时才注册（启动 / 重试路径），已注册时返回 Ok(false)。
pub fn register_if_unset(app: &tauri::AppHandle, shortcut_str: &str) -> Result<bool, String> {
    let new_shortcut = parse_shortcut_str(shortcut_str)?;
    let state = app.state::<CurrentShortcut>();
    let mut current = state.0.lock().map_err(|e| e.to_string())?;
    if current.is_some() {
        return Ok(false);
    }
    register_new(app, new_shortcut)?;
    *current = Some(new_shortcut);
    Ok(true)
}

#[tauri::command]
pub fn register_shortcut(app: tauri::AppHandle, shortcut_str: String) -> Result<(), String> {
    set_shortcut(&app, &shortcut_str)?;
    // 注册成功后持久化到 config 表，下次启动由 Rust 侧直接注册
    let db = app.state::<AppState>();
    if let Err(e) = db.set_config_value("shortcut", &shortcut_str) {
        eprintln!("[shortcut] 快捷键持久化失败: {e}");
    }
    Ok(())
}
