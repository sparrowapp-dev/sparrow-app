use std::io::Error;

use reqwest::{RequestBuilder, Response};
use serde_json::Value;

// Function to check if a given string is valid JSON
fn is_valid_json(input: &str) -> bool {
    match serde_json::from_str::<Value>(input) {
        // If parsing succeeds, it's valid JSON
        Ok(_) => true,
        // If parsing fails, it's not valid JSON
        Err(_) => false,
    }
}

// Asynchronous function to make a JSON request
pub async fn make_json_request_v2(
    request_builder: RequestBuilder,
    body: &str,
) -> Result<Response, Error> {
    let response;
    // Check if the provided body is valid JSON
    if is_valid_json(body) {
        // Parse the body as valid JSON
        let valid_json: Value = serde_json::from_str(&body).unwrap();
        response = request_builder.json(&valid_json).send().await;
    } else {
        response = request_builder.json(&body).send().await;
    }
    // Return the result of the request
    return match response {
        Ok(response) => Ok(response),
        Err(e) => Err(Error::new(
            std::io::ErrorKind::Other,
            format!("Error: {}", e),
        )),
    };
}
