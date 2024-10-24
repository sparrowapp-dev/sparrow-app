import { writable } from "svelte/store";

export const isTestFlowTourGuideOpen = writable(false); // Initial value is false
export const currentStep = writable(-1); // Initial value is null

export const isFirstTimeInTestFlow = writable(false);
