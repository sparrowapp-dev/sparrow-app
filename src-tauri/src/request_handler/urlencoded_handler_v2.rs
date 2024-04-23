use reqwest::{RequestBuilder, Response};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
#[derive(Debug, Deserialize, Serialize)]
struct KeyValue {
    key: String,
    value: String,
    checked: bool,
}

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
