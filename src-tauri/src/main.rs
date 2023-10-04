// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
use std::error::Error;

#[tauri::command]
fn make_http_request_command(url: String) -> String {
    // You can call an async function from here
    let result = make_http_request(url);
    let result_string = match result {
        Ok(value) => value,
        Err(err) => format!("Error: {:?}", err), // Handle the error case here
    };
    println!("Result from async function: {:?}", result_string);
    return result_string;
}

#[tokio::main]
async fn make_http_request(url: String) -> Result<String, Box<dyn Error>> {
    let resp = reqwest::get(url)
    .await?
    .text()
    .await?;
println!("{:#?}", resp);
Ok(resp)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet,make_http_request_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
