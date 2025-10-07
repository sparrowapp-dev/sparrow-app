import { writable } from "svelte/store";

// store for Request Tab no Code.
export const requestTabTestDemo = writable(false);

export const requestTabTestNoCodeStep = writable(0);

export const requestTabTestTourCompleted = writable(false);


// store for Request Tab no Script. 
export const requestTabTestScriptDemo = writable(false);

export const requestTabTestScriptStep = writable(0);

export const requestTabTestScriptTourCompleted = writable(false);