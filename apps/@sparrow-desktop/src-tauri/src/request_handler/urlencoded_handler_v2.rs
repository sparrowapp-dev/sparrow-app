//! # Module: HTTP Request Utilities
//!
//! This module provides utilities for handling HTTP requests and related operations.
//!
//! ## External Imports
//!
//! - `reqwest::RequestBuilder`: Builder for constructing HTTP requests in Reqwest.
//! - `reqwest::Response`: Represents an HTTP response in Reqwest.
//! - `serde::{Deserialize, Serialize}`: Serialization and deserialization support with Serde.
//! - `std::collections::HashMap`: Represents a hash map for key-value data storage.
use reqwest::{RequestBuilder, Response};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
#[derive(Debug, Deserialize, Serialize)]
struct KeyValue {
    key: String,
    value: String,
    checked: bool,
}

/// Makes an asynchronous application/x-www-form-urlencoded request.
///
/// # Arguments
///
/// * `request_builder` - The `RequestBuilder` instance with method and URL set.
/// * `body` - A JSON string representing the form data to include in the request.
///
/// # Returns
///
/// A `Result` containing the HTTP response if successful, or an `std::io::Error` if the request fails.
///
/// # Examples
///
/// ```
/// use reqwest::Client;
/// use my_module::make_www_form_urlencoded_request_v2;
///
/// #[tokio::main]
/// async fn main() {
///     let client = Client::new();
///     let request_builder = client.post("https://api.example.com");
///     let body = r#"[{"key": "field1", "value": "value1"}, {"key": "field2", "value": "value2"}]"#;
///
///     let result = make_www_form_urlencoded_request_v2(request_builder, body).await;
///     match result {
///         Ok(response) => println!("Response: {:?}", response),
///         Err(err) => eprintln!("Error: {}", err),
///     }
/// }
/// ```
pub async fn make_www_form_urlencoded_request_v2(
    request_builder: RequestBuilder,
    body: &str,
) -> Result<Response, std::io::Error> {
    // Deserialize the JSON string into a Vec<KeyValue>
    let valid_body: Vec<KeyValue> = serde_json::from_str(&body).unwrap();

    // Create a HashMap to store key-value pairs
    let mut key_value_body_map: HashMap<String, String> = HashMap::new();

    // Iterate over key_values and add key-value pairs to the map
    for kv in valid_body {
        key_value_body_map.insert(kv.key, kv.value);
    }
    let resp = request_builder.form(&key_value_body_map).send().await;
    return match resp {
        Ok(response) => Ok(response),
        Err(e) => Err(std::io::Error::new(
            std::io::ErrorKind::Other,
            format!("Error: {}", e),
        )),
    };
}
