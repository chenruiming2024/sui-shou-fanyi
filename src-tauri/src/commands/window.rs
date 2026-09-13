use tauri::Manager;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState, Modifiers, Code};

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

#[tauri::command]
pub fn register_shortcut(app: tauri::AppHandle, shortcut_str: String) -> Result<(), String> {
    let shortcut = parse_shortcut_str(&shortcut_str)?;
    app.global_shortcut().unregister_all().map_err(|e| e.to_string())?;
    app.global_shortcut().on_shortcut(
        shortcut,
        |app, _shortcut, event| {
            if event.state == ShortcutState::Pressed {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        },
    ).map_err(|e| e.to_string())?;
    Ok(())
}
