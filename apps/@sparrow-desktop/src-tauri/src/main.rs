// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![windows_subsystem = "windows"]
//! # Module: HTTP Request Handlers & Sparrow RPC Logic
//!
//! This module provides handlers for various types of HTTP requests, related operations and RPC Logic of Sparrow App.
//!
//! ## Submodules
//!
//! - `config`: Configuration handling.
//! - `formdata_handler`: Multipart/form-data request handling.
//! - `json_handler`: JSON request handling.
//! - `raw_handler`: Raw text request handling.
//! - `request_handler`: General request handling utilities.
//! - `url_fetch_handler`: URL fetching utilities.
//! - `urlencoded_handler`: URL-encoded request handling.
//! - `utils`: General utility functions
//!
//! ## External Imports
//!
//! - `formdata_handler::make_formdata_request`: Function for making multipart/form-data requests.
//! - `json_handler::make_json_request`: Function for making JSON requests.
//! - `nfd::Response`: Represents a response from native file dialogs.
//! - `raw_handler::make_text_request`: Function for making raw text requests.
//! - `request_handler::formdata_handler_v2::make_formdata_request_v2`: Updated function for multipart/form-data requests.
//! - `request_handler::http_requests::make_without_body_request`: Function for making HTTP requests without a body.
//! - `request_handler::json_handler_v2::make_json_request_v2`: Updated function for JSON requests.
//! - `request_handler::urlencoded_handler_v2::make_www_form_urlencoded_request_v2`: Updated function for URL-encoded requests.
//! - `reqwest::Client`: HTTP client provided by Reqwest.
//! - `serde::{Deserialize, Serialize}`: Serialization and deserialization support with Serde.
//! - `serde_json::{json, Value}`: JSON serialization and deserialization support with Serde JSON.
//! - `std::collections::HashMap`: Represents a hash map for key-value data storage.
//! - `std::process::Command`: Represents an external command to be executed.
//! - `tauri::Manager`: Tauri application manager.
//! - `tauri::Window`: Represents a window in a Tauri application.
//! - `url_fetch_handler::import_swagger_url`: Function for importing Swagger URLs.
//! - `urlencoded_handler::make_www_form_urlencoded_request`: Function for making URL-encoded requests.
//! - `utils::response_decoder::decode_response_body`: Function for decoding response body as per encoded type.
//! - `group_policy_config::get_policy_config: Function to read the registry keys for group policy support`
// Submodules
mod config;
mod formdata_handler;
mod group_policy_config;
mod json_handler;
mod raw_handler;
mod request_handler;
mod url_fetch_handler;
mod urlencoded_handler;
mod utils;

// External Imports
use base64;
use formdata_handler::make_formdata_request;
use group_policy_config::get_policy_config;
use json_handler::make_json_request;
use nfd::Response;
use raw_handler::make_text_request;
use request_handler::formdata_handler_v2::make_formdata_request_v2;
use request_handler::http_requests::make_without_body_request;
use request_handler::json_handler_v2::make_json_request_v2;
use request_handler::urlencoded_handler_v2::make_www_form_urlencoded_request_v2;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;
use serde_json::Value;
use std::collections::HashMap;
use std::process::Command;
use std::time::Duration;
use tauri::Emitter;
use tauri::Manager;
use url_fetch_handler::import_swagger_url;
use urlencoded_handler::make_www_form_urlencoded_request;
use utils::response_decoder::decode_response_body;

// Web socket imports
use futures_util::{SinkExt, StreamExt};
use hyper::header::HeaderValue;
use hyper::header::{CONNECTION, UPGRADE};
use hyper::{Client as OtherClient, Request};
use hyper_tls::HttpsConnector;
use std::sync::Arc;
use tokio::sync::mpsc::{self, UnboundedSender};
use tokio::sync::Mutex;
use tokio_tungstenite::connect_async;
use tokio_tungstenite::tungstenite::protocol::Message;

