// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
use std::error::Error;
use serde_json::Value;
use std::collections::HashMap;
#[tauri::command]
fn make_http_request_command(url: String, headers: HashMap<String, String>) -> String {
    // You can call an async function from here
    let result = make_http_request(url, headers);
    let result_string = match result {
        Ok(value) => value,
        Err(err) => format!("Error: {:?}", err), // Handle the error case here
    };
    println!("Result from async function: {:?}", result_string);
    return result_string;
}

#[tokio::main]
async fn make_http_request(url: String, headers: HashMap<String, String>) -> Result<String, Box<dyn Error>> {
    let client = reqwest::Client::new();
    let mut request = client.get(url);
    for (key, value) in headers.iter() {
        request = request.header(key, value);
    }
    let resp = request.send()
    .await?
    .text()
    .await?;
println!("{:#?}", resp);
Ok(resp)
}


#[tauri::command]
fn make_post_http_request_command(url: String, body: serde_json::Value, headers: HashMap<String, String>) -> String {
    // You can call an async function from here
    let result = make_post_http_request(url, body, headers);
    let result_string = match result {
        Ok(value) => value,
        Err(err) => format!("Error: {:?}", err), // Handle the error case here
    };
    println!("Result from async function: {:?}", result_string);
    return result_string;
}

#[tokio::main]
async fn make_post_http_request(url: String, body: serde_json::Value, headers: HashMap<String, String>) -> Result<String, Box<dyn Error>> {
    let client = reqwest::Client::new();
    let mut request = client.post(url);
    for (key, value) in headers.iter() {
        request = request.header(key, value);
    }
    let resp = request.json(&body)
        .send()
        .await?
        .text()
        .await?;
println!("{:#?}", resp);
Ok(resp)
}

#[tauri::command]
fn make_put_http_request_command(url: String, body: serde_json::Value, headers: HashMap<String, String>) -> String {
    let result = make_put_http_request(url, body, headers);
    let result_string = match result {
        Ok(value) => value,
        Err(err) => format!("Error: {:?}", err),
    };
    println!("Result from async function: {:?}", result_string);
    return result_string;
}

#[tokio::main]
async fn make_put_http_request(url: String, body: serde_json::Value, headers: HashMap<String, String>) -> Result<String, Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    
    let mut request = client.put(url);
    for (key, value) in headers.iter() {
        request = request.header(key, value);
    }
    let resp = request.json(&body)
        .send()
        .await?
        .text()
        .await?;
    
    println!("{:#?}", resp);
    Ok(resp)
}


#[tauri::command]
fn make_delete_http_request_command(url: String, headers: HashMap<String, String>) -> String {
    let result = make_delete_http_request(url, headers);
    let result_string = match result {
        Ok(value) => value,
        Err(err) => format!("Error: {:?}", err),
    };
    println!("Result from async function: {:?}", result_string);
    return result_string;
}

#[tokio::main]
async fn make_delete_http_request(url: String, headers: HashMap<String, String>) -> Result<String, Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    let mut request = client.delete(url);

    for (key, value) in headers.iter() {
        request = request.header(key, value);
    }
    
    let resp = request.send().await?.text().await?;
    
    println!("{:#?}", resp);
    Ok(resp)

    
}





fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet,make_http_request_command, make_post_http_request_command, make_put_http_request_command, make_delete_http_request_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
