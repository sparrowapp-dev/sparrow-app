use reqwest::multipart;
use reqwest::{Body, RequestBuilder, Response};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{collections::HashMap, path::Path};
use tokio::fs::File;
use tokio_util::codec::{BytesCodec, FramedRead};

fn extract_filename(path_str: &str) -> Option<String> {
    // Use the Path struct to parse the string as a path and extract the file name
    return Path::new(path_str)
        .file_name() // Extracts the file name component
        .and_then(|name| name.to_str()) // Converts the OsStr to a &str
        .map(|name| name.to_owned()); // Converts the &str to a String
}

#[derive(Debug, Deserialize, Serialize)]
struct KeyValue {
    key: String,
    value: String,
    checked: bool,
    base: Option<String>,
}

pub async fn make_formdata_request_v2(
    request_builder: RequestBuilder,
    body: &str,
) -> Result<Response, std::io::Error> {
    let mut form = reqwest::multipart::Form::new();

    // Parse the JSON string into a serde_json::Value
    let valid_body: Value = serde_json::from_str(body)?;

    // Check if the parsed value is an array
    if let Value::Array(arr) = valid_body {
        // Iterate over each element in the array
        for elem in arr {
            // Extract key, value, and base if present
            if let Value::Object(obj) = elem {
                let key = obj
                    .get("key")
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string();
                let value = obj
                    .get("value")
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string();
                let base = obj
                    .get("base")
                    .and_then(|v| v.as_str())
                    .map(|s| s.to_string());

                // Use key, value, and base within this scope
                match base {
                    // Check if the 'base' field is present
                    Some(base_val) => {
                        // Open the file asynchronously using the base value
                        let file_result = File::open(format!(r"{}", base_val)).await;
                        let file = match file_result {
                            // Handle successful file opening
                            Ok(file) => file,
                            Err(e) => {
                                return Err(std::io::Error::new(
                                    std::io::ErrorKind::Other,
                                    format!("Error: {}", e),
                                ))
                            }
                        };
                        // Extract the filename from the base value
                        let filename = match extract_filename(&base_val) {
                            // Use the extracted filename if available
                            Some(file_name) => file_name,
                            // Use a default filename if extraction fails
                            None => "file".to_string(),
                        };
                        // Create a stream from the file content
                        let stream = FramedRead::new(file, BytesCodec::new());
                        let file_body = Body::wrap_stream(stream);
                        // Create a multipart file part with the filename
                        let file_part = multipart::Part::stream(file_body).file_name(filename);
                        // Add the file part to the form
                        form = form.part(key, file_part);
                    }
                    // If the 'base' field is not present, add a text value to the form
                    None => form = form.text(key, value),
                }
            }
        }
    }

    let resp = request_builder.multipart(form).send().await;
    return match resp {
        Ok(response) => Ok(response),
        Err(e) => Err(std::io::Error::new(
            std::io::ErrorKind::Other,
            format!("Error: {}", e),
        )),
    };
}
