// this is for single api request store so that it can be used everywhere

import { writable } from "svelte/store";

//this store for url ("http://localhost:1420//api/v1/login")
export const apiEndPoint = writable("");

//this store for method (post , get , delete , update , delete , patch )
export const methodText = writable("");

//this store for request type (JSON , XML , RAW)
export const requestType = writable("");

//this store for storing headertext (Content-Type=application/json)
export const headerText = writable("");

//this store for storing body text {"name" : "kashif" , "email":"kashif@gmail.com" , "password":"kashif"}
export const bodyText = writable({});
