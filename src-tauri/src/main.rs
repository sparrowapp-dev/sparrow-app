// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![windows_subsystem = "windows"]

mod config;
mod formdata_handler;
mod json_handler;
mod raw_handler;
mod request_handler;
mod url_fetch_handler;
mod urlencoded_handler;

use formdata_handler::make_formdata_request;
use json_handler::make_json_request;
use request_handler::formdata_handler_v2::make_formdata_request_v2;
use request_handler::http_requests::make_without_body_request;
use request_handler::json_handler_v2::make_json_request_v2;
use request_handler::urlencoded_handler_v2::make_www_form_urlencoded_request_v2;
use std::path::PathBuf;
use std::process::Command;
use tauri::Window;

use nfd::Response;
use raw_handler::make_text_request;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;
use serde_json::Value;
use std::collections::HashMap;
use tauri::Manager;
use url_fetch_handler::import_swagger_url;
use urlencoded_handler::make_www_form_urlencoded_request;

#[cfg(target_os = "macos")]
#[macro_use]
extern crate objc;

// Commands
#[tauri::command]
fn zoom_window(window: tauri::Window, scale_factor: f64) {
    let main_webview = window.get_webview_window("main").unwrap();
    let _ = main_webview.with_webview(move |webview| {
        #[cfg(windows)]
        unsafe {
            webview.controller().SetZoomFactor(scale_factor).unwrap();
        }

        #[cfg(target_os = "macos")]
        unsafe {
            let () = msg_send![webview.inner(), setPageZoom: scale_factor];
        }
    });
}

#[tauri::command]
fn fetch_swagger_url_command(url: &str, headers: &str, workspaceid: &str) -> Value {
    let response = import_swagger_url(url, headers, workspaceid);
    let response_value = match response {
        Ok(value) => value,
        Err(err) => todo!("{}", err),
    };
    return response_value;
}

#[tauri::command]
fn get_git_branches(path: String) -> Result<Vec<String>, String> {
    let output = Command::new("git")
        .arg("branch")
        .arg("-r")
        .current_dir(&path)
        .output()
        .map_err(|e| format!("Failed to execute git branch command: {}", e))?;

    if output.status.success() {
        let branches = String::from_utf8(output.stdout)
            .map_err(|e| format!("Failed to parse command output: {}", e))?;
        let branch_list: Vec<String> = branches
            .lines()
            .map(|branch| {
                // Optionally, you can extract more details about each branch here
                // For now, we are just returning the branch name
                branch.trim_start().to_string()
            })
            .collect();
        Ok(branch_list)
    } else {
        let error_message =
            String::from_utf8(output.stderr).unwrap_or_else(|_| "Unknown error".to_string());
        Err(error_message)
    }
}

#[tauri::command]
fn get_git_active_branch(path: String) -> Result<String, String> {
    let output = Command::new("git")
        .arg("branch")
        .current_dir(&path)
        .output()
        .map_err(|e| format!("Failed to execute git branch command: {}", e))?;

    if output.status.success() {
        let branches = String::from_utf8(output.stdout)
            .map_err(|e| format!("Failed to parse command output: {}", e))?;

        // Split the output by newlines and find the branch with the asterisk
        let active_branch = branches
            .lines()
            .find(|line| line.starts_with('*'))
            .map(|line| line.trim_start_matches("* ").to_string())
            .ok_or_else(|| "Active branch not found".to_string())?;

        Ok(active_branch)
    } else {
        let error_message =
            String::from_utf8(output.stderr).unwrap_or_else(|_| "Unknown error".to_string());
        Err(error_message)
    }
}

#[tauri::command]
fn fetch_file_command() -> String {
    let result = nfd::open_file_dialog(None, None).expect("Error opening file dialog");
    let response;
    match result {
        Response::Okay(file_path) => {
            response = file_path;
        }
        Response::OkayMultiple(_) => {
            let temp = "Multiple Files Selected";
            response = temp.to_string();
        }
        Response::Cancel => {
            let temp = "Canceled";
            response = temp.to_string();
        }
    }
    return response;
}

