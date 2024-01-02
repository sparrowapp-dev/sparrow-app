use reqwest::{RequestBuilder, Response};

pub async fn make_text_request(
    request_builder: RequestBuilder,
    body: &str,
) -> Result<Response, std::io::Error> {
    let value = body.to_string();
    let resp = request_builder.body(value).send().await;
    return match resp {
        Ok(response) => Ok(response),
        Err(e) => Err(std::io::Error::new(
            std::io::ErrorKind::Other,
            format!("Error: {}", e),
        )),
    };
}
