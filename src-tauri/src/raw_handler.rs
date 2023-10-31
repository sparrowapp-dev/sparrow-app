use reqwest::{RequestBuilder, Response};

pub async fn make_text_request(
    request_builder: RequestBuilder,
    body: &str,
) -> Result<Response, Box<dyn std::error::Error>> {
    let value = body.to_string();
    let resp = request_builder.body(value).send().await?;
    return Ok(resp);
}
