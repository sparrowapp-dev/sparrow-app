use crate::config::Config;
use reqwest::Client;
use serde_json::json;
use serde_json::Value;
use std::collections::HashMap;
#[tokio::main]
pub async fn import_swagger_url(
    url: &str,
    headers: &str,
    workspaceid: &str,
) -> Result<Value, Box<dyn std::error::Error>> {
    let config = Config::new();
    let client = Client::new();
    let response = client.get(url).send().await?;
    let body = response.text().await?;
    let body_json: serde_json::Value = serde_json::from_str(&body)?;
    let posturl = format!(
        "{}/api/workspace/{}/importJson/collection",
        config.api_url, workspaceid
    );
    let header_map: HashMap<_, _> = headers
        .split('&')
        .map(|s| {
            let mut parts = s.split('=');
            (
                parts.next().unwrap().to_owned(),
                parts.next().unwrap_or("").to_owned(),
            )
        })
        .collect();
    let mut request_builder = client.request(reqwest::Method::POST, posturl);
    for (key, value) in header_map.iter() {
        request_builder = request_builder.header(key, value);
    }
    let resp = request_builder.json(&body_json).send().await?;
    let response_headers = resp.headers().clone();
    let response_status = resp.status().clone();
    let response_value = resp.text().await?;
    let headers_json: serde_json::Value = response_headers
        .iter()
        .map(|(name, value)| (name.to_string(), value.to_str().unwrap()))
        .collect();
    let response_value_json: serde_json::Value = serde_json::from_str(&response_value)?;
    let combined_json = json!({
        "headers": headers_json,
        "status": response_status.to_string(),
        "response": response_value_json
    });
    return Ok(combined_json);
}