#[tauri::command]
fn fetch_folder_command() -> String {
    let result = nfd::open_pick_folder(None).expect("Error opening file dialog");
    let response;
    match result {
        Response::Okay(folder_path) => {
            response = folder_path;
        }
        Response::OkayMultiple(_) => {
            let temp = "Multiple Files Selected";
            response = temp.to_string();
        }
        Response::Cancel => {
            let temp = "Canceled";
            response = temp.to_string();
        }
    }
    return response;
}

#[tauri::command]
async fn close_oauth_window(handle: tauri::AppHandle) {
    let oauth_window = handle.get_webview_window("oauth").unwrap();
    let _ = oauth_window.eval(&format!(
        "window.location.replace('https://accounts.google.com/logout')"
    ));
    let _ = oauth_window.hide();
}

#[tauri::command]
async fn make_http_request(
    url: &str,
    method: &str,
    headers: &str,
    body: &str,
    request: &str,
) -> Result<String, String> {
    let result = make_request(url, method, headers, body, request).await;

    let result_value = match result {
        Ok(value) => value.to_string(),
        Err(err) => err.to_string(),
    };

    let response = json!({
        "body": result_value,
    });

    return match serde_json::to_string(&response) {
        Ok(value) => Ok(value.to_string()),
        Err(err) => Err(err.to_string()),
    };
}

#[derive(Debug, Deserialize, Serialize)]
struct KeyValue {
    key: String,
    value: String,
    checked: Option<bool>,
}

#[tauri::command]
async fn make_http_request_v2(
    url: &str,
    method: &str,
    headers: &str,
    body: &str,
    request: &str,
) -> Result<String, String> {
    let result = make_request_v2(url, method, headers, body, request).await;

    // Convert the result to a string for response formatting
    let result_value = match result {
        Ok(value) => value.to_string(), // Convert successful result to string
        Err(err) => err.to_string(),    // Convert error to string
    };

    // Create a JSON response with the result and tab ID
    let response = json!({
        "body": result_value,
    });

    return match serde_json::to_string(&response) {
        Ok(value) => Ok(value.to_string()),
        Err(err) => Err(err.to_string()),
    };
}

async fn make_request_v2(
    url: &str,
    method: &str,
    headers: &str,
    body: &str,
    request: &str,
) -> Result<String, std::io::Error> {
    // Create a client
    let client = Client::new();

    // Convert method string to reqwest::Method
    let reqwest_method = match method {
        "GET" => reqwest::Method::GET,
        "POST" => reqwest::Method::POST,
        "PUT" => reqwest::Method::PUT,
        "DELETE" => reqwest::Method::DELETE,
        "PATCH" => reqwest::Method::PATCH,
        // Add other HTTP methods as needed
        _ => reqwest::Method::GET,
    };

    // Deserialize the JSON string into a Vec<KeyValue>
    let headers_key_values: Vec<KeyValue> = serde_json::from_str(headers).unwrap();

    // Create a HashMap to store key-value pairs
    let mut headers_key_value_map: HashMap<String, String> = HashMap::new();

    // Iterate over key_values and add key-value pairs to the map
    for kv in headers_key_values {
        headers_key_value_map.insert(kv.key, kv.value);
    }

    // Create request builder with request method and url
    let mut request_builder = client.request(reqwest_method, url);

    // Add all headers in request builder
    for (key, value) in headers_key_value_map.iter() {
        request_builder = request_builder.header(key, value);
    }

    // Make request call as per Body type
    let check = match request {
        "JSON" => make_json_request_v2(request_builder, body).await,
        "URLENCODED" => make_www_form_urlencoded_request_v2(request_builder, body).await,
        "FORMDATA" => make_formdata_request_v2(request_builder, body).await,
        "TEXT" => make_text_request(request_builder, body).await,
        _ => make_without_body_request(request_builder).await,
    };

    // check response is successful or not
    let response_value = match check {
        Ok(value) => value,
        Err(err) => {
            // converting `reqwest::Error` to `std::io::Error
            return Err(err);
        }
    };

    // Extract headers from response
    let response_headers = response_value.headers().clone();

    // Extract status code from response
    let response_status = response_value.status().clone();

    // Extract response value from response
    let response_text_result = response_value.text().await;

    // Map headers into json
    let response_headers_json: serde_json::Value = response_headers
        .iter()
        .map(|(name, value)| (name.to_string(), value.to_str().unwrap()))
        .collect();

    let response_text = match response_text_result {
        Ok(value) => value,
        Err(err) => format!("Error: {}", err),
    };

    // Combining all the parameters
    let combined_json = json!({
        "headers": response_headers_json,
        "status": response_status.to_string(),
        "body": response_text,
    });

    return Ok(combined_json.to_string());
}

