use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::{AppHandle, Emitter, Manager, WebviewUrl, WebviewWindowBuilder};
use tokio::sync::Mutex;
use url::Url;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OAuthCallbackData {
    pub code: Option<String>,
    pub error: Option<String>,
    pub state: Option<String>,
}

/// Shared state holding the cancel sender for an in-progress browser OAuth flow.
pub struct OAuthBrowserCancelState(pub Arc<Mutex<Option<tokio::sync::oneshot::Sender<()>>>>);

impl Default for OAuthBrowserCancelState {
    fn default() -> Self {
        Self(Arc::new(Mutex::new(None)))
    }
}

/// Opens a new window for OAuth authorization flow
#[tauri::command]
pub async fn open_oauth_window(
    app: AppHandle,
    auth_url: String,
    callback_url: String,
) -> Result<(), String> {
    // Create a unique window label
    let window_label = format!("oauth-{}", chrono::Utc::now().timestamp_millis());

    // Parse auth URL
    let parsed_auth_url = auth_url.parse().map_err(|e| {
        let err_msg = format!("Invalid auth URL: {}", e);
        err_msg
    })?;

    // Clone values for use in callback
    let app_for_callback = app.clone();
    let callback_url_for_check = callback_url.clone();
    let window_label_for_close = window_label.clone();

    // Track if callback was already processed to prevent duplicate handling
    let callback_processed = Arc::new(Mutex::new(false));
    let callback_processed_clone = callback_processed.clone();

    // Create the OAuth window with navigation handler
    let window_result =
        WebviewWindowBuilder::new(&app, &window_label, WebviewUrl::External(parsed_auth_url))
            .title("Sign In")
            .inner_size(500.0, 700.0)
            .center()
            .resizable(true)
            .visible(true)
            .focused(true)
            .on_navigation(move |url| {
                let url_str = url.to_string();

                // Check if this is the callback URL
                if url_str.starts_with(&callback_url_for_check) {
                    // Use try_lock to avoid blocking - if already processing, allow navigation
                    let mut processed = match callback_processed_clone.try_lock() {
                        Ok(guard) => guard,
                        Err(_) => return false, // Already being processed, block navigation
                    };

                    if *processed {
                        return false; // Already processed, block navigation
                    }
                    *processed = true;
                    drop(processed); // Release lock before doing more work

                    // Parse query parameters from the callback URL
                    let mut code: Option<String> = None;
                    let mut error: Option<String> = None;
                    let mut state: Option<String> = None;

                    if let Ok(parsed_url) = Url::parse(&url_str) {
                        for (key, value) in parsed_url.query_pairs() {
                            match key.as_ref() {
                                "code" => code = Some(value.to_string()),
                                "error" => error = Some(value.to_string()),
                                "state" => state = Some(value.to_string()),
                                _ => {}
                            }
                        }
                    }

                    // Send callback data to frontend
                    let callback_data = OAuthCallbackData { code, error, state };
                    let _ = app_for_callback.emit("oauth-callback-received", callback_data);

                    // Close the OAuth window
                    if let Some(oauth_window) =
                        app_for_callback.get_webview_window(&window_label_for_close)
                    {
                        let _ = oauth_window.close();
                    }

                    // Return false to prevent navigation to the callback URL
                    // This avoids loading a potentially non-existent page
                    return false;
                }

                // Allow all other navigations
                true
            })
            .build();

    // Detect manual window closure: if the user closes the window without
    // completing authentication, emit an error so the TypeScript promise rejects
    // immediately instead of hanging until the 5-minute timeout.
    if let Ok(ref window) = window_result {
        let app_for_close = app.clone();
        let callback_processed_for_close = callback_processed.clone();
        window.on_window_event(move |event| {
            if let tauri::WindowEvent::Destroyed = event {
                if let Ok(processed) = callback_processed_for_close.try_lock() {
                    if !*processed {
                        let _ = app_for_close.emit(
                            "oauth-callback-received",
                            OAuthCallbackData {
                                code: None,
                                error: Some("Authorization cancelled by user".to_string()),
                                state: None,
                            },
                        );
                    }
                }
            }
        });
    }

    match window_result {
        Ok(_) => Ok(()),
        Err(e) => {
            let err_msg = format!("Failed to create OAuth window: {}", e);
            Err(err_msg)
        }
    }
}

