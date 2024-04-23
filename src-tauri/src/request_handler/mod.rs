//! This module provides handlers for various HTTP request types.
//!
//! # Modules
//!
//! * `formdata_handler_v2`: Handles multipart/form-data requests.
//! * `http_requests`: Contains functions for making general HTTP requests.
//! * `json_handler_v2`: Handles JSON requests.
//! * `urlencoded_handler_v2`: Handles application/x-www-form-urlencoded requests.
//!
//! Each submodule contains functions for making specific types of HTTP requests.
//! Use these modules based on your application's requirements.
pub mod formdata_handler_v2;
pub mod http_requests;
pub mod json_handler_v2;
pub mod urlencoded_handler_v2;
