use reqwest::{RequestBuilder, Response};
use std::collections::HashMap;

pub async fn make_www_form_urlencoded_request(
    request_builder: RequestBuilder,
    body: &str,
) -> Result<Response, std::io::Error> {
    let body_map: HashMap<_, _> = body
        .split("[SPARROW_AMPERSAND]")
        .map(|s| {
            let mut parts = s.split("[SPARROW_EQUALS]");
            (
                parts.next().unwrap().to_owned(),
                parts.next().unwrap_or("").to_owned(),
            )
        })
        .collect();
    let resp = request_builder.form(&body_map).send().await;
    return match resp {
        Ok(response) => Ok(response),
        Err(e) => Err(std::io::Error::new(
            std::io::ErrorKind::Other,
            format!("Error: {}", e),
        )),
    };
}
