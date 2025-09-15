import { writable } from "svelte/store";

export const generatedVariableDemo = writable(false);

export const generateVariableStep = writable(0);

export const generateVariableTourCompleted = writable(false);
