pub fn make_sign(appid: &str, query: &str, salt: &str, secret_key: &str) -> String {
    let input = format!("{}{}{}{}", appid, query, salt, secret_key);
    let digest = md5::compute(input.as_bytes());
    format!("{:x}", digest)
}