// stores/policyStore.js
import { writable } from 'svelte/store';
import { invoke } from "@tauri-apps/api/core";


export const policyConfig = writable({
  disableSignIn: false,
  disableWorkspace: false,
  disableActiveSync: false,
  // Other policy settings
});

// Function to load policy config from the registry
export async function loadPolicyConfig() {
  try {
    const config = await invoke('get_policy_config');
    policyConfig.set({
      disableSignIn: config.disable_sign_in,
      disableWorkspace: config.disable_workspace,
      disableActiveSync: config.disable_active_sync
      // Map other properties
    });
  } catch (error) {
    console.error('Failed to load policy configuration:', error);
  }
}