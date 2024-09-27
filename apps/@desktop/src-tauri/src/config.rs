use dotenv::dotenv;
use std::env;

pub struct Config {
    pub api_url: String,
}

impl Config {
    pub fn new() -> Self {
        // Load the environment variables from the .env file
        dotenv().ok();

        // Get the API_URL from the environment variables
        let api_url = env::var("VITE_API_URL").expect("API_URL not found in .env");

        Config { api_url }
    }
}
