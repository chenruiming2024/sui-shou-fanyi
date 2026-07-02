use crate::utils::sign;

const BAIDU_API_URL: &str = "https://fanyi-api.baidu.com/api/trans/vip/translate";

pub async fn translate(
    text: &str,
    appid: &str,
    secret_key: &str,
    from: &str,
    to: &str,
) -> Result<String, Box<dyn std::error::Error>> {
    let salt: String = (0..10).map(|_| (b'0' + rand::random::<u8>() % 10) as char).collect();
    let sign_str = sign::make_sign(appid, text, &salt, secret_key);
    let client = reqwest::Client::new();

    let form_data: Vec<(&str, String)> = vec![
        ("q", text.to_string()),
        ("from", from.to_string()),
        ("to", to.to_string()),
        ("appid", appid.to_string()),
        ("salt", salt),
        ("sign", sign_str),
    ];

    let resp = client
        .post(BAIDU_API_URL)
        .form(&form_data)
        .timeout(std::time::Duration::from_secs(10))
        .send()
        .await?;
    let data: serde_json::Value = resp.json().await?;

    if let Some(error_code) = data.get("error_code") {
        let msg = data
            .get("error_msg")
            .and_then(|v| v.as_str())
            .unwrap_or("未知错误");
        return Err(format!("百度翻译错误 [{}]: {}", error_code, msg).into());
    }

    let result = data
        .get("trans_result")
        .and_then(|v| v.as_array())
        .map(|arr| {
            arr.iter()
                .filter_map(|item| item.get("dst").and_then(|v| v.as_str()))
                .collect::<Vec<_>>()
                .join("\n")
        })
        .unwrap_or_default();

    Ok(result)
}
