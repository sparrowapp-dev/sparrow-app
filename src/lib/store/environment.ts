import { writable } from "svelte/store";

export const isEnvironmentCreatedFirstTime = writable(false);

export const environmentLeftPanelWidth = writable(20);
export const environmentRightPanelWidth = writable(80);
