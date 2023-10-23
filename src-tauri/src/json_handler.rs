use reqwest::{RequestBuilder, Response};
use serde_json::Value;

pub async fn make_json_request(
    request_builder: RequestBuilder,
    body: &str,
) -> Result<Response, Box<dyn std::error::Error>> {
    let v1: Value = serde_json::from_str(&body).unwrap();
    let resp = request_builder.json(&v1).send().await?;
    return Ok(resp);
}
