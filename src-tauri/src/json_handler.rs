use reqwest::RequestBuilder;
use serde_json::Value;


pub async fn make_json_request(
    request_builder: RequestBuilder,
    body: &str,
) -> Result<String, Box<dyn std::error::Error>> {
    let v1: Value = serde_json::from_str(&body).unwrap();
    let resp: String = request_builder.json(&v1).send().await?.text().await?;
    Ok(resp)
}
