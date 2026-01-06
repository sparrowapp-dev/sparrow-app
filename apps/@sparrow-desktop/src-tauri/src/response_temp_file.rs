//! Response Temp File Management
//!
//! This module handles writing large HTTP response bodies to temporary files
//! to avoid keeping them in JS memory and causing UI freezes.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::{self, File};
use std::io::{BufReader, Read, Write};
use std::path::PathBuf;
use std::sync::Mutex;
use once_cell::sync::Lazy;

/// Threshold in bytes above which responses are stored as files (1MB)
const LARGE_RESPONSE_THRESHOLD: usize = 1_000_000;

/// Size threshold for streaming reads (64KB chunks)
const STREAM_CHUNK_SIZE: usize = 65536;

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

/// Write response body to a temp file
/// Returns the file path on success
#[tauri::command]
pub fn write_response_to_temp(tab_id: String, body: String) -> Result<String, String> {
    let temp_dir = get_response_temp_dir();
    let file_name = format!("{}.raw", tab_id);
    let file_path = temp_dir.join(&file_name);
    
    let mut file = File::create(&file_path)
        .map_err(|e| format!("Failed to create temp file: {}", e))?;
    
    file.write_all(body.as_bytes())
        .map_err(|e| format!("Failed to write to temp file: {}", e))?;
    
    let size_bytes = body.len();
    let path_str = file_path.to_string_lossy().to_string();
    
    // Update cache
    let mut cache = FILE_CACHE.lock().map_err(|e| format!("Lock error: {}", e))?;
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
pub fn write_formatted_response(tab_id: String, format: String, content: String) -> Result<String, String> {
    let temp_dir = get_response_temp_dir();
    let file_name = format!("{}.pretty.{}", tab_id, format);
    let file_path = temp_dir.join(&file_name);
    
    let mut file = File::create(&file_path)
        .map_err(|e| format!("Failed to create formatted temp file: {}", e))?;
    
    file.write_all(content.as_bytes())
        .map_err(|e| format!("Failed to write formatted content: {}", e))?;
    
    let path_str = file_path.to_string_lossy().to_string();
    
    // Update cache with pretty path
    let mut cache = FILE_CACHE.lock().map_err(|e| format!("Lock error: {}", e))?;
    if let Some(artifact) = cache.get_mut(&tab_id) {
        artifact.pretty_paths.insert(format, path_str.clone());
    }
    
    Ok(path_str)
}

/// Read response content from temp file
/// For large files, returns content in streaming manner
#[tauri::command]
pub fn read_response_file(file_path: String) -> Result<String, String> {
    let file = File::open(&file_path)
        .map_err(|e| format!("Failed to open file: {}", e))?;
    
    let metadata = file.metadata()
        .map_err(|e| format!("Failed to get file metadata: {}", e))?;
    
    let file_size = metadata.len() as usize;
    let mut reader = BufReader::new(file);
    let mut content = String::with_capacity(file_size);
    
    reader.read_to_string(&mut content)
        .map_err(|e| format!("Failed to read file: {}", e))?;
    
    Ok(content)
}

/// Get the artifact info for a tab (without reading file content)
#[tauri::command]
pub fn get_response_artifact(tab_id: String) -> Result<Option<ResponseArtifact>, String> {
    let cache = FILE_CACHE.lock().map_err(|e| format!("Lock error: {}", e))?;
    Ok(cache.get(&tab_id).cloned())
}

/// Check if a formatted file exists for a tab
#[tauri::command]
pub fn has_formatted_file(tab_id: String, format: String) -> Result<bool, String> {
    let cache = FILE_CACHE.lock().map_err(|e| format!("Lock error: {}", e))?;
    if let Some(artifact) = cache.get(&tab_id) {
        if let Some(path) = artifact.pretty_paths.get(&format) {
            return Ok(std::path::Path::new(path).exists());
        }
    }
    Ok(false)
}

/// Get the path to a formatted file if it exists
#[tauri::command]
pub fn get_formatted_file_path(tab_id: String, format: String) -> Result<Option<String>, String> {
    let cache = FILE_CACHE.lock().map_err(|e| format!("Lock error: {}", e))?;
    if let Some(artifact) = cache.get(&tab_id) {
        if let Some(path) = artifact.pretty_paths.get(&format) {
            if std::path::Path::new(path).exists() {
                return Ok(Some(path.clone()));
            }
        }
    }
    Ok(None)
}

/// Clean up temp files for a specific tab
#[tauri::command]
pub fn cleanup_response_files(tab_id: String) -> Result<(), String> {
    let mut cache = FILE_CACHE.lock().map_err(|e| format!("Lock error: {}", e))?;
    
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
    
    let mut cache = FILE_CACHE.lock().map_err(|e| format!("Lock error: {}", e))?;
    cache.clear();
    
    Ok(())
}

/// Check if a response body should be stored as a file
pub fn should_use_file_storage(body_size: usize) -> bool {
    body_size >= LARGE_RESPONSE_THRESHOLD
}

/// Get response size threshold
#[tauri::command]
pub fn get_response_size_threshold() -> usize {
    LARGE_RESPONSE_THRESHOLD
}
