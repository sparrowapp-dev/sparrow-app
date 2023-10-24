// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
mod json_handler;
mod urlencoded_handler;
mod formdata_handler;
use serde_json::Value;
use std::collections::HashMap;
use reqwest::Client;
use json::{JsonValue, JsonError};
use json_handler::make_json_request;
use urlencoded_handler::make_www_form_urlencoded_request;
use formdata_handler::make_formdata_request;
use serde_json::json;

#[tokio::main]
async fn make_request(
    url: &str,
    method: &str,
    headers: &str,
    body: &str, 
    request: &str,
) -> Result<Value, Box<dyn std::error::Error>>
{
    // Make a client
    println!("justocheck");
    let client = Client::new();
    // Convert the method string to reqwest::Method
    let reqwest_method = match method {
        "GET" => reqwest::Method::GET,
        "POST" => reqwest::Method::POST,
        "PUT" => reqwest::Method::PUT,
        "DELETE" => reqwest::Method::DELETE,
        // Add other HTTP methods as needed
        _ => reqwest::Method::GET,
    };
    
    // Convert header string into hashmap 
    let header_map: HashMap<_, _> = headers.split('&')
        .map(|s| {
            let mut parts = s.split('=');
            (parts.next().unwrap().to_owned(), parts.next().unwrap_or("").to_owned())
        })
        .collect();

    let mut request_builder = client.request(reqwest_method, url);

    // Add headers in request builder
    for (key, value) in header_map.iter() {
        request_builder = request_builder.header(key, value);
    }

    let check = match request {
        "JSON" => make_json_request(request_builder, body).await,
        "URLENCODED" => make_www_form_urlencoded_request(request_builder, body).await,
        "FORMDATA" => make_formdata_request(request_builder, body).await,
        _ => make_json_request(request_builder, body).await,
    };

    // Extracting Response Value
    let response_value = match check {
        Ok(value) => value,
        Err(err) => todo!("{}", err), 
    };

    // Extracting Headers, StatusCode & Response
    let headers = response_value.headers().clone();
    let status = response_value.status().clone();
    let response_text = response_value.text().await?;
    let headers_json: serde_json::Value = headers.iter().map(|(name, value)| {
        (name.to_string(), value.to_str().unwrap())
    }).collect();
    let response_json: serde_json::Value = serde_json::from_str(&response_text)?;

    // Combining all parameters
    let combined_json = json!({
        "headers": headers_json,
        "status": status.to_string(),
        "response": response_json
    });
    return Ok(combined_json);
}

#[tauri::command]
fn make_type_request_command(url: &str, method: &str, headers: &str, body: &str, request: &str) -> Value {
    let result = make_request( url, method, headers, body, request);
    let result_value = match result {
        Ok(value) => value,
        Err(err) => todo!("{}", err), 
    };
    return result_value;
}


fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            make_type_request_command,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
