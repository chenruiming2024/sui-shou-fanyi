use crate::services::baidu_api;
use crate::services::db::AppState;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Deserialize)]
pub struct TranslateRequest {
    pub text: String,
    pub from: String,
    pub to: String,
}

#[derive(Serialize)]
pub struct TranslateResult {
    pub result: String,
    pub elapsed_ms: u64,
}

#[tauri::command]
pub async fn translate(req: TranslateRequest, state: State<'_, AppState>) -> Result<TranslateResult, String> {
    let cfg = state.get_config().map_err(|e| e.to_string())?;
    let appid = cfg.get("appid").and_then(|v| v.as_str()).unwrap_or("");
    let secret_key = cfg.get("secret_key").and_then(|v| v.as_str()).unwrap_or("");
    if appid.is_empty() || secret_key.is_empty() {
        return Err("请先配置百度翻译 API".into());
    }
    let start = std::time::Instant::now();
    let result = baidu_api::translate(&req.text, appid, secret_key, &req.from, &req.to)
        .await
        .map_err(|e| e.to_string())?;
    let elapsed = start.elapsed().as_millis() as u64;
    Ok(TranslateResult { result, elapsed_ms: elapsed })
}