// Socket.IO imports
use futures_util::FutureExt;
use rust_socketio::{
    asynchronous::{Client as SocketClient, ClientBuilder},
    Event as SocketIoEvent, Payload as SocketIoPayload, TransportType,
};
use tauri_plugin_os::platform;
use tokio::sync::Mutex as SocketMutex;

// MacOs Window Titlebar Config Imports
#[cfg(target_os = "macos")]
#[macro_use]
extern crate objc;

#[cfg(target_os = "macos")]
extern crate cocoa;

#[cfg(target_os = "macos")]
use cocoa::appkit::{NSWindow, NSWindowButton, NSWindowStyleMask, NSWindowTitleVisibility};
use tauri::{Runtime, WebviewWindow};

pub trait WindowExt {
    fn set_transparent_titlebar(&self, title_transparent: bool, remove_toolbar: bool);
    fn set_toolbar_visibility(&self, visible: bool);
}

// Implementation for WebviewWindow
#[cfg(target_os = "macos")]
impl<R: Runtime> WindowExt for WebviewWindow<R> {
    fn set_transparent_titlebar(&self, title_transparent: bool, remove_toolbar: bool) {
        unsafe {
            let id = self.ns_window().unwrap() as cocoa::base::id;

            // Set titlebar transparency
            NSWindow::setTitlebarAppearsTransparent_(id, cocoa::base::YES);
            let mut style_mask = id.styleMask();
            style_mask.set(
                NSWindowStyleMask::NSFullSizeContentViewWindowMask,
                title_transparent,
            );
            id.setStyleMask_(style_mask);

            // Adjust toolbar visibility
            if remove_toolbar {
                self.set_toolbar_visibility(false);
            }

            id.setTitleVisibility_(if title_transparent {
                NSWindowTitleVisibility::NSWindowTitleHidden
            } else {
                NSWindowTitleVisibility::NSWindowTitleVisible
            });

            id.setTitlebarAppearsTransparent_(if title_transparent {
                cocoa::base::YES
            } else {
                cocoa::base::NO
            });
        }
    }

    fn set_toolbar_visibility(&self, visible: bool) {
        unsafe {
            let id = self.ns_window().unwrap() as cocoa::base::id;

            let visibility = if visible {
                cocoa::base::NO
            } else {
                cocoa::base::YES
            };
            let buttons = [
                id.standardWindowButton_(NSWindowButton::NSWindowCloseButton),
                id.standardWindowButton_(NSWindowButton::NSWindowMiniaturizeButton),
                id.standardWindowButton_(NSWindowButton::NSWindowZoomButton),
            ];

            for button in buttons {
                let _: () = msg_send![button, setHidden: visibility];
            }
        }
    }
}

#[cfg(target_os = "linux")]
impl<R: Runtime> WindowExt for WebviewWindow<R> {
    fn set_transparent_titlebar(&self, title_transparent: bool, remove_toolbar: bool) {
        use gtk::prelude::*;
        if let Ok(gtk_window) = self.gtk_window() {
            if title_transparent {
                gtk_window.set_decorated(false);
            } else {
                gtk_window.set_decorated(true);
            }
        }
    }

    fn set_toolbar_visibility(&self, visible: bool) {
        // No-op: Not supported on Linux
    }
}

#[cfg(target_os = "windows")]
impl<R: Runtime> WindowExt for WebviewWindow<R> {
    fn set_transparent_titlebar(&self, title_transparent: bool, remove_toolbar: bool) {
        // No-op: Not supported on Windows
    }

    fn set_toolbar_visibility(&self, visible: bool) {
        // No-op: Not supported on Windows
    }
}

// Commands
#[tauri::command]
fn hide_toolbar(window: tauri::WebviewWindow) {
    window.set_toolbar_visibility(false);
}

