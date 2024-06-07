import { writable } from "svelte/store";

//api key section
export const apiKey = writable("");
export const apiValue = writable("");

//Bearer token section
export const BearerToken = writable("");

//  Basic auth section section
export const basicAuth_username = writable("");
export const basicAuth_password = writable("");

export const basicAuthHeader = writable("");
