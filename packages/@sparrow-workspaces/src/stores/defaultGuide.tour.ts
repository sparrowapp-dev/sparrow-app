import { writable } from "svelte/store";

export const isDefaultTourGuideOpen = writable(false);

export const defaultCurrentStep = writable(0);

export const isDefaultTourGuideClose = writable(false);
