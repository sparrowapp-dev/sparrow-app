use reqwest::{Body, RequestBuilder, Response};
use std::{collections::HashMap, path::Path};
use reqwest::multipart;
use tokio::fs::File;
use tokio_util::codec::{BytesCodec, FramedRead};


fn starts_with_pattern(s: &str) -> bool {
    s.starts_with("#@#")
}

fn remove_prefix(s: &str) -> &str {
    match s.strip_prefix("#@#") {
        Some(stripped) => stripped, // If the prefix was found, return the string without it
        None => s, // If the prefix was not found, return the original string
    }
}

fn extract_filename(path_str: &str) -> Option<String> {

    // Use the Path struct to parse the string as a path and extract the file name
    return Path::new(path_str)
        .file_name() // Extracts the file name component
        .and_then(|name| name.to_str()) // Converts the OsStr to a &str
        .map(|name| name.to_owned()) // Converts the &str to a String
}


pub async fn make_formdata_request(
    request_builder: RequestBuilder,
    body: &str,
) -> Result<Response, Box<dyn std::error::Error + Send + Sync>> {
    println!("inside form data");
    let mut form = reqwest::multipart::Form::new();
    let body_map: HashMap<_, _> = body.split('&')
        .map(|s| {
            let mut parts = s.split('=');
            (parts.next().unwrap().to_owned(), parts.next().unwrap_or("").to_owned())
        })
        .collect();
    for (key, value) in body_map.iter() {
        if starts_with_pattern(value) { 
            let file_path = remove_prefix(value);
            // Assuming updated_string is the path to the file
            let file = File::open(format!(r"{}", file_path)).await?;
            let filename = match extract_filename(file_path) {
                Some(file_name) => file_name,
                None => "file".to_string(),
            };
            let stream = FramedRead::new(file, BytesCodec::new());
            let file_body = Body::wrap_stream(stream);
            let file_part = multipart::Part::stream(file_body)
            .file_name(filename);
            form = form.part(key.clone(), file_part);
        } else { 
            form = form.text(key.clone(), value.clone());
        }
    }
    let resp = request_builder.multipart(form).send().await?;
    println!("{:#?}", resp);
    Ok(resp)
}