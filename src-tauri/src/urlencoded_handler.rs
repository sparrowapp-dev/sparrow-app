use reqwest::RequestBuilder;
use std::error::Error;
use std::collections::HashMap;

pub async fn make_www_form_urlencoded_request(
    request_builder: RequestBuilder,
    body: &str,
) -> Result<String, Box<dyn Error>> {
    let body_map: HashMap<_, _> = body.split('&')
        .map(|s| {
            let mut parts = s.split('=');
            (parts.next().unwrap().to_owned(), parts.next().unwrap_or("").to_owned())
        })
        .collect();
    let resp = request_builder.form(&body_map).send().await?.text().await?;
    Ok(resp)
}