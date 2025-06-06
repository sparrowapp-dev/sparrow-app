import { writable, derived } from 'svelte/store';
import { invoke } from "@tauri-apps/api/core";
import { OSDetector } from '../utils';

// Define store with default values
export const policyConfig = writable({
  enableLogin: true,
  enableAIAssistance: true,
  restrictPublicWorkspaceCreation: false,
  disableActiveSync: false,
  hubCreationAllowed: true
  // Other policy settings
});