// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
use serde_json::Value;
use std::collections::HashMap;
use std::error::Error;
use reqwest::{Client, Url, multipart};
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;
use std::fs;
use regex::Regex; 
use std::borrow::Cow;
// JSON Data Requests

#[tauri::command]
fn make_get_http_request_command(
    url: String,
    headers: HashMap<String, String>,
    body: serde_json::Value,
) -> String {
    // You can call an async function from here
    let result = make_get_http_request(url, headers);
    let result_string = match result {
        Ok(value) => value,
        Err(err) => format!("Error: {:?}", err), // Handle the error case here
    };
    println!("Result from async function: {:?}", result_string);
    return result_string;
}

#[tokio::main]
async fn make_get_http_request(
    url: String,
    headers: HashMap<String, String>,
) -> Result<String, Box<dyn Error>> {
    let client = reqwest::Client::new();
    let mut request = client.get(url);
    for (key, value) in headers.iter() {
        request = request.header(key, value);
    }
    let resp = request.send().await?.text().await?;
    println!("{:#?}", resp);
    Ok(resp)
}

#[tauri::command]
fn make_post_http_request_command(
    url: String,
    body: serde_json::Value,
    headers: HashMap<String, String>,
) -> String {
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
async fn make_post_http_request(
    url: String,
    body: serde_json::Value,
    headers: HashMap<String, String>,
) -> Result<String, Box<dyn Error>> {
    let client = reqwest::Client::new();
    let mut request = client.post(url);
    for (key, value) in headers.iter() {
        request = request.header(key, value);
    }
    let resp = request.json(&body).send().await?.text().await?;
    println!("{:#?}", resp);
    Ok(resp)
}

#[tauri::command]
fn make_put_http_request_command(
    url: String,
    body: serde_json::Value,
    headers: HashMap<String, String>,
) -> String {
    let result = make_put_http_request(url, body, headers);
    let result_string = match result {
        Ok(value) => value,
        Err(err) => format!("Error: {:?}", err),
    };
    println!("Result from async function: {:?}", result_string);
    return result_string;
}

#[tokio::main]
async fn make_put_http_request(
    url: String,
    body: serde_json::Value,
    headers: HashMap<String, String>,
) -> Result<String, Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();

    let mut request = client.put(url);
    for (key, value) in headers.iter() {
        request = request.header(key, value);
    }
    let resp = request.json(&body).send().await?.text().await?;

    println!("{:#?}", resp);
    Ok(resp)
}

#[tauri::command]
fn make_delete_http_request_command(
    url: String,
    headers: HashMap<String, String>,
    body: serde_json::Value,
) -> String {
    let result = make_delete_http_request(url, headers);
    let result_string = match result {
        Ok(value) => value,
        Err(err) => format!("Error: {:?}", err),
    };
    println!("Result from async function: {:?}", result_string);
    return result_string;
}

#[tokio::main]
async fn make_delete_http_request(
    url: String,
    headers: HashMap<String, String>,
) -> Result<String, Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    let mut request = client.delete(url);

    for (key, value) in headers.iter() {
        request = request.header(key, value);
    }

    let resp = request.send().await?.text().await?;

    println!("{:#?}", resp);
    Ok(resp)
}

// X-www-form-urlencoded Data Requests

#[tauri::command]
fn make_www_post_form_request_command(
    url: String,
    body: HashMap<&str, &str>,
    headers: HashMap<String, String>,
) -> String {
    // You can call an async function from here
    let result = make_www_post_form_request(url, body, headers);
    let result_string = match result {
        Ok(value) => value,
        Err(err) => format!("Error: {:?}", err), // Handle the error case here
    };
    println!("Result from async function: {:?}", result_string);
    return result_string;
}

#[tokio::main]
async fn make_www_post_form_request(
    url: String,
    body: HashMap<&str, &str>,
    headers: HashMap<String, String>,
) -> Result<String, Box<dyn Error>> {
    let client = reqwest::Client::new();
    let mut request = client.post(url);
    for (key, value) in headers.iter() {
        request = request.header(key, value);
    }
    let resp = request.form(&body).send().await?.text().await?;
    println!("{:#?}", resp);
    Ok(resp)
}

#[tauri::command]
fn make_www_put_form_request_command(
    url: String,
    body: HashMap<&str, &str>,
    headers: HashMap<String, String>,
) -> String {
    // You can call an async function from here
    let result = make_www_put_form_request(url, body, headers);
    let result_string = match result {
        Ok(value) => value,
        Err(err) => format!("Error: {:?}", err), // Handle the error case here
    };
    println!("Result from async function: {:?}", result_string);
    return result_string;
}

#[tokio::main]
async fn make_www_put_form_request(
    url: String,
    body: HashMap<&str, &str>,
    headers: HashMap<String, String>,
) -> Result<String, Box<dyn Error>> {
    let client = reqwest::Client::new();
    let mut request = client.put(url);
    for (key, value) in headers.iter() {
        request = request.header(key, value);
    }
    let resp = request.form(&body).send().await?.text().await?;
    println!("{:#?}", resp);
    Ok(resp)
}

