use proc_macro::TokenStream;
use syn::{parse_macro_input, LitStr};

#[proc_macro_derive(HelperAttr, attributes(helper))]
pub fn json_to_raw_literal(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as LitStr);
    let json_str = input.value();
    let raw_str = format!(r#"{:?}"#, json_str);

    // Return the raw string literal as a token stream
    raw_str.parse().unwrap()
}
