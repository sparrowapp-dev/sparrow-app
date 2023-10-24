import { writable } from "svelte/store";

//api key section
export const apiKey1 = writable("");
export const apiKey2 = writable("");

//Bearer token section
export const BearerToken = writable("");

//  Basic auth section section
export const basicAuth1 = writable("");
export const basicAuth2 = writable("");
export const basicAuthHeader = writable("");

//this store is for collaps and expand section
export const collapsibleState = writable(false);

//this is for horizaontal and vertical mode
export const isHorizontalVertical = writable(false);

//for color on crud operation

export const createBasicAuthHeader = () => {
  // Retrieve values from the stores
  let username;
  let password;

  basicAuth1.subscribe((value) => (username = value));
  basicAuth2.subscribe((value) => (password = value));

  // Check if both username and password have values
  if (username && password) {
    const credentials = `${username}:${password}`;
    const encodedCredentials = btoa(credentials);
    const header = `Basic ${encodedCredentials}`;
    basicAuthHeader.set(header);
  }
};
