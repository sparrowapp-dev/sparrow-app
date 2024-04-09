use std::io::Error;

use reqwest::{RequestBuilder, Response};

pub async fn make_without_body_request(request_builder: RequestBuilder) -> Result<Response, Error> {
    let response = request_builder.send().await;
    return match response {
        Ok(response) => Ok(response),
        Err(e) => Err(Error::new(
            std::io::ErrorKind::Other,
            format!("Error: {}", e),
        )),
    };
}
