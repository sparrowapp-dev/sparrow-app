//! # Module: HTTP Request Utilities
//!
//! This module provides utilities for handling HTTP requests and related operations.
//!
//! ## External Imports
//!
//! - `std::io::Error`: Represents I/O errors.
//! - `reqwest::RequestBuilder`: Builder for constructing HTTP requests in Reqwest.
//! - `reqwest::Response`: Represents an HTTP response in Reqwest.
//! - `serde_json::Value`: Represents a JSON value in Serde JSON.
use reqwest::{RequestBuilder, Response};
use serde_json::Value;
use std::io::Error;

/// Checks if a given string is valid JSON.
///
/// # Arguments
///
/// * `input` - A string to check for valid JSON format.
///
/// # Returns
///
/// A boolean value indicating whether the input string is valid JSON (`true`) or not (`false`).
fn is_valid_json(input: &str) -> bool {
    match serde_json::from_str::<Value>(input) {
        // If parsing succeeds, it's valid JSON
        Ok(_) => true,
        // If parsing fails, it's not valid JSON
        Err(_) => false,
    }
}

/// Makes an asynchronous JSON request.
///
/// # Arguments
///
/// * `request_builder` - The `RequestBuilder` instance with method and URL set.
/// * `body` - A string representing the JSON body to include in the request.
///
/// # Returns
///
/// A `Result` containing the HTTP response if successful, or an `Error` if the request fails.
///
/// # Examples
///
/// ```
/// use reqwest::Client;
/// use my_module::make_json_request_v2;
///
/// #[tokio::main]
/// async fn main() {
///     let client = Client::new();
///     let request_builder = client.post("https://api.example.com");
///     let body = r#"{"key": "value"}"#;
///
///     let result = make_json_request_v2(request_builder, body).await;
///     match result {
///         Ok(response) => println!("Response: {:?}", response),
///         Err(err) => eprintln!("Error: {}", err),
///     }
/// }
/// ```
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
