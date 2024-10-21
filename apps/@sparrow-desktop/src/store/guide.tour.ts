import { writable } from "svelte/store";

export const istestFlowTourGuideOpen = writable(false); // Initial value is false
export const currentStep = writable(-1); // Initial value is null
