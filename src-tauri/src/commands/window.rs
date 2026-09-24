use std::sync::Mutex;
use tauri::Manager;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState, Modifiers, Code, ShortcutEvent};
use crate::services::db::AppState;

/// 主键名 -> Code，大小写不敏感（"T"/"KeyT"/"t" 等价）。
fn key_code_of(key_part: &str) -> Option<Code> {
    let k = key_part.to_uppercase();
    Some(match k.as_str() {
        // Single letters
        "A" | "KEYA" => Code::KeyA, "B" | "KEYB" => Code::KeyB, "C" | "KEYC" => Code::KeyC,
        "D" | "KEYD" => Code::KeyD, "E" | "KEYE" => Code::KeyE, "F" | "KEYF" => Code::KeyF,
        "G" | "KEYG" => Code::KeyG, "H" | "KEYH" => Code::KeyH, "I" | "KEYI" => Code::KeyI,
        "J" | "KEYJ" => Code::KeyJ, "K" | "KEYK" => Code::KeyK, "L" | "KEYL" => Code::KeyL,
        "M" | "KEYM" => Code::KeyM, "N" | "KEYN" => Code::KeyN, "O" | "KEYO" => Code::KeyO,
        "P" | "KEYP" => Code::KeyP, "Q" | "KEYQ" => Code::KeyQ, "R" | "KEYR" => Code::KeyR,
        "S" | "KEYS" => Code::KeyS, "T" | "KEYT" => Code::KeyT, "U" | "KEYU" => Code::KeyU,
        "V" | "KEYV" => Code::KeyV, "W" | "KEYW" => Code::KeyW, "X" | "KEYX" => Code::KeyX,
        "Y" | "KEYY" => Code::KeyY, "Z" | "KEYZ" => Code::KeyZ,
        // Digits
        "0" | "DIGIT0" => Code::Digit0, "1" | "DIGIT1" => Code::Digit1,
        "2" | "DIGIT2" => Code::Digit2, "3" | "DIGIT3" => Code::Digit3,
        "4" | "DIGIT4" => Code::Digit4, "5" | "DIGIT5" => Code::Digit5,
        "6" | "DIGIT6" => Code::Digit6, "7" | "DIGIT7" => Code::Digit7,
        "8" | "DIGIT8" => Code::Digit8, "9" | "DIGIT9" => Code::Digit9,
        // Function keys
        "F1" => Code::F1, "F2" => Code::F2, "F3" => Code::F3, "F4" => Code::F4,
        "F5" => Code::F5, "F6" => Code::F6, "F7" => Code::F7, "F8" => Code::F8,
        "F9" => Code::F9, "F10" => Code::F10, "F11" => Code::F11, "F12" => Code::F12,
        // Other keys
        "ESCAPE" => Code::Escape, "TAB" => Code::Tab, "SPACE" => Code::Space,
        "ENTER" => Code::Enter, "BACKSPACE" => Code::Backspace, "DELETE" => Code::Delete,
        "ARROWUP" => Code::ArrowUp, "ARROWDOWN" => Code::ArrowDown,
        "ARROWLEFT" => Code::ArrowLeft, "ARROWRIGHT" => Code::ArrowRight,
        "HOME" => Code::Home, "END" => Code::End, "PAGEUP" => Code::PageUp,
        "PAGEDOWN" => Code::PageDown, "INSERT" => Code::Insert,
        _ => return None,
    })
}

/// 解析 "Alt+T" 形式的快捷键字符串。错误信息面向用户，按原因分类：
/// 格式错误 / 缺少修饰键 / 不支持的修饰键 / 不支持的按键。
///
/// 强制要求至少一个修饰键：Windows 的 RegisterHotKey 对无修饰键的热键是全系统独占的，
/// 一旦注册裸键（如 "T"），其他程序里就敲不出这个键，且该值会持久化到每次启动重新注册。
fn parse_shortcut_str(s: &str) -> Result<Shortcut, String> {
    let trimmed = s.trim();
    if trimmed.is_empty() {
        return Err("快捷键为空".to_string());
    }
    let parts: Vec<&str> = trimmed.split('+').map(|p| p.trim()).collect();
    let key_part = match parts.last() {
        Some(k) if !k.is_empty() => *k,
        _ => return Err(format!("快捷键格式不正确：{}", s)),
    };

    let mut modifiers = Modifiers::empty();
    for raw in &parts[..parts.len() - 1] {
        match raw.to_lowercase().as_str() {
            "ctrl" | "control" | "cmdorctrl" | "commandorcontrol" => modifiers |= Modifiers::CONTROL,
            "shift" => modifiers |= Modifiers::SHIFT,
            "alt" | "option" => modifiers |= Modifiers::ALT,
            "meta" | "super" | "win" | "windows" => modifiers |= Modifiers::META,
            "" => return Err(format!("快捷键格式不正确：{}", s)),
            other => {
                return Err(format!(
                    "不支持的修饰键：{}（可用 Ctrl / Shift / Alt / Win）",
                    other
                ))
            }
        }
    }
    if modifiers.is_empty() {
        return Err(format!(
            "快捷键 {} 缺少修饰键：请至少搭配 Ctrl / Shift / Alt / Win 之一",
            key_part
        ));
    }

    // 修饰键齐备后优先交给插件解析（覆盖标点、小键盘等更多主键写法）
    if let Ok(shortcut) = trimmed.parse::<Shortcut>() {
        return Ok(shortcut);
    }
    // 插件不认识 Meta/Win 等别名时走显式映射，保证错误信息可读
    let key_code = key_code_of(key_part)
        .ok_or_else(|| format!("不支持的按键：{}（建议字母、数字、F1-F12 或方向键）", key_part))?;
    Ok(Shortcut::new(Some(modifiers), key_code))
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

/// 注册热键。此处失败只剩"已被占用 / 系统拒绝"一类原因，解析类错误在 parse_shortcut_str 已拦下。
fn register_new(app: &tauri::AppHandle, new_shortcut: Shortcut, label: &str) -> Result<(), String> {
    app.global_shortcut()
        .on_shortcut(new_shortcut, handle_shortcut_event)
        .map_err(|_| format!("快捷键 {} 注册失败，可能已被其他程序占用", label))
}

/// 注册新快捷键并替换旧注册；新键注册失败时旧键保持不变。
pub fn set_shortcut(app: &tauri::AppHandle, shortcut_str: &str) -> Result<(), String> {
    let new_shortcut = parse_shortcut_str(shortcut_str)?;
    let state = app.state::<CurrentShortcut>();
    let mut current = state.0.lock().map_err(|e| e.to_string())?;
    if current.as_ref() == Some(&new_shortcut) {
        return Ok(());
    }
    register_new(app, new_shortcut, shortcut_str)?;
    if let Some(old) = current.take() {
        // 旧键没注销掉会和新键同时触发作切换，留痕便于排查
        if let Err(e) = app.global_shortcut().unregister(old) {
            eprintln!("[shortcut] 旧快捷键注销失败（可能与新键同时生效）: {e}");
        }
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
    register_new(app, new_shortcut, shortcut_str)?;
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
