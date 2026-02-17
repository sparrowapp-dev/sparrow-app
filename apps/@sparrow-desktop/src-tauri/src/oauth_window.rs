use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Manager, WebviewUrl, WebviewWindowBuilder};
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

    // Create the OAuth window
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
    .build();

    let window = match window_result {
        Ok(w) => {
            w
        }
        Err(e) => {
            let err_msg = format!("Failed to create OAuth window: {}", e);
            return Err(err_msg);
        }
    };

    // Clone references for the async task
    let app_clone = app.clone();
    let window_clone = window.clone();
    let callback_url_clone = callback_url.clone();
    let window_label_clone = window_label.clone();
    
    // Spawn a task to poll the window URL
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(tokio::time::Duration::from_millis(250));
        let mut poll_count = 0;
        
        loop {
            interval.tick().await;
            poll_count += 1;
            
            // Check if window still exists
            if app_clone.get_webview_window(&window_label_clone).is_none() {
                break;
            }
            
            // Get current URL
            match window_clone.url() {
                Ok(current_url) => {
                    let url_str = current_url.to_string();
                    
                    // STRICT matching: Only match if URL starts with exact callback URL
                    // This prevents false positives with other pages on the same domain
                    if url_str.starts_with(&callback_url_clone) {
                        
                        // Parse query parameters
                        if let Ok(parsed_url) = Url::parse(&url_str) {
                            let mut code: Option<String> = None;
                            let mut error: Option<String> = None;
                            let mut state: Option<String> = None;

                            for (key, value) in parsed_url.query_pairs() {
                                match key.as_ref() {
                                    "code" => {
                                        code = Some(value.to_string());
                                    }
                                    "error" => {
                                        error = Some(value.to_string());
                                    }
                                    "state" => {
                                        state = Some(value.to_string());
                                    }
                                    _ => {}
                                }
                            }

                            // Send callback data
                            let callback_data = OAuthCallbackData {
                                code,
                                error,
                                state,
                            };

                            let _ = app_clone.emit("oauth-callback-received", callback_data);

                            // Close window
                            if let Some(oauth_window) = app_clone.get_webview_window(&window_label_clone) {
                                let _ = oauth_window.close();
                            }
                            
                            break;
                        } 
                    }
                }
                Err(e) => {
                }
            }
        }
        
    });

    Ok(())
}
