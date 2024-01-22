// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![windows_subsystem = "windows"]

mod config;
mod formdata_handler;
mod json_handler;
mod raw_handler;
mod url_fetch_handler;
mod urlencoded_handler;
use formdata_handler::make_formdata_request;
use json_handler::make_json_request;
use nfd::Response;
use raw_handler::make_text_request;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;
use serde_json::Value;
use std::collections::HashMap;
use std::{thread, time};
use tauri::Manager;
use url_fetch_handler::import_swagger_url;
use urlencoded_handler::make_www_form_urlencoded_request;
use window_shadows::set_shadow;
// Commands
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
async fn open_oauth_window(handle: tauri::AppHandle) {
    let oauth_window = handle.get_window("oauth");
    if oauth_window == None {
        tauri::WindowBuilder::new(
            &handle,
            "oauth", /* the unique window label */
            tauri::WindowUrl::External(
                "https://dev-api.sparrow.techdomeaks.com/api/auth/google"
                    .parse()
                    .unwrap(),
            ),
        )
        .title("")
        .build()
        .unwrap();
    } else {
        let oauth_window = handle.get_window("oauth").unwrap();
        let _ = oauth_window.eval(&format!(
            "window.location.replace('https://dev-api.sparrow.techdomeaks.com/api/auth/google')"
        ));
        let one_sec = time::Duration::from_secs(1);
        thread::sleep(one_sec);

        let _ = oauth_window.center();
        let _ = oauth_window.show();
    }
    let oauth_window = handle.get_window("oauth").unwrap();
    oauth_window
        .emit(
            "onclose",
            OnClosePayload {
                message: "Window Close Event".into(),
            },
        )
        .unwrap();
}

#[tauri::command]
async fn close_oauth_window(handle: tauri::AppHandle) {
    let oauth_window = handle.get_window("oauth").unwrap();
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
    tab_id: &str,
) -> Result<String, String> {
    let result = make_request(url, method, headers, body, request).await;

    let result_value = match result {
        Ok(value) => value.to_string(),
        Err(err) => err.to_string(),
    };

    let response = json!({
        "body": result_value,
        "tabId": tab_id
    });
    return match serde_json::to_string(&response) {
        Ok(value) => Ok(value.to_string()),
        Err(err) => Err(err.to_string()),
    };
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
        .split('&')
        .map(|s| {
            let mut parts = s.split('=');
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

// Driver Function
fn main() {
    // Initiate Tauri Runtime
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            fetch_swagger_url_command,
            fetch_file_command,
            open_oauth_window,
            close_oauth_window,
            make_http_request
        ])
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            set_shadow(&window, true).expect("Unsupported platform!");
            Ok(())
        })
        .on_page_load(|wry_window, _payload| {
            if wry_window.url().host_str() == Some("www.google.com") {
                wry_window
                    .emit_all(
                        "receive-login",
                        Payload {
                            url: _payload.url().into(),
                        },
                    )
                    .unwrap();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