#[tauri::command]
fn make_www_get_form_request_command(
    url: String,
    headers: HashMap<String, String>,
    body: HashMap<&str, &str>,
) -> String {
    // You can call an async function from here
    let result = make_www_get_form_request(url, headers);
    let result_string = match result {
        Ok(value) => value,
        Err(err) => format!("Error: {:?}", err), // Handle the error case here
    };
    println!("Result from async function: {:?}", result_string);
    return result_string;
}

#[tokio::main]
async fn make_www_get_form_request(
    url: String,
    headers: HashMap<String, String>,
) -> Result<String, Box<dyn Error>> {
    let client = reqwest::Client::new();
    let mut request = client.get(url);
    for (key, value) in headers.iter() {
        request = request.header(key, value);
    }
    let resp = request.send().await?.text().await?;
    println!("{:#?}", resp);
    Ok(resp)
}

#[tauri::command]
fn make_www_delete_form_request_command(
    url: String,
    headers: HashMap<String, String>,
    body: HashMap<&str, &str>,
) -> String {
    // You can call an async function from here
    let result = make_www_delete_form_request(url, headers);
    let result_string = match result {
        Ok(value) => value,
        Err(err) => format!("Error: {:?}", err), // Handle the error case here
    };
    println!("Result from async function: {:?}", result_string);
    return result_string;
}

#[tokio::main]
async fn make_www_delete_form_request(
    url: String,
    headers: HashMap<String, String>,
) -> Result<String, Box<dyn Error>> {
    let client = reqwest::Client::new();
    let mut request = client.delete(url);
    for (key, value) in headers.iter() {
        request = request.header(key, value);
    }
    let resp = request.send().await?.text().await?;
    println!("{:#?}", resp);
    Ok(resp)
}


// Multipart Form Data Requests


fn check_Input_Type(body: String) -> bool {
    let input = body;
    
    if input.contains('@') {
        return true
    } 
    return false
}


fn extract_filename(input: &str) -> Option<String> {
    let re = Regex::new(r#"\/([^/]+)"'$"#).unwrap();
    
    if let Some(captures) = re.captures(input) {
        if let Some(matched) = captures.get(1) {
            return Some(matched.as_str().to_string());
        }
    }
    
    None

    // let re = Regex::new(r#"\\([^\\]+)$"#).unwrap();
    // if let Some(captures) = re.captures(input) {
    //     captures.get(1).map(|m| m.as_str().to_string())
    // } else {
    //     None
    // }
}


fn extract_local_path(input: &str) -> Option<String> {
    let re = Regex::new(r#""([^"]+)""#).unwrap();
    if let Some(caps) = re.captures(input) {
        let path = caps.get(1).map(|m| m.as_str().to_string())?;
        if path.starts_with("/C:") {
            return Some(path[1..].to_string());
        }
    }
    None
    // let start = input.find('"')? + 1;
    // let end = input.rfind('"')?;
    // let path = &input[start..end];

    // Some(path.replace("\\\\", "\\").to_string())
}



#[tauri::command]
fn make_post_form_request_command(
    url: String,
    body: &str,
    headers: HashMap<String, String>,
) -> String {
    // You can call an async function from here
    let result = make_post_form_request(url, body, headers);
    let result_string = match result {
        Ok(value) => value,
        Err(err) => format!("Error: {:?}", err), // Handle the error case here
    };
    println!("Result from async function: {:?}", result_string);
    return result_string;
}

#[tokio::main]
async fn make_post_form_request(
    url: String,
    body: &str,
    headers: HashMap<String, String>,
) -> Result<String, Box<dyn Error>> {
    let filename = extract_filename(body);
    let local_filepath = extract_local_path(body);
    println!("{:#?}", filename);
    println!("{:#?}", local_filepath);
    let local_filepath_str = local_filepath.as_ref().unwrap();
    let filename_str = filename.unwrap_or_default();
    
    let file_fs = fs::read(local_filepath_str)?;
    
    let part = multipart::Part::bytes(file_fs).file_name(filename_str);
    let filename1 = extract_filename(body);
    let filename_str1 = filename1.unwrap_or_default();
    let form = reqwest::multipart::Form::new()
    .text("resourceName", filename_str1)
    .part("FileData", part);
    let client = reqwest::Client::new();
    let mut request = client.post(url);
    for (key, value) in headers.iter() {
        request = request.header(key, value);
    }
    let resp = request.multipart(form).send().await?.text().await?;
    println!("{:#?}", resp);
    Ok(resp)
}


fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            make_get_http_request_command,
            make_post_http_request_command,
            make_put_http_request_command,
            make_delete_http_request_command,
            make_www_post_form_request_command,
            make_www_put_form_request_command,
            make_www_get_form_request_command,
            make_www_delete_form_request_command,
            make_post_form_request_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
