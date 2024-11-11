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
// Submodules
mod config;
mod formdata_handler;
mod json_handler;
mod raw_handler;
mod request_handler;
mod url_fetch_handler;
mod urlencoded_handler;
mod utils;

// External Imports
use formdata_handler::make_formdata_request;
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
use tauri::Manager;
use tauri::Window;
use url_fetch_handler::import_swagger_url;
use urlencoded_handler::make_www_form_urlencoded_request;
use utils::response_decoder::decode_response_body;

// Web socket imports
use futures_util::{SinkExt, StreamExt};
use http::header;
use hyper::client::HttpConnector;
use hyper::header::HeaderValue;
use hyper::header::{CONNECTION, UPGRADE};
use hyper::{Client as OtherClient, Request};
use hyper_tls::HttpsConnector;
use native_tls::TlsConnector;
use std::sync::Arc;
use tauri::AppHandle;
use tauri::State;
use tokio::sync::mpsc::{self, UnboundedSender};
use tokio::sync::Mutex;
use tokio_tungstenite::client_async;
use tokio_tungstenite::tungstenite::protocol::Message;
use tokio_tungstenite::tungstenite::protocol::WebSocketConfig;
use tokio_tungstenite::WebSocketStream;
use tokio_tungstenite::{connect_async, Connector};

// Socket.IO imports
use rust_socketio::{
    client as SocketClient, ClientBuilder, Payload as SocketPayload, TransportType,
};
use tokio::sync::Mutex as SocketMutex;
use tokio::time::{timeout, Duration};

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

    // Extract response value from response
    let response_text_result = decode_response_body(response_value).await;

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

#[derive(Clone)]
struct TabConnection {
    sender: UnboundedSender<String>,
    disconnect_handle: Arc<Mutex<Option<tokio::sync::oneshot::Sender<()>>>>,
}

struct AppState {
    connections: Mutex<std::collections::HashMap<String, TabConnection>>,
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

    // Clone the tabid to avoid moving
    let svelte_tabid = tabid.clone();
    let app_handle_clone = app_handle.clone();
    tokio::spawn(async move {
        tokio::select! {
            _ = disconnect_rx => {
                // Handle disconnection here
                println!("WebSocket connection closed for tab: {}", svelte_tabid);
            }
            _ = async {
                while let Some(message) = read.next().await {
                    match message {
                        Ok(Message::Text(text)) => {
                            app_handle_clone
                                .emit(&format!("ws_message_{}", svelte_tabid), text)
                                .unwrap();
                        },
                        Ok(Message::Close(frame)) => {
                            println!("WebSocket connection closed gracefully for tab: {}", svelte_tabid);
                            app_handle_clone
                                .emit(&format!("ws_graceful_disconnect_{}", svelte_tabid), format!("Disconnection detected: {:?}","error"))
                                .unwrap();
                            break;
                        },
                        Err(e) => {
                            println!("Abrupt disconnection detected for tab {}: {:?}", svelte_tabid, e);
                            app_handle_clone
                                .emit(&format!("ws_error_{}", svelte_tabid), format!("Disconnection detected: {:?}", e))
                                .unwrap();
                            break;
                        },
                        _ => {}
                    }
                }
            } => {}
        }
    });

    // Clone the tabid for this async task as well
    let svelte_tabid_clone = tabid.clone();
    tokio::spawn(async move {
        while let Some(msg) = rx.recv().await {
            if let Err(e) = write.send(Message::Text(msg)).await {
                println!("Error sending message for tab {}: {:?}", svelte_tabid_clone, e);
            }
        }
    });

    // Create a success response
    let response = WebSocketResponse {
        is_successful: true,
        status_code: 200,
        message: "Connected Successfully".to_string(),
        headers: Some(response_headers),
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

#[derive(Clone)]
struct SocketIoConnection {
    sender: UnboundedSender<String>,
    disconnect_handle: Arc<SocketMutex<Option<tokio::sync::oneshot::Sender<()>>>>,
}

struct SocketIoAppState {
    connections: SocketMutex<HashMap<String, SocketIoConnection>>,
}

#[derive(Serialize)]
struct SocketIoResponse {
    is_successful: bool,
    status_code: u16,
    message: String,
}

#[tauri::command]
async fn connect_socketio(
    url: String,
    namespace: String,
    tabid: String,
    headers: String, // JSON headers
    state: tauri::State<'_, Arc<SocketIoAppState>>,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    // Deserialize the JSON string into a Vec<KeyValue>
    let headers_key_values: Vec<KeyValue> =
        serde_json::from_str(&headers).map_err(|e| format!("Failed to parse headers: {}", e))?;

    let mut headers_key_value_map: HashMap<String, String> = HashMap::new();
    for kv in headers_key_values {
        headers_key_value_map.insert(kv.key, kv.value);
    }

    // Construct proper Socket.IO URL for initial WebSocket connection
    let ws_protocol = if url.starts_with("https://") {
        "wss://"
    } else {
        "ws://"
    };
    let base_url = url.replace("http://", "").replace("https://", "");

    let full_url = format!(
        "{}{}/socket.io/?EIO=4&transport=websocket",
        ws_protocol, base_url
    );

    println!("Attempting to connect to: {}", full_url); // Debug log

    // Add default WebSocket headers
    let mut request = Request::builder()
        .uri(&full_url)
        .header("Upgrade", "websocket")
        .header("Connection", "Upgrade");

    // Add custom headers
    for (key, value) in headers_key_value_map.iter() {
        if let Ok(header_value) = HeaderValue::from_str(value) {
            request = request.header(key, header_value);
        }
    }

    // Connect directly using tokio-tungstenite
    let (ws_stream, _) = connect_async(full_url)
        .await
        .map_err(|e| format!("WebSocket connection failed: {:?}", e))?;

    println!("WebSocket connection established"); // Debug log

    let (write, mut read) = ws_stream.split();
    let write = Arc::new(Mutex::new(write));

    // Create channel for sending messages
    let (tx, mut rx) = mpsc::unbounded_channel::<String>();

    // Create channel for disconnect signal
    let (disconnect_tx, disconnect_rx) = tokio::sync::oneshot::channel();
    let disconnect_handle = Arc::new(SocketMutex::new(Some(disconnect_tx)));

    // Send the Socket.IO connection packet with namespace
    let connect_msg = format!("40{}", namespace);

    {
        let mut writer = write.lock().await;
        if let Err(e) = writer.send(Message::Text(connect_msg.clone())).await {
            return Err(format!("Failed to send connect message: {:?}", e).into());
        }
        println!("Sent connect message: {}", connect_msg); // Debug log
    }

    // Wait for namespace acknowledgment
    let ack_result = timeout(Duration::from_secs(5), async {
        while let Some(Ok(msg)) = read.next().await {
            if let Message::Text(text) = msg {
                if text.starts_with("40") && text.contains(&namespace) {
                    println!("Namespace acknowledged by server.");
                    return Ok(());
                }
            }
        }
        Err("Namespace acknowledgment not received".to_string())
    })
    .await
    .map_err(|_| "Timeout while waiting for namespace acknowledgment".to_string())??;

    // Set up message handling
    // Create SocketIoConnection instance
    let connection = SocketIoConnection {
        sender: tx,
        disconnect_handle: Arc::clone(&disconnect_handle),
    };

    // Store the connection in app state
    {
        let mut connections = state.connections.lock().await;
        connections.insert(tabid.clone(), connection);
    }

    // Spawn a task to handle incoming messages
    let write_clone = Arc::clone(&write);
    tokio::spawn(async move {
        while let Some(msg) = rx.recv().await {
            let mut writer = write_clone.lock().await;
            if let Err(e) = writer.send(Message::Text(msg.clone())).await {
                eprintln!("Failed to send message: {:?}", e);
            } else {
                println!("Successfully sent message: {}", msg); // Debug log
            }
        }
    });

    // COmmenting the ping/pong handler {if required can be used in future}
    // Improved ping/pong handler
    // let write_clone_for_ping = Arc::clone(&write);
    // tokio::spawn(async move {
    //     let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(25));
    //     loop {
    //         interval.tick().await;
    //         let mut writer = write_clone_for_ping.lock().await;
    //         // Send proper Socket.IO ping packet (2 is the ping packet type in Socket.IO v4)
    //         if let Err(e) = writer.send(Message::Text("2".to_string())).await {
    //             eprintln!("Failed to send ping: {:?}", e);
    //             break;
    //         }
    //         println!("Sent ping packet");
    //     }
    // });

    // Improved message receiver with proper ping/pong handling
    let app_handle_clone = app_handle.clone();
    let tabid_clone = tabid.clone();
    tokio::spawn(async move {
        let mut read_stream = read;

        tokio::select! {
            _ = async {
                while let Some(Ok(msg)) = read_stream.next().await {
                    match msg {
                        Message::Text(text) => {
                            // Handle different Socket.IO packet types
                            if text.starts_with('2') {
                                // Received ping, send pong
                                let mut writer = write.lock().await;
                                let _ = writer.send(Message::Text("3".to_string())).await;
                                println!("Received ping, sent pong");
                            } else if text.starts_with('3') {
                                // Received pong
                                println!("Received pong");
                            } else {
                                // Regular message, emit to frontend
                                let _ = app_handle_clone.emit(
                                    &format!("socket-message-{}", tabid_clone),
                                    text
                                );
                            }
                        }
                        Message::Close(frame) => {
                            println!("Received close frame: {:?}", frame);
                            break;
                        }
                        _ => {}
                    }
                }
            } => {}
            _ = disconnect_rx => {
                println!("Disconnect signal received for {}", tabid_clone);
            }
        }
    });

    let response = SocketIoResponse {
        is_successful: true,
        status_code: 200,
        message: "Socket.IO connected successfully".to_string(),
    };

    Ok(serde_json::to_string(&response).map_err(|e| format!("Serialization failed: {}", e))?)
}

#[tauri::command]
async fn send_socketio_message(
    tabid: String,
    namespace: String,
    event: String,
    message: String,
    state: tauri::State<'_, Arc<SocketIoAppState>>,
) -> Result<String, String> {
    // Get the connection for the specified tabid
    let connections = state.connections.lock().await;
    let connection = connections
        .get(&tabid)
        .ok_or_else(|| format!("No Socket.IO connection found for tab ID: {}", tabid))?;

    if connection.sender.is_closed() {
        return Err("Connection is not active. Cannot send message.".to_string());
    }

    let message_json = serde_json::to_string(&message)
        .map_err(|e| format!("Failed to serialize message: {}", e))?;
    let socket_message = if event.is_empty() {
        format!("42{}", message_json) // Unnamed event message
    } else {
        format!("42{},[\"{}\",{}]", namespace, event, message_json) // Named event message
    };

    // Send the message through the connection's sender
    connection
        .sender
        .send(socket_message.clone())
        .map_err(|e| format!("Failed to send message: {}", e))?;

    // Create and return the response
    let response = SocketIoResponse {
        is_successful: true,
        status_code: 200,
        message: format!("Message sent successfully to event: {}", event),
    };

    serde_json::to_string(&response).map_err(|e| format!("Failed to serialize response: {}", e))
}

#[derive(Serialize)]
struct SocketIoDisconnectResponse {
    is_successful: bool,
    status_code: u16,
    message: String,
}

#[tauri::command]
async fn disconnect_socketio(
    tabid: String,
    state: tauri::State<'_, Arc<SocketIoAppState>>,
) -> Result<String, String> {
    let mut connections = state.connections.lock().await;

    if let Some(connection) = connections.remove(&tabid) {
        // Access the disconnect handle
        let mut handle_lock = connection.disconnect_handle.lock().await;

        // Check if there is a Sender inside the Option
        if let Some(sender) = std::mem::take(&mut *handle_lock) {
            // Send the signal to close the Socket.IO connection
            let _ = sender.send(());
        }

        // Create a success response
        let response = SocketIoDisconnectResponse {
            is_successful: true,
            status_code: 200,
            message: "Socket.IO connection disconnected successfully".to_string(),
        };

        // Serialize the response to a JSON string and return it
        let response_json = serde_json::to_string(&response)
            .map_err(|e| format!("Failed to serialize response: {}", e))?;

        return Ok(response_json);
    } else {
        // Return an error if the connection was not found
        let response = SocketIoDisconnectResponse {
            is_successful: false,
            status_code: 404,
            message: "Socket.IO connection not found".to_string(),
        };

        // Serialize the error response to a JSON string and return it
        let response_json = serde_json::to_string(&response)
            .map_err(|e| format!("Failed to serialize response: {}", e))?;

        return Err(response_json);
    }
}

// Commenting the listen function as we will segregate the responses for events in frontend.
// #[tauri::command]
// async fn listen_socketio_event(
//     tabid: String,
//     event_name: String,
//     state: tauri::State<'_, Arc<SocketIoAppState>>,
//     app_handle: tauri::AppHandle,
// ) -> Result<String, String> {
//     let connections = state.connections.lock().await;

//     if let Some(connection) = connections.get(&tabid) {
//         let client_clone = connection.client_builder.clone(); // This is Arc<Client>
//         let event_name_clone = event_name.clone();
//         let app_handle_clone = app_handle.clone();

//         // Dereference client_clone before the async block
//         let client = (*client_clone).clone(); // Clone the underlying Client

//         // Create a new listener for the specified event
//         tokio::spawn(async move {
//             // Dereference client_clone to access Client's methods
//             client.on(event_name_clone.as_str(), {
//                 let app_handle_clone = app_handle.clone(); // Clone app_handle for use in the closure
//                 move |payload, _| {
//                     if let SocketPayload::Text(text) = payload {
//                         // Emit message to frontend in Tauri
//                         app_handle_clone
//                             .emit(&format!("socketio_message_{}", tabid), text)
//                             .unwrap();
//                     }
//                 }
//             });
//         });

//         // Create a success response
//         let response = format!("Listening for event '{}'", event_name);
//         Ok(response)
//     } else {
//         // Return an error if the connection was not found
//         let response = format!("Socket.IO connection not found for tab ID: {}", tabid);
//         Err(response)
//     }
// }

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
            let app_handle = app.handle().clone();
            app.manage(Arc::new(AppState {
                connections: Mutex::new(std::collections::HashMap::new()),
            }));
            app.manage(Arc::new(SocketIoAppState {
                connections: Mutex::new(std::collections::HashMap::new()),
            }));
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
            connect_websocket,
            send_websocket_message,
            disconnect_websocket,
            connect_socketio,
            send_socketio_message,
            disconnect_socketio,
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
