use crate::services::db::AppState;
use std::collections::HashMap;
use tauri::State;

#[tauri::command]
pub fn get_config(state: State<'_, AppState>) -> Result<HashMap<String, String>, String> {
    let cfg = state.get_config().map_err(|e| e.to_string())?;
    let mut map = HashMap::new();
    for (k, v) in cfg.as_object().unwrap_or(&serde_json::Map::new()) {
        if let Some(s) = v.as_str() { map.insert(k.clone(), s.to_string()); }
    }
    Ok(map)
}

#[tauri::command]
pub fn save_config(appid: String, secret_key: String, state: State<'_, AppState>) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("INSERT OR REPLACE INTO config (key, value) VALUES (?1, ?2)", rusqlite::params!["appid", appid]).map_err(|e| e.to_string())?;
    conn.execute("INSERT OR REPLACE INTO config (key, value) VALUES (?1, ?2)", rusqlite::params!["secret_key", secret_key]).map_err(|e| e.to_string())?;
    Ok(())
}