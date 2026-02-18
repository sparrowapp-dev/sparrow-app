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
    let window_result = WebviewWindowBuilder::new(
        &app,
        &window_label,
        WebviewUrl::External(parsed_auth_url),
    )
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
            let callback_data = OAuthCallbackData {
                code,
                error,
                state,
            };
            let _ = app_for_callback.emit("oauth-callback-received", callback_data);

            // Close the OAuth window
            if let Some(oauth_window) = app_for_callback.get_webview_window(&window_label_for_close) {
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

    match window_result {
        Ok(_) => Ok(()),
        Err(e) => {
            let err_msg = format!("Failed to create OAuth window: {}", e);
            Err(err_msg)
        }
    }
}