/// Opens the system browser for OAuth authorization and captures the callback
/// via a temporary local HTTP server on BROWSER_CALLBACK_URL.
///
/// The frontend should pass the full authorization URL (already containing
/// `redirect_uri=http://localhost:51423/callback`) as `auth_url`.
#[tauri::command]
pub async fn open_oauth_browser(
    app: AppHandle,
    auth_url: String,
    cancel_state: tauri::State<'_, OAuthBrowserCancelState>,
) -> Result<(), String> {
    use tauri_plugin_shell::ShellExt;
    use tokio::io::{AsyncReadExt, AsyncWriteExt};
    use tokio::net::TcpListener;

    let cancel_arc = cancel_state.0.clone();

    // Bind to the well-known callback port
    let listener = TcpListener::bind("127.0.0.1:51423")
        .await
        .map_err(|e| format!("Failed to start local callback server on port 51423: {}", e))?;

    // Create a one-shot cancel channel and store the sender in shared state so
    // cancel_oauth_browser can signal us to stop waiting.
    let (cancel_tx, cancel_rx) = tokio::sync::oneshot::channel::<()>();
    {
        let mut lock = cancel_arc.lock().await;
        // Cancel any stale previous flow
        if let Some(old_tx) = lock.take() {
            let _ = old_tx.send(());
        }
        *lock = Some(cancel_tx);
    }

    // Open the authorization URL in the system default browser
    #[allow(deprecated)]
    app.shell()
        .open(&auth_url, None)
        .map_err(|e| format!("Failed to open browser: {}", e))?;

    // Wait for: (a) OAuth callback, (b) user cancellation, or (c) 5-min timeout.
    let stream_opt: Option<(tokio::net::TcpStream, std::net::SocketAddr)> = tokio::select! {
        accept = listener.accept() => {
            match accept {
                Ok(conn) => Some(conn),
                Err(e) => {
                    cancel_arc.lock().await.take();
                    return Err(format!("Failed to accept local connection: {}", e));
                }
            }
        }
        _ = tokio::time::sleep(std::time::Duration::from_secs(300)) => {
            cancel_arc.lock().await.take();
            let _ = app.emit("oauth-callback-received", OAuthCallbackData {
                code: None,
                error: Some("Authorization timeout: no callback received within 5 minutes".to_string()),
                state: None,
            });
            None
        }
        _ = cancel_rx => {
            // cancel_oauth_browser already emitted the error event; just return.
            None
        }
    };

    // Clear the cancel token now that we have a result (or were cancelled)
    cancel_arc.lock().await.take();

    let (mut stream, _peer_addr) = match stream_opt {
        Some(conn) => conn,
        None => return Ok(()),
    };

    // Read the raw HTTP request (first 8 KB is enough to capture the request line)
    let mut buf = [0u8; 8192];
    let n = stream
        .read(&mut buf)
        .await
        .map_err(|e| format!("Failed to read callback request: {}", e))?;
    let request = String::from_utf8_lossy(&buf[..n]);

    // Extract the request path from the first line, e.g. "GET /callback?code=... HTTP/1.1"
    let path = request
        .lines()
        .next()
        .and_then(|line| line.split_whitespace().nth(1))
        .unwrap_or("/");

    // Parse query parameters using the `url` crate
    let mut code: Option<String> = None;
    let mut error: Option<String> = None;
    let mut state: Option<String> = None;

    let dummy_url = format!("http://localhost{}", path);
    if let Ok(parsed_url) = Url::parse(&dummy_url) {
        for (key, value) in parsed_url.query_pairs() {
            match key.as_ref() {
                "code" => code = Some(value.to_string()),
                "error" => error = Some(value.to_string()),
                "state" => state = Some(value.to_string()),
                _ => {}
            }
        }
    }

    // Respond to the browser so the user sees a friendly message
    let response_body = if code.is_some() {
        "<html><head><title>Authorized</title></head><body style=\"font-family:sans-serif;text-align:center;padding:60px\"><h2>Authorization successful!</h2><p>You can close this tab and return to Sparrow.</p></body></html>"
    } else {
        "<html><head><title>Authorization Failed</title></head><body style=\"font-family:sans-serif;text-align:center;padding:60px\"><h2>Authorization failed</h2><p>You can close this tab and return to Sparrow.</p></body></html>"
    };

    let http_response = format!(
        "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
        response_body.len(),
        response_body
    );

    let _ = stream.write_all(http_response.as_bytes()).await;
    let _ = stream.flush().await;

    // Emit the callback event to the frontend (same event as the webview flow)
    let callback_data = OAuthCallbackData { code, error, state };
    let _ = app.emit("oauth-callback-received", callback_data);

    Ok(())
}

/// Cancels an in-progress webview OAuth window opened by open_oauth_window.
/// Finds any window whose label starts with "oauth-" and closes it.
/// The existing on_window_event(Destroyed) handler will emit the cancel error event.
#[tauri::command]
pub async fn cancel_oauth_window(app: AppHandle) -> Result<(), String> {
    let windows = app.webview_windows();
    for (label, window) in windows {
        if label.starts_with("oauth-") {
            let _ = window.close();
            break;
        }
    }
    Ok(())
}

/// Cancels an in-progress browser OAuth authorization started by open_oauth_browser.
/// Signals the background TCP server to stop waiting and emits an error event so the
/// TypeScript promise rejects immediately.
#[tauri::command]
pub async fn cancel_oauth_browser(
    app: AppHandle,
    cancel_state: tauri::State<'_, OAuthBrowserCancelState>,
) -> Result<(), String> {
    let mut lock = cancel_state.0.lock().await;
    if let Some(tx) = lock.take() {
        // Signal open_oauth_browser's tokio::select! to exit
        let _ = tx.send(());
    }
    // Emit the error event regardless so the TypeScript listener always unblocks
    let _ = app.emit(
        "oauth-callback-received",
        OAuthCallbackData {
            code: None,
            error: Some("Authorization cancelled by user".to_string()),
            state: None,
        },
    );
    Ok(())
}
