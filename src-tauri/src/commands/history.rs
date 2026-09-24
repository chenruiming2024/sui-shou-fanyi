use crate::services::db::AppState;
use serde::Serialize;
use tauri::State;

#[derive(Serialize)]
pub struct HistoryItem {
    pub id: i64,
    pub source_text: String,
    pub target_text: String,
    pub source_lang: String,
    pub target_lang: String,
    pub created_at: String,
}

#[tauri::command]
pub fn get_history(limit: Option<usize>, state: State<'_, AppState>) -> Result<Vec<HistoryItem>, String> {
    let limit = limit.unwrap_or(100);
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, source_text, target_text, source_lang, target_lang, created_at FROM translations ORDER BY id DESC LIMIT ?1").map_err(|e| e.to_string())?;
    let items = stmt.query_map([limit], |row| {
        Ok(HistoryItem { id: row.get(0)?, source_text: row.get(1)?, target_text: row.get(2)?, source_lang: row.get(3)?, target_lang: row.get(4)?, created_at: row.get(5)? })
    }).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect();
    Ok(items)
}

#[tauri::command]
pub fn search_history(keyword: String, state: State<'_, AppState>) -> Result<Vec<HistoryItem>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, source_text, target_text, source_lang, target_lang, created_at FROM translations WHERE source_text LIKE ?1 OR target_text LIKE ?1 ORDER BY id DESC LIMIT 50").map_err(|e| e.to_string())?;
    let escaped = keyword.replace('\\', "\\\\").replace('%', "\\%").replace('_', "\\_");
    let pattern = format!("%{}%", escaped);
    let items = stmt.query_map([&pattern], |row| {
        Ok(HistoryItem { id: row.get(0)?, source_text: row.get(1)?, target_text: row.get(2)?, source_lang: row.get(3)?, target_lang: row.get(4)?, created_at: row.get(5)? })
    }).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect();
    Ok(items)
}

#[tauri::command]
pub fn add_history(source_text: String, target_text: String, source_lang: String, target_lang: String, state: State<'_, AppState>) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("INSERT INTO translations (source_text, target_text, source_lang, target_lang) VALUES (?1, ?2, ?3, ?4)", rusqlite::params![source_text, target_text, source_lang, target_lang]).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM translations WHERE id NOT IN (SELECT id FROM translations ORDER BY id DESC LIMIT 500)", []).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn clear_history(state: State<'_, AppState>) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM translations", []).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn export_history_csv(state: State<'_, AppState>) -> Result<String, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT source_text, target_text, source_lang, target_lang, created_at FROM translations ORDER BY id DESC").map_err(|e| e.to_string())?;
    let mut csv = String::from("source_text,target_text,source_lang,target_lang,created_at\n");
    let rows = stmt.query_map([], |row| {
        Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?, row.get::<_, String>(2)?, row.get::<_, String>(3)?, row.get::<_, String>(4)?))
    }).map_err(|e| e.to_string())?;
    for row in rows {
        let (s, t, sl, tl, dt) = row.map_err(|e| e.to_string())?;
        csv.push_str(&format!("\"{}\",\"{}\",\"{}\",\"{}\",\"{}\"\n", s.replace('"', "\"\""), t.replace('"', "\"\""), sl, tl, dt));
    }
    Ok(csv)
}