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
use serde_json::json;
use serde_json::Value;
use std::collections::HashMap;
use std::{thread, time};
use tauri::Manager;
use tokio::sync::mpsc;
use tokio::sync::Mutex;
use tracing::info;
use tracing_subscriber;
use url_fetch_handler::import_swagger_url;
use urlencoded_handler::make_www_form_urlencoded_request;


async fn make_request(
    url: &str,
    method: &str,
    headers: &str,
    body: &str,
    request: &str,
) -> Result<Value, Box<dyn std::error::Error + Send + Sync>> {
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
            return Err(err);
        }
    };

    // Extracting Headers, StatusCode & Response
    let headers = response_value.headers().clone();
    let status = response_value.status().clone();
    let response_text = response_value.text().await?;
    let headers_json: serde_json::Value = headers
        .iter()
        .map(|(name, value)| (name.to_string(), value.to_str().unwrap()))
        .collect();

    // Combining all parameters
    let combined_json = json!({
        "headers": headers_json,
        "status": status.to_string(),
        "response": response_text
    });
    return Ok(combined_json);
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
fn fetch_file_command() -> String {
    let result = nfd::open_file_dialog(None, None).expect("Error opening file dialog");
    let mut response;
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

#[derive(Clone, serde::Serialize)]
struct OnClosePayload {
    message: String,
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

#[derive(Clone, serde::Serialize)]
struct Payload {
    url: String,
}

#[derive(Clone, serde::Serialize)]
struct Payload1 {
    message: String,
}

struct AsyncProcInputTx {
    inner: Mutex<mpsc::Sender<Vec<String>>>,
}

fn main() {
    tracing_subscriber::fmt::init();

    let (async_proc_input_tx, async_proc_input_rx) = mpsc::channel::<Vec<String>>(100);
    let (async_proc_output_tx, mut async_proc_output_rx) = mpsc::channel::<Vec<String>>(100);

    tauri::Builder::default()
        .manage(AsyncProcInputTx {
            inner: Mutex::new(async_proc_input_tx),
        })
        .invoke_handler(tauri::generate_handler![
            // make_type_request_command,
            fetch_swagger_url_command,
            fetch_file_command,
            open_oauth_window,
            close_oauth_window,
            js2rs
        ])
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
        .setup(|app| {
            tauri::async_runtime::spawn(async move {
                async_process_model(async_proc_input_rx, async_proc_output_tx).await
            });

            let app_handle = app.handle();
            tauri::async_runtime::spawn(async move {
                loop {
                    if let Some(output) = async_proc_output_rx.recv().await {
                        rs2js(output, &app_handle);
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn rs2js<R: tauri::Runtime>(message: Vec<String>, manager: &impl Manager<R>) {
    // info!(?message, "rs2js");
    manager.emit_all("rs2js", message).unwrap();
}

#[tauri::command]
async fn js2rs(
    message: Vec<String>,
    state: tauri::State<'_, AsyncProcInputTx>,
) -> Result<(), String> {
    info!(?message, "js2rs");
    let async_proc_input_tx = state.inner.lock().await;
    async_proc_input_tx
        .send(message)
        .await
        .map_err(|e| e.to_string())
}

async fn async_process_model(
    mut input_rx: mpsc::Receiver<Vec<String>>,
    output_tx: mpsc::Sender<Vec<String>>,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    while let Some(input) = input_rx.recv().await {
        info!(?input, "async_process_model");
        let start = chrono::offset::Local::now();
        let result = make_request(&input[0], &input[1], &input[2], &input[3], &input[4]);
        let result_value = match result.await {
            Ok(value) => value.to_string(),
            Err(err) => err.to_string(),
        };
        // info!(?result_value, "async_process_model");
        let mut string_vector: Vec<String> = Vec::new();
        string_vector.push(result_value);
        let tab_id: String = input.clone().remove(5);
        string_vector.push(tab_id);
        string_vector.push(start.to_string());
        output_tx.send(string_vector).await?;
    }

    Ok(())
}
