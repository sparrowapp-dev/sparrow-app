//! # Fast JSON Response Serializer
//!
//! This module provides optimized JSON serialization for HTTP response data.
//! It avoids the overhead of `serde_json::Value` construction by writing directly
//! to a pre-allocated string buffer.
//!
//! ## Performance Benefits
//! - Single allocation with pre-calculated capacity
//! - Direct string building without intermediate Value objects
//! - Inline escape function for hot path optimization
//! - No unnecessary cloning or heap allocations

use reqwest::header::HeaderMap;
use reqwest::StatusCode;

/// Response data structure for the v2 API (body field)
pub struct HttpResponseV2<'a> {
    pub headers: &'a HeaderMap,
    pub status: StatusCode,
    pub body: &'a str,
}

/// Response data structure for the legacy API (response field)
pub struct HttpResponseLegacy<'a> {
    pub headers: &'a HeaderMap,
    pub status: StatusCode,
    pub response: &'a str,
}

/// Fast JSON serializer that writes directly to a string buffer.
pub struct FastJsonWriter {
    buffer: String,
}

impl FastJsonWriter {
    /// Creates a new writer with the specified initial capacity.
    #[inline]
    pub fn with_capacity(capacity: usize) -> Self {
        Self {
            buffer: String::with_capacity(capacity),
        }
    }

    /// Consumes the writer and returns the built JSON string.
    #[inline]
    pub fn finish(self) -> String {
        self.buffer
    }

    /// Writes a raw string without escaping (for pre-validated content).
    #[inline]
    pub fn write_raw(&mut self, s: &str) {
        self.buffer.push_str(s);
    }

    /// Writes a character.
    #[inline]
    pub fn write_char(&mut self, c: char) {
        self.buffer.push(c);
    }

    /// Writes a complete JSON string value with quotes.
    #[inline]
    pub fn write_string(&mut self, s: &str) {
        self.buffer.push('"');
        escape_json_to_buffer(s, &mut self.buffer);
        self.buffer.push('"');
    }

    /// Writes header map as a JSON object.
    pub fn write_headers(&mut self, headers: &HeaderMap) {
        self.buffer.push('{');
        let mut first = true;
        for (name, value) in headers.iter() {
            if !first {
                self.buffer.push(',');
            }
            first = false;
            self.buffer.push('"');
            escape_json_to_buffer(name.as_str(), &mut self.buffer);
            self.buffer.push_str("\":\"");
            escape_json_to_buffer(value.to_str().unwrap_or("[invalid UTF-8]"), &mut self.buffer);
            self.buffer.push('"');
        }
        self.buffer.push('}');
    }
}

/// Escapes a string for JSON output, writing directly to the buffer.
/// This is optimized for the common case where most characters don't need escaping.
#[inline]
fn escape_json_to_buffer(s: &str, out: &mut String) {
    let bytes = s.as_bytes();
    let mut start = 0;

    for (i, &byte) in bytes.iter().enumerate() {
        let escape = match byte {
            b'"' => "\\\"",
            b'\\' => "\\\\",
            b'\n' => "\\n",
            b'\r' => "\\r",
            b'\t' => "\\t",
            // Control characters (0x00-0x1F) except those handled above
            0x00..=0x1F => {
                // Flush any accumulated non-escaped content
                if start < i {
                    out.push_str(&s[start..i]);
                }
                // Write unicode escape sequence
                out.push_str("\\u00");
                out.push(HEX_DIGITS[(byte >> 4) as usize]);
                out.push(HEX_DIGITS[(byte & 0xF) as usize]);
                start = i + 1;
                continue;
            }
            _ => {
                continue;
            }
        };

        // Flush any accumulated non-escaped content
        if start < i {
            out.push_str(&s[start..i]);
        }
        out.push_str(escape);
        start = i + 1;
    }

    // Flush remaining content
    if start < bytes.len() {
        out.push_str(&s[start..]);
    }
}

const HEX_DIGITS: [char; 16] = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f',
];

impl<'a> HttpResponseV2<'a> {
    /// Serializes the response to a JSON string.
    ///
    /// Output format: `{"headers":{...},"status":"200 OK","body":"..."}`
    pub fn to_json_string(&self) -> String {
        // Estimate capacity: headers ~500 bytes + status ~20 + body + overhead
        let capacity = self.body.len() + 1024;
        let mut writer = FastJsonWriter::with_capacity(capacity);

        writer.write_raw("{\"headers\":");
        writer.write_headers(self.headers);
        writer.write_raw(",\"status\":\"");
        writer.write_raw(&self.status.to_string());
        writer.write_raw("\",\"body\":");
        writer.write_string(self.body);
        writer.write_char('}');

        writer.finish()
    }
}

impl<'a> HttpResponseLegacy<'a> {
    /// Serializes the response to a JSON string.
    ///
    /// Output format: `{"headers":{...},"status":"200 OK","response":"..."}`
    pub fn to_json_string(&self) -> String {
        // Estimate capacity: headers ~500 bytes + status ~20 + response + overhead
        let capacity = self.response.len() + 1024;
        let mut writer = FastJsonWriter::with_capacity(capacity);

        writer.write_raw("{\"headers\":");
        writer.write_headers(self.headers);
        writer.write_raw(",\"status\":\"");
        writer.write_raw(&self.status.to_string());
        writer.write_raw("\",\"response\":");
        writer.write_string(self.response);
        writer.write_char('}');

        writer.finish()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use reqwest::header::{HeaderMap, HeaderValue, CONTENT_TYPE};

    #[test]
    fn test_escape_simple() {
        let mut buf = String::new();
        escape_json_to_buffer("hello world", &mut buf);
        assert_eq!(buf, "hello world");
    }

    #[test]
    fn test_escape_special_chars() {
        let mut buf = String::new();
        escape_json_to_buffer("line1\nline2\ttab\"quote\\backslash", &mut buf);
        assert_eq!(buf, "line1\\nline2\\ttab\\\"quote\\\\backslash");
    }

    #[test]
    fn test_escape_control_chars() {
        let mut buf = String::new();
        escape_json_to_buffer("\x00\x01\x1f", &mut buf);
        assert_eq!(buf, "\\u0000\\u0001\\u001f");
    }

    #[test]
    fn test_response_v2_serialization() {
        let mut headers = HeaderMap::new();
        headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

        let response = HttpResponseV2 {
            headers: &headers,
            status: reqwest::StatusCode::OK,
            body: "test body",
        };

        let json = response.to_json_string();
        assert!(json.contains("\"headers\":"));
        assert!(json.contains("\"status\":\"200 OK\""));
        assert!(json.contains("\"body\":\"test body\""));
    }
}
