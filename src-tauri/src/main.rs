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
use serde_json::{Value, Map};
use std::collections::HashMap;
use reqwest::{Client};
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use json::{JsonValue, JsonError};
use json_handler::make_json_request;
use urlencoded_handler::make_www_form_urlencoded_request;
use formdata_handler::make_formdata_request;

#[tokio::main]
async fn make_request(
    method: &str,
    url: &str,
    headers: &str,
    body: &str, 
    request_type: &str,
) -> String
{
    // Make a client
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

    let check = match request_type {
        "JSON" => make_json_request(request_builder, body).await,
        "URLENCODED" => make_www_form_urlencoded_request(request_builder, body).await,
        "FORMDATA" => make_formdata_request(request_builder, body).await,
        _ => make_json_request(request_builder, body).await,
    };
    
    let result_string = match check {
        Ok(value) => value,
        Err(err) => format!("Error: {:?}", err), 
    };
    println!("Result from async function: {:?}", result_string);
    return result_string;
}

#[tauri::command]
fn make_type_request_command(url: &str, method: &str, headers: &str, body: &str, request_type: &str) -> String {
    let result = make_request(method, url, headers, body, request_type);
    return result;
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
