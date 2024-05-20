//! # Module: HTTP Request Error Handling
//!
//! This module provides error handling utilities related to HTTP requests.
//!
//! ## External Imports
//!
//! - `std::io::Error`: Represents I/O errors.
//! - `reqwest::RequestBuilder`: Builder for constructing HTTP requests in Reqwest.
//! - `reqwest::Response`: Represents an HTTP response in Reqwest.
use std::io::Error;

use reqwest::{RequestBuilder, Response};

/// Makes an asynchronous HTTP request without a request body.
///
/// # Arguments
///
/// * `request_builder` - The `RequestBuilder` instance with method and URL set.
///
/// # Returns
///
/// A `Result` containing the HTTP response if successful, or an `Error` if the request fails.
///
/// # Examples
///
/// ```
/// use reqwest::Client;
/// use my_module::make_without_body_request;
///
/// #[tokio::main]
/// async fn main() {
///     let client = Client::new();
///     let request_builder = client.get("https://api.example.com");
///
///     let result = make_without_body_request(request_builder).await;
///     match result {
///         Ok(response) => println!("Response: {:?}", response),
///         Err(err) => eprintln!("Error: {}", err),
///     }
/// }
/// ```
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
