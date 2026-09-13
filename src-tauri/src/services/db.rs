use rusqlite::Connection;
use std::sync::Mutex;

pub struct AppState {
    pub conn: Mutex<Connection>,
}

impl AppState {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let db_path = dirs_next::data_dir()
            .unwrap_or_else(|| std::path::PathBuf::from("."))
            .join("sui-shou-fanyi");
        std::fs::create_dir_all(&db_path)?;
        let conn = Connection::open(db_path.join("data.db"))?;
        conn.execute_batch("
            CREATE TABLE IF NOT EXISTS translations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_text TEXT NOT NULL,
                target_text TEXT NOT NULL,
                source_lang TEXT DEFAULT 'auto',
                target_lang TEXT DEFAULT 'zh',
                created_at TEXT DEFAULT (datetime('now','localtime'))
            );
            CREATE TABLE IF NOT EXISTS config (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
        ")?;
        Ok(AppState { conn: Mutex::new(conn) })
    }

    pub fn get_config(&self) -> Result<serde_json::Value, Box<dyn std::error::Error>> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        let mut stmt = conn.prepare("SELECT key, value FROM config")?;
        let mut map = serde_json::Map::new();
        let rows = stmt.query_map([], |row| Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?)))?;
        for row in rows {
            let (k, v) = row?;
            map.insert(k, serde_json::Value::String(v));
        }
        Ok(serde_json::Value::Object(map))
    }

    pub fn get_config_value(&self, key: &str) -> Result<Option<String>, Box<dyn std::error::Error>> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        let mut stmt = conn.prepare("SELECT value FROM config WHERE key = ?1")?;
        let mut rows = stmt.query_map([key], |row| row.get::<_, String>(0))?;
        Ok(rows.next().transpose()?)
    }

    pub fn set_config_value(&self, key: &str, value: &str) -> Result<(), Box<dyn std::error::Error>> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        conn.execute(
            "INSERT OR REPLACE INTO config (key, value) VALUES (?1, ?2)",
            rusqlite::params![key, value],
        )?;
        Ok(())
    }
}