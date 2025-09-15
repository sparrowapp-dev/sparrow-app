import { writable } from "svelte/store";

export const requestTabTestDemo = writable(false);

export const requestTabTestNoCodeStep = writable(0);

export const requestTabTestTourCompleted = writable(false);