#[tauri::command]
fn show_toolbar(window: tauri::WebviewWindow) {
    window.set_toolbar_visibility(true);
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

/// Makes an asynchronous HTTP request with various options.
///
/// # Arguments
///
/// * `url` - The URL to send the request to.
/// * `method` - The HTTP method to use (e.g., "GET", "POST").
/// * `headers` - A JSON string representing the headers to include in the request.
/// * `body` - The body of the request.
/// * `request` - The type of request to make, such as "application/json", "application/x-www-form-urlencoded", etc.
///
/// # Returns
///
/// A `Result` containing a JSON string representing the combined response data, or an `std::io::Error` if the request fails.
async fn make_request_v2(
    url: &str,
    method: &str,
    headers: &str,
    body: &str,
    request: &str,
) -> Result<String, std::io::Error> {
    // Create a client
    let client = reqwest::Client::builder()
    .danger_accept_invalid_certs(true)
    .build()
    .unwrap();

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
        "application/json" => make_json_request_v2(request_builder, body).await,
        "application/x-www-form-urlencoded" => {
            make_www_form_urlencoded_request_v2(request_builder, body).await
        }
        "multipart/form-data" => make_formdata_request_v2(request_builder, body).await,
        "text/plain" => make_text_request(request_builder, body).await,
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

    //check is data binary

    let mut content_type = response_headers
        .get("content-type")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("")
        .to_string();

    let is_binary = content_type.starts_with("image/");

    let response_body;

    if is_binary {
        let base64_string;

        if content_type.contains("svg") {
            content_type = "image/svg+xml".to_string();

            let response_text_result = decode_response_body(response_value).await;

            let svg_string = match response_text_result {
                Ok(value) => value,
                Err(err) => format!("Error: {}", err),
            };

            println!("{}", svg_string);

            base64_string = base64::encode(svg_string);
        } else {
            //extract bytes from respose body for further conversion
            let bytes = response_value
                .bytes()
                .await
                .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e.to_string()))?;

            base64_string = base64::encode(bytes); // convert bytes to base64 string effiecient for transmission / no data willl not get currupted.
        }

        //create src from content type and base64 string
        response_body = format!("data:{};base64,{}", content_type, base64_string);
    } else {
        //if data is non binary handle it as standrd flow
        let response_text_result = decode_response_body(response_value).await;

        response_body = match response_text_result {
            Ok(value) => value,
            Err(err) => format!("Error: {}", err),
        };
    }

    // Map headers into json
    let response_headers_json: serde_json::Value = response_headers
        .iter()
        .map(|(name, value)| (name.to_string(), value.to_str().unwrap()))
        .collect();

    // Combining all the parameters
    let combined_json = json!({
        "headers": response_headers_json,
        "status": response_status.to_string(),
        "body": response_body,   // body data can be base64 string or text
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

#[derive(Clone)]
struct TabConnection {
    sender: UnboundedSender<String>,
    disconnect_handle: Arc<Mutex<Option<tokio::sync::oneshot::Sender<()>>>>,
}

struct AppState {
    connections: Mutex<std::collections::HashMap<String, TabConnection>>,
}
struct SocketIoAppState {
    connections: SocketMutex<HashMap<String, SocketClient>>,
}

#[derive(Serialize)]
struct WebSocketResponse {
    is_successful: bool,
    status_code: u16,
    message: String,
    headers: Option<HashMap<String, String>>,
}

#[tauri::command]
async fn connect_websocket(
    url: String,
    httpurl: String,
    tabid: String,
    headers: String, // Stringified JSON headers
    state: tauri::State<'_, Arc<AppState>>,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    println!("inside the websocket");

    // Deserialize the JSON string into a Vec<KeyValue>
    let headers_key_values: Vec<KeyValue> =
        serde_json::from_str(&headers).map_err(|e| format!("Failed to parse headers: {}", e))?;

    // Create a HashMap to store key-value pairs
    let mut headers_key_value_map: HashMap<String, String> = HashMap::new();

    // Iterate over key_values and add key-value pairs to the map
    for kv in headers_key_values {
        headers_key_value_map.insert(kv.key, kv.value);
    }

    // Create an HTTPS connector and client
    let https = HttpsConnector::new();
    let client: OtherClient<_, hyper::Body> = OtherClient::builder().build::<_, hyper::Body>(https);

    // Build the HTTP request to upgrade to WebSocket
    let mut req_builder = Request::builder()
        .uri(&httpurl)
        .header(UPGRADE, "websocket")
        .header(CONNECTION, "Upgrade");

    // Add custom headers to the request
    for (key, value) in headers_key_value_map.iter() {
        req_builder = req_builder.header(
            key,
            HeaderValue::from_str(value).map_err(|e| format!("Invalid header value: {}", e))?,
        );
    }

    // Unwrap the body
    let req = req_builder
        .body(hyper::Body::empty())
        .map_err(|e| format!("Failed to build request: {}", e))?;

    // Send the HTTP request and await the response to check if upgrade to websocket is possible or not.
    let response = client
        .request(req)
        .await
        .map_err(|e| format!("Failed to request: {}", e))?;

    // Check if the upgrade to WebSocket was successful
    if response.status() != 101 {
        return Err(format!("Failed to upgrade: {:?}", response.status()));
    }

    // Establish the WebSocket connection and convert the response into a WebSocket stream
    let (ws_stream, response) = connect_async(url)
        .await
        .map_err(|e| format!("Failed to connect: {}", e))?;

    // Extract headers from the response
    let mut response_headers = HashMap::new();
    for (key, value) in response.headers() {
        if let Ok(header_value) = value.to_str() {
            response_headers.insert(key.as_str().to_string(), header_value.to_string());
        }
    }

    // Split the WebSocket stream into read and write halves
    let (mut write, mut read) = ws_stream.split();

    let (tx, mut rx) = mpsc::unbounded_channel::<String>();

    let (disconnect_tx, disconnect_rx) = tokio::sync::oneshot::channel();
    let disconnect_handle = Arc::new(Mutex::new(Some(disconnect_tx)));

    state.connections.lock().await.insert(
        tabid.clone(),
        TabConnection {
            sender: tx,
            disconnect_handle: disconnect_handle.clone(),
        },
    );

    let svelte_tabid = tabid.clone();
    let app_handle_clone = app_handle.clone();
    tokio::spawn(async move {
        tokio::select! {
            _ = disconnect_rx => {
                // Handle manual disconnection
                println!("WebSocket connection manually closed for tab: {}", svelte_tabid);
            }
            _ = async {
                while let Some(message) = read.next().await {
                    match message {
                        Ok(msg) => {
                            match msg {
                                Message::Text(text) => {
                                    let event = format!("ws_message_{}", svelte_tabid);
                                    let payload = json!({
                                        "type": "message",
                                        "data": text,
                                    });
                                    app_handle_clone.emit(event.as_str(), payload).unwrap();
                                }
                                Message::Close(close_frame) => {
                                    // Handle server disconnection
                                    let event = format!("ws_message_{}", svelte_tabid);
                                    let close_reason = close_frame
                                        .as_ref()
                                        .map(|frame| frame.reason.to_string())
                                        .unwrap_or("No reason provided".to_string());

                                    println!(
                                        "Server closed WebSocket connection for tab: {}, reason: {}",
                                        svelte_tabid,
                                        close_reason
                                    );

                                    let payload = json!({
                                        "type": "disconnect",
                                        "data": close_reason,
                                    });
                                    app_handle_clone.emit(event.as_str(), payload).unwrap();
                                    break;
                                }
                                _ => {}
                            }
                        }
                        Err(err) => {
                            // Handle errors (like connection reset, etc.)
                            let event = format!("ws_message_{}", svelte_tabid);
                            let error_message = format!("WebSocket error: {}", err);
                            println!("Error for tab {}: {}", svelte_tabid, error_message);

                            let payload = json!({
                                "type": "disconnect",
                                "data": error_message,
                            });
                            app_handle_clone.emit(event.as_str(), payload).unwrap();
                            break;
                        }
                    }
                }
            } => {}
        }
    });

    tokio::spawn(async move {
        while let Some(msg) = rx.recv().await {
            write
                .send(Message::Text(msg))
                .await
                .map_err(|e| format!("Failed to send message: {}", e))
                .unwrap();
        }
    });

    // Create a success response
    let response = WebSocketResponse {
        is_successful: true,
        status_code: 200,
        message: "Connected Successfully".to_string(),
        headers: Some(response_headers),
        // initial_data: Some(initial_data),
    };

    // Serialize the response to a JSON string and return it
    let response_json = serde_json::to_string(&response)
        .map_err(|e| format!("Failed to serialize response: {}", e))?;

    Ok(response_json)
}

#[tauri::command]
async fn send_websocket_message(
    tabid: String,
    message: String,
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<String, String> {
    if let Some(connection) = state.connections.lock().await.get(&tabid) {
        connection
            .sender
            .send(message)
            .map_err(|e| format!("Failed to send message: {}", e))?;
    } else {
        return Err("Connection not found".to_string());
    }

    // Create a success response
    let response = WebSocketResponse {
        is_successful: true,
        status_code: 200,
        message: "Message sent successfully".to_string(),
        headers: None, // Set headers to None or provide actual headers if needed
    };

    // Serialize the response to a JSON string and return it
    let response_json = serde_json::to_string(&response)
        .map_err(|e| format!("Failed to serialize response: {}", e))?;

    Ok(response_json)
}

#[derive(Serialize)]
struct DisconnectResponse {
    is_successful: bool,
    status_code: u16,
    message: String,
}

#[tauri::command]
async fn disconnect_websocket(
    tabid: String,
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<String, String> {
    let mut connections = state.connections.lock().await;

    if let Some(connection) = connections.remove(&tabid) {
        // Access the disconnect handle
        let mut handle_lock = connection.disconnect_handle.lock().await;

        // Check if there is a Sender inside the Option
        if let Some(sender) = std::mem::take(&mut *handle_lock) {
            // Send the signal to close the WebSocket connection
            let _ = sender.send(());
        }

        // Create a success response
        let response = DisconnectResponse {
            is_successful: true,
            status_code: 200,
            message: "WebSocket connection disconnected successfully".to_string(),
        };

        // Serialize the response to a JSON string and return it
        let response_json = serde_json::to_string(&response)
            .map_err(|e| format!("Failed to serialize response: {}", e))?;

        return Ok(response_json);
    } else {
        // Return an error if the connection was not found
        let response = DisconnectResponse {
            is_successful: false,
            status_code: 404,
            message: "WebSocket connection not found".to_string(),
        };

        // Serialize the error response to a JSON string and return it
        let response_json = serde_json::to_string(&response)
            .map_err(|e| format!("Failed to serialize response: {}", e))?;

        return Err(response_json);
    }
}

#[derive(Serialize)]
struct SocketIoResponse {
    is_successful: bool,
    status_code: u16,
    message: String,
}

#[derive(Serialize)]
struct SocketIoDisconnectResponse {
    is_successful: bool,
    status_code: u16,
    message: String,
}

async fn is_server_connected(state: Arc<SocketIoAppState>, tabid: String) -> bool {
    // Lock the state to access the connections map
    let clients = state.connections.lock().await;

    // Try to retrieve the connection for the provided tabid
    if let Some(connection) = clients.get(&tabid) {
        // Create a callback for the ping event
        let ping_callback = move |_, _| async move {}.boxed();

        // Attempt to send a ping and check the result
        connection
            .emit_with_ack("ping", "pong", Duration::ZERO, ping_callback)
            .await
            .map(|_| true)
            .unwrap_or_else(|_| false)
    } else {
        false
    }
}

#[tauri::command]
async fn connect_socket_io(
    url: String,
    namespace: String,
    tabid: String,
    headers: String,
    state: tauri::State<'_, Arc<SocketIoAppState>>,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    // If connection exists for a tabid, remove it from the state
    let mut clients = state.connections.lock().await;
    if clients.contains_key(&tabid) {
        clients.remove(&tabid);
    }

    // Create weak references of socket set for future use at multiple places
    let state_weak = Arc::downgrade(&state);
    let state_weak_2 = Arc::downgrade(&state);

    // Clone tabid so it can be used at multiple places
    let tabid_clone = tabid.clone();
    let tabid_clone_2 = tabid.clone();
    let tabid_clone_3 = tabid.clone();

    // Clone app_handle so it can be used at multiple places
    let app_handle_clone = app_handle.clone();
    let app_handle_clone_2 = app_handle.clone();
    let app_handle_clone_3 = app_handle.clone();

    // Listeners(Closures) for various cases like for handling incoming messages, error, disconnection and connection
    let socket_event_listener = move |event: SocketIoEvent,
                                      payload: SocketIoPayload,
                                      _socket: SocketClient| {
        let app_handle_clone = app_handle_clone.clone();
        let tabid_clone = tabid_clone.clone();

        async move {
            // Create a message JSON object
            let message_json = match payload {
                SocketIoPayload::String(str) => {
                    json!({
                        "event": event.as_str(),
                        "message": str
                    })
                }
                SocketIoPayload::Text(str) => {
                    json!({
                        "event": event.as_str(),
                        "message": str
                    })
                }
                SocketIoPayload::Binary(bin_data) => {
                    json!({
                        "event": event.as_str(),
                        "message": bin_data
                    })
                }
            };

            // Emit the message JSON to the app
            let _ = app_handle_clone.emit(&format!("socket-message-{}", tabid_clone), message_json);
        }
        .boxed()
    };

    let socket_connected = move |_payload: SocketIoPayload, _socket: SocketClient| {
        let app_handle_clone = app_handle_clone_3.clone();
        let tabid_clone = tabid_clone_3.clone();

        // Fetch the strong reference to set
        let state_strong = state_weak.upgrade().expect("State was dropped prematurely");

        async move {
            // When successfully connected, update the state with the client
            println!("Connected to Socket.IO with tabid: {}", tabid_clone);

            // Store the connected client in the shared state
            {
                let mut clients = state_strong.connections.lock().await; // Await the lock acquisition
                clients.insert(tabid_clone.clone(), _socket.clone()); // Insert the client into the state
            }

            // Emit a success message to notify frontend
            let _ = app_handle_clone.emit(
                &format!("socket-connect-{}", tabid_clone),
                json!({ "message": "Successfully connected to the server" }),
            );
        }
        .boxed()
    };

    let socket_errored = move |err: SocketIoPayload, _| {
        let tabid_clone = tabid_clone_2.clone();
        let app_handle_clone = app_handle_clone_2.clone();
        let state_strong = state_weak_2
            .upgrade()
            .expect("State was dropped prematurely");
        async move {
            let connected = is_server_connected(state_strong, tabid_clone.clone()).await;

            // If socket_io server is not connected, that means it was a abrupt socket.io server disconnection and we need to emit the disconnect event
            if !connected {
                let error_message = match err {
                    SocketIoPayload::Binary(_) => "Binary data error".to_string(),
                    SocketIoPayload::Text(values) => values
                        .iter()
                        .map(|v| v.to_string()) // Convert each JSON value to a string
                        .collect::<Vec<_>>()
                        .join(", "), // Join multiple values with a comma
                    SocketIoPayload::String(s) => s, // Directly use the string if it's already in that form
                };
                let _ = app_handle_clone.emit(
                    &format!("socket-disconnect-{}", tabid_clone),
                    json!({ "message": error_message }),
                );
            }
        }
        .boxed()
    };

    // Create a new Socket.IO client
    let mut builder = ClientBuilder::new(&url)
        .namespace(&namespace)
        .on(SocketIoEvent::Error, socket_errored)
        .on(SocketIoEvent::Connect, socket_connected)
        .reconnect(false)
        .transport_type(TransportType::Websocket)
        .on_any(socket_event_listener);

    // Deserialize the JSON string into a Vec<KeyValue>
    let header_vec: Vec<KeyValue> =
        serde_json::from_str(&headers).map_err(|e| format!("Failed to parse headers: {}", e))?;

    // Iterate through headers and add each to the builder
    for header in header_vec {
        builder = builder.opening_header(header.key, header.value);
    }

    // Connect to the client
    let _socket = builder
        .connect()
        .await
        .map_err(|e| format!("Connection failed: {}", e))?;

    Ok(())
}

#[tauri::command]
async fn disconnect_socket_io(
    tabid: String,
    state: tauri::State<'_, Arc<SocketIoAppState>>,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    let mut clients = state.connections.lock().await;
    let response;

    if let Some(client) = clients.remove(&tabid) {
        let _ = app_handle.emit(
            &format!("socket-disconnect-{}", &tabid),
            json!({ "message":"Socket.IO connection disconnected successfully".to_string()}),
        );

        // Assuming you have a method to disconnect the client properly
        client
            .disconnect()
            .await
            .map_err(|e| format!("Failed to disconnect: {}", e))?;

        // Create a success response
        response = SocketIoDisconnectResponse {
            is_successful: true,
            status_code: 200,
            message: "Socket.IO connection disconnected successfully".to_string(),
        };
    } else {
        response = SocketIoDisconnectResponse {
            is_successful: false,
            status_code: 404,
            message: "Socket.IO connection not found".to_string(),
        };
    }

    // Serialize the response to a JSON string and return it
    let response_json = serde_json::to_string(&response)
        .map_err(|e| format!("Failed to serialize response: {}", e))?;

    return Ok(response_json);
}

#[tauri::command]
async fn send_socket_io_message(
    tabid: String,
    event: String,
    message: String,
    state: tauri::State<'_, Arc<SocketIoAppState>>,
) -> Result<String, String> {
    // Acquire the lock on the shared state
    let mut clients = state.connections.lock().await; // Make sure to allow mutation

    // Check if the client for the given tabId exists
    if let Some(client) = clients.get(&tabid) {
        // Emit the message to the specified Socket.IO event
        if let Err(e) = client.emit(event.clone(), message).await {
            // Remove the tabId from the state if there's an error
            clients.remove(&tabid);
            return Err(format!("Failed to send message: {}", e));
        }

        // Create the response
        let response = SocketIoResponse {
            is_successful: true,
            status_code: 200,
            message: format!("Message sent successfully to event: {}", event),
        };

        // Serialize the response to a JSON string
        return serde_json::to_string(&response)
            .map_err(|e| format!("Failed to serialize response: {}", e));
    } else {
        // If no client is found, return an error
        let response = SocketIoDisconnectResponse {
            is_successful: false,
            status_code: 404,
            message: "Socket.IO connection not found".to_string(),
        };

        // Serialize the response to a JSON string
        return serde_json::to_string(&response)
            .map_err(|e| format!("Failed to serialize response: {}", e));
    }
}

/// Sends a GraphQL request to a specified URL with given headers and query, returning the server's response.
///
/// # Arguments
///
/// * `url` - The URL endpoint of the GraphQL server.
/// * `headers` - A JSON string representing headers as key-value pairs for the request.
/// * `query` - The GraphQL query to execute.
/// * `variables` - Variables to be passed with query(Optional).
///
/// # Returns
///
/// * `Ok(String)` - A JSON string with the response, including status, headers, and body if the request is successful.
/// * `Err(String)` - An error message if the request fails or there is an issue with serialization/deserialization.
///
/// # Example
///
/// ```rust
/// let result = send_graphql_request("https://api.example.com/graphql", "{\"Authorization\":\"Bearer token\"}", "{ myQuery }").await;
/// ```
#[tauri::command]
async fn send_graphql_request(
    url: &str,
    headers: &str,
    query: &str,
    variables: Option<String>,
) -> Result<String, String> {
    // Initialize an HTTP client for making requests.
    let client = reqwest::Client::builder()
    .danger_accept_invalid_certs(true)
    .build()
    .unwrap();

    // Deserialize the JSON string `headers` into a Vec of key-value pairs.
    // Each key-value pair is represented by the KeyValue struct.
    let headers_key_values: Vec<KeyValue> = serde_json::from_str(headers).unwrap();

    // Create a HashMap to store key-value pairs
    let mut headers_key_value_map: HashMap<String, String> = HashMap::new();

    // Iterate over key_values and add key-value pairs to the map
    for kv in headers_key_values {
        headers_key_value_map.insert(kv.key, kv.value);
    }

    // Send the request with the introspection query
    let mut request_builder = client.post(url);

    // Add parsed headers to the request
    for (key, value) in headers_key_value_map.iter() {
        request_builder = request_builder.header(key, value);
    }

    // Construct the JSON body with `query` and optional `variables`.
    let request_body = if let Some(vars) = variables {
        json!({
            "query": query,
            "variables": serde_json::from_str::<Value>(&vars).map_err(|e| e.to_string())?
        })
    } else {
        json!({ "query": query })
    };

    // Send the request with the provided GraphQL query.
    // This converts `query` into a JSON body with a "query" field.
    let response = request_builder
        .json(&request_body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    // Capture the HTTP status of the response.
    let status = response.status();
    // Clone response headers for processing.
    let response_headers = response.headers().clone();
    // Extract response value from response
    let response_text_result = decode_response_body(response).await;
    let response_text = match response_text_result {
        Ok(value) => value,
        Err(err) => format!("Error: {}", err),
    };

    // Convert headers to JSON format for the final response structure.
    let headers_json: Value = response_headers
        .iter()
        .map(|(name, value)| (name.to_string(), value.to_str().unwrap_or("").to_string()))
        .collect();

    // Format the final response JSON structure, including status, headers, and body.
    let formatted_response = json!({
        "status": status.to_string(),
        "headers": headers_json,
        "body": response_text,
    });

    // Serialize the final response JSON to a string.
    return match serde_json::to_string(&formatted_response) {
        Ok(value) => Ok(value.to_string()),
        Err(err) => Err(err.to_string()),
    };
}

// Driver Function
fn main() {
    // Initiate Tauri Runtime
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            // Get the main window (fallback to "windows" if "main" isn't available)
            #[cfg(any(target_os = "linux", all(debug_assertions, windows)))]
            {
                use tauri_plugin_deep_link::DeepLinkExt;
                app.deep_link().register_all();
            }
            let window = if app.get_webview_window("main").is_some() {
                app.get_webview_window("main").unwrap()
            } else {
                app.get_webview_window("windows").unwrap()
            };
            // Show and focus the window
            let _ = window.unminimize();
            let _ = window.show();
            let _ = window.set_focus();

            // Emit general single-instance payload
            let _ = app
                .emit(
                    "single-instance",
                    SingleInstancePayload {
                        args: argv.clone(),
                        cwd: _cwd,
                    },
                )
                .unwrap();

            if argv.len() > 1 {
                let _ = app
                    .emit(
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
            app.manage(Arc::new(AppState {
                connections: Mutex::new(std::collections::HashMap::new()),
            }));
            app.manage(Arc::new(SocketIoAppState {
                connections: Mutex::new(std::collections::HashMap::new()),
            }));

            // Hide Titlebar for MacOS and close the additional window
            let platform_name = platform();
            if platform_name == "macos" || platform_name == "linux" {
                // Fetch tauri windows
                let macos_window = app.get_webview_window("main").unwrap();
                let windows_window: WebviewWindow = app.get_webview_window("windows").unwrap();

                // Close Windows window which has decoration set to false
                let _ = windows_window.close();

                // Hide Titlebar
                macos_window.set_transparent_titlebar(true, true);
            } else {
                // Close Mac window which has decoration set to true
                let macos_window = app.get_webview_window("main").unwrap();
                let _ = macos_window.close();
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            fetch_swagger_url_command,
            get_policy_config,
            get_git_branches,
            get_git_active_branch,
            fetch_file_command,
            fetch_folder_command,
            close_oauth_window,
            make_http_request,
            make_http_request_v2,
            connect_websocket,
            send_websocket_message,
            disconnect_websocket,
            connect_socket_io,
            disconnect_socket_io,
            send_socket_io_message,
            send_graphql_request,
            show_toolbar,
            hide_toolbar
        ])
        .on_page_load(|wry_window, _payload| {
            if let Ok(url) = wry_window.url() {
                if url.host_str() == Some("www.google.com") {
                    wry_window
                        .emit(
                            "receive-login",
                            Payload {
                                url: _payload.url().to_string(),
                            },
                        )
                        .unwrap();
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
