use reqwest::RequestBuilder;
use std::error::Error;
use regex::Regex; 
use reqwest::multipart;
use std::fs;

fn extract_filename(input: &str) -> Option<String> {
    let re = Regex::new(r#"\/([^/]+)"'$"#).unwrap();
    
    if let Some(captures) = re.captures(input) {
        if let Some(matched) = captures.get(1) {
            return Some(matched.as_str().to_string());
        }
    }
    None
}

// Handle to extract path of file
fn extract_local_path(input: &str) -> Option<String> {
    let re = Regex::new(r#""([^"]+)""#).unwrap();
    if let Some(caps) = re.captures(input) {
        let path = caps.get(1).map(|m| m.as_str().to_string())?;
        if path.starts_with("/C:") {
            return Some(path[1..].to_string());
        }
    }
    None
}

pub async fn make_formdata_request(
    request_builder: RequestBuilder,
    body: &str,
) -> Result<String, Box<dyn Error>> {
    let filename = extract_filename(body);
    let local_filepath = extract_local_path(body);
    let local_filepath_str = local_filepath.as_ref().unwrap();
    let filename_str = filename.unwrap_or_default();
    let file_fs = fs::read(local_filepath_str)?;
    let part = multipart::Part::bytes(file_fs).file_name(filename_str);
    let filename1 = extract_filename(body);
    let filename_str1 = filename1.unwrap_or_default();
    let form = reqwest::multipart::Form::new()
    .text("resourceName", filename_str1)
    .part("FileData", part);
    let resp = request_builder.multipart(form).send().await?.text().await?;
    println!("{:#?}", resp);
    Ok(resp)
}