//! Response Temp File Management
//!
//! This module handles writing large HTTP response bodies to temporary files
//! to avoid keeping them in JS memory and causing UI freezes.

use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::{self, File};
use std::io::{Read, Write};
use std::io::{Seek, SeekFrom};
use std::path::PathBuf;
use std::sync::Mutex;

/// In-memory cache for file paths per tab
static FILE_CACHE: Lazy<Mutex<HashMap<String, ResponseArtifact>>> =
    Lazy::new(|| Mutex::new(HashMap::new()));

/// Response artifact containing paths to raw and formatted files
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponseArtifact {
    pub tab_id: String,
    pub raw_path: String,
    pub pretty_paths: HashMap<String, String>, // format -> path
    pub size_bytes: usize,
}

/// Get the temp directory for Sparrow responses
fn get_response_temp_dir() -> PathBuf {
    let temp_dir = std::env::temp_dir().join("sparrow").join("responses");
    // Create directory if it doesn't exist
    let _ = fs::create_dir_all(&temp_dir);
    temp_dir
}

/// Sanitize a tab ID for safe use in filesystem paths.
/// Allows only ASCII alphanumeric characters, '-' and '_'.
/// Returns None if the input is empty, contains path traversal sequences, or results in an empty string after sanitization.
fn sanitize_tab_id(tab_id: &str) -> Option<String> {
    // Check for problematic sequences in the original input before sanitization
    if tab_id.is_empty()
        || tab_id.starts_with('.')
        || tab_id.contains("..")
        || tab_id.contains('/')
        || tab_id.contains('\\')
        || tab_id.contains('\0')
    {
        return None;
    }

    let sanitized: String = tab_id
        .chars()
        .filter(|c| c.is_ascii_alphanumeric() || *c == '-' || *c == '_')
        .collect();

    if sanitized.is_empty() {
        return None;
    }

    Some(sanitized)
}

/// Write response body to a temp file
/// Returns the file path on success
#[tauri::command]
pub fn write_response_to_temp(tab_id: String, body: String) -> Result<String, String> {
    let safe_tab_id = sanitize_tab_id(&tab_id).ok_or_else(|| "Invalid tab_id".to_string())?;
    let temp_dir = get_response_temp_dir();
    let file_name = format!("{}.raw", safe_tab_id);
    let file_path = temp_dir.join(&file_name);

    let mut file =
        File::create(&file_path).map_err(|e| format!("Failed to create temp file: {}", e))?;

    file.write_all(body.as_bytes())
        .map_err(|e| format!("Failed to write to temp file: {}", e))?;

    let size_bytes = body.len();
    let path_str = file_path.to_string_lossy().to_string();

    // Update cache
    let mut cache = FILE_CACHE
        .lock()
        .map_err(|e| format!("Lock error: {}", e))?;
    let artifact = ResponseArtifact {
        tab_id: tab_id.clone(),
        raw_path: path_str.clone(),
        pretty_paths: HashMap::new(),
        size_bytes,
    };
    cache.insert(tab_id, artifact);

    Ok(path_str)
}

/// Write formatted response to a temp file
/// Returns the file path on success
#[tauri::command]
pub fn write_formatted_response(
    tab_id: String,
    format: String,
    content: String,
) -> Result<String, String> {
    let safe_tab_id = sanitize_tab_id(&tab_id).ok_or_else(|| "Invalid tab_id".to_string())?;
    let temp_dir = get_response_temp_dir();
    let file_name = format!("{}.pretty.{}", safe_tab_id, format);
    let file_path = temp_dir.join(&file_name);

    let mut file = File::create(&file_path)
        .map_err(|e| format!("Failed to create formatted temp file: {}", e))?;

    file.write_all(content.as_bytes())
        .map_err(|e| format!("Failed to write formatted content: {}", e))?;

    let path_str = file_path.to_string_lossy().to_string();

    // Update cache with pretty path
    let mut cache = FILE_CACHE
        .lock()
        .map_err(|e| format!("Lock error: {}", e))?;
    if let Some(artifact) = cache.get_mut(&tab_id) {
        artifact.pretty_paths.insert(format, path_str.clone());
    }

    Ok(path_str)
}

/// Read response content from temp file in chunks
/// Returns a string chunk from offset with given length
#[tauri::command]
pub fn read_response_file_chunk(
    file_path: String,
    offset: usize,
    length: usize,
) -> Result<String, String> {
    let mut file =
        std::fs::File::open(&file_path).map_err(|e| format!("Failed to open file: {}", e))?;
    file.seek(SeekFrom::Start(offset as u64))
        .map_err(|e| format!("Failed to seek: {}", e))?;
    let mut buffer = vec![0; length];
    let bytes_read = file
        .read(&mut buffer)
        .map_err(|e| format!("Failed to read file: {}", e))?;
    buffer.truncate(bytes_read);
    Ok(String::from_utf8_lossy(&buffer).to_string())
}

/// Clean up temp files for a specific tab
#[tauri::command]
pub fn cleanup_response_files(tab_id: String) -> Result<(), String> {
    let mut cache = FILE_CACHE
        .lock()
        .map_err(|e| format!("Lock error: {}", e))?;

    if let Some(artifact) = cache.remove(&tab_id) {
        // Remove raw file
        let _ = fs::remove_file(&artifact.raw_path);

        // Remove all pretty files
        for (_, path) in artifact.pretty_paths {
            let _ = fs::remove_file(&path);
        }
    }

    Ok(())
}

/// Clean up all response temp files
#[tauri::command]
pub fn cleanup_all_response_files() -> Result<(), String> {
    let temp_dir = get_response_temp_dir();

    if temp_dir.exists() {
        let _ = fs::remove_dir_all(&temp_dir);
        let _ = fs::create_dir_all(&temp_dir);
    }

    let mut cache = FILE_CACHE
        .lock()
        .map_err(|e| format!("Lock error: {}", e))?;
    cache.clear();

    Ok(())
}
