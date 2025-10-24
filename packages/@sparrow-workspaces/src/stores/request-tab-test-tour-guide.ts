import { writable } from "svelte/store";

// store for Request Tab no Code.
export const requestTabTestDemo = writable(false);

export const requestTabTestNoCodeStep = writable(0);

export const requestTabTestTourCompleted = writable(false);

// store for Request Tab no Script.
export const requestTabTestScriptDemo = writable(false);

export const requestTabTestScriptStep = writable(0);

export const requestTabTestScriptTourCompleted = writable(false);

// Store for Request Tab Assertions demo only
export const requestTabAssertionsDemo = writable(false);

export const requestTabAssertionsStep = writable(0);

export const requestTabAssertionsTourCompleted = writable(false);
