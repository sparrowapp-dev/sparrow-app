//! # Module: HTTP Request Utilities
//!
//! This module provides utilities for handling response decoding and related operations.
//!
//! ## External Imports
//!
//! - `flate2::read::GzDecoder`: Gzip decompression for handling gzipped content.
//! - `brotli::Decompressor`: brotli(br) decompression for handling brotli encoded content.
//! - `reqwest::Response`: Represents an HTTP response in Reqwest.
//! - `std::io::{self, Read}`: Input/output operations and reading data.
//!
//! Example:
//!
//! ```rust
//! use flate2::read::GzDecoder;
//! use reqwest::Response;
//! use brotli::Decompressor;
//! use std::io::{self, Read};

use brotli::Decompressor;
use flate2::read::GzDecoder;
use reqwest::Response;
use std::io::{self, Read};

/// Decode the response body, handling gzipped and brotli content if necessary.
///
/// # Arguments
///
/// * `resp` - The HTTP response from which to decode the body.
///
/// # Returns
///
/// A `Result` containing the decoded body as a string if successful, or an `std::io::Error` if an error occurs.
///
/// # Examples
///
/// ```
/// # use reqwest::Response;
/// # use std::io::{self, Read};
/// # async fn example() {
/// # let resp = Response::default();
/// use decode_response_body;
///
/// let decoded_body = decode_response_body(resp).await;
/// match decoded_body {
///     Ok(body) => println!("Decoded body: {}", body),
///     Err(e) => eprintln!("Error decoding body: {}", e),
/// }
/// # }
/// # example().await;
/// ```
///
/// This function checks if the response is gzipped and decodes it if necessary, returning the decoded body as a string.
pub async fn decode_response_body(resp: Response) -> Result<String, std::io::Error> {
    let content_encoding = resp
        .headers()
        .get(reqwest::header::CONTENT_ENCODING)
        .and_then(|value| value.to_str().ok());

    if let Some(encoding) = content_encoding {
        if encoding.contains("gzip") {
            // Decompress the gzipped content
            let gzipped_bytes = resp.bytes().await.map_err(|e| {
                std::io::Error::new(
                    std::io::ErrorKind::Other,
                    format!("Error reading bytes: {}", e),
                )
            })?;
            let mut decoder = GzDecoder::new(&gzipped_bytes[..]);
            let mut decoded_html = String::new();
            decoder.read_to_string(&mut decoded_html).map_err(|e| {
                std::io::Error::new(
                    std::io::ErrorKind::Other,
                    format!("Error decompressing: {}", e),
                )
            })?;
            Ok(decoded_html)
        } else if encoding.contains("br") {
            // Decompress the brotli content
            let brotli_bytes = resp.bytes().await.map_err(|e| {
                std::io::Error::new(
                    std::io::ErrorKind::Other,
                    format!("Error reading bytes: {}", e),
                )
            })?;
            let mut decoder = Decompressor::new(&brotli_bytes[..], 4096);
            let mut decoded_html = String::new();
            decoder.read_to_string(&mut decoded_html).map_err(|e| {
                std::io::Error::new(
                    std::io::ErrorKind::Other,
                    format!("Error decompressing: {}", e),
                )
            })?;
            Ok(decoded_html)
        } else {
            // Unsupported encoding
            Err(std::io::Error::new(
                std::io::ErrorKind::InvalidData,
                "Unsupported encoding",
            ))
        }
    } else {
        // Read the response body as a string
        resp.text().await.map_err(|e| {
            std::io::Error::new(
                std::io::ErrorKind::Other,
                format!("Error reading response text: {}", e),
            )
        })
    }
}