async fn make_request(
    url: &str,
    method: &str,
    headers: &str,
    body: &str,
    request: &str,
) -> Result<String, std::io::Error> {
    // Make a client
    let client = Client::new();
    // Convert the method string to reqwest::Method
    let reqwest_method = match method {
        "GET" => reqwest::Method::GET,
        "POST" => reqwest::Method::POST,
        "PUT" => reqwest::Method::PUT,
        "DELETE" => reqwest::Method::DELETE,
        "PATCH" => reqwest::Method::PATCH,
        // Add other HTTP methods as needed
        _ => reqwest::Method::GET,
    };

    // Convert header string into hashmap
    let header_map: HashMap<_, _> = headers
        .split("[SPARROW_AMPERSAND]")
        .map(|s| {
            let mut parts = s.split("[SPARROW_EQUALS]");
            (
                parts.next().unwrap().to_owned(),
                parts.next().unwrap_or("").to_owned(),
            )
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
        "TEXT" => make_text_request(request_builder, body).await,
        _ => make_json_request(request_builder, body).await,
    };
    let response_value = match check {
        Ok(value) => value,
        Err(err) => {
            // converting `reqwest::Error` to `std::io::Error
            return Err(err);
        }
    };

    // Extracting Headers, StatusCode & Response
    let headers = response_value.headers().clone();
    let status = response_value.status().clone();
    let response_text_result = response_value.text().await;
    let headers_json: serde_json::Value = headers
        .iter()
        .map(|(name, value)| (name.to_string(), value.to_str().unwrap()))
        .collect();

    let response_text = match response_text_result {
        Ok(value) => value,
        Err(err) => format!("Error: {}", err),
    };

    // Combining all parameters
    let combined_json = json!({
        "headers": headers_json,
        "status": status.to_string(),
        "response": response_text,
    });
    return Ok(combined_json.to_string());
}

// Sturct Types
#[derive(Clone, serde::Serialize)]
struct Payload {
    url: String,
}

#[derive(Clone, serde::Serialize)]
struct OnClosePayload {
    message: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct MyResponse {
    tab_id: String,
    response: Result<String, String>,
}
#[derive(Clone, serde::Serialize)]
struct SingleInstancePayload {
    args: Vec<String>,
    cwd: String,
}
// Driver Function
fn main() {
    // Initiate Tauri Runtime
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            app.emit(
                "single-instance",
                SingleInstancePayload {
                    args: argv.clone(),
                    cwd: _cwd,
                },
            )
            .unwrap();
            if argv.len() > 1 {
                app.emit(
                    "deep-link-urls",
                    Payload {
                        url: argv[1].to_string(),
                    },
                )
                .unwrap();
            } else {
                // Handle the case where argv is empty or doesn't have enough elements
                println!("No URL provided in command line arguments.");
            }
        }))
        .setup(|app| {
            #[cfg(desktop)]
            app.handle()
                .plugin(tauri_plugin_updater::Builder::new().build())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            fetch_swagger_url_command,
            get_git_branches,
            get_git_active_branch,
            fetch_file_command,
            fetch_folder_command,
            close_oauth_window,
            make_http_request,
            zoom_window,
            make_http_request_v2,
        ])
        .on_page_load(|wry_window, _payload| {
            if wry_window.url().host_str() == Some("www.google.com") {
                wry_window
                    .emit(
                        "receive-login",
                        Payload {
                            url: _payload.url().to_string(),
                        },
                    )
                    .unwrap();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
