// stores/policyStore.js
import { writable } from 'svelte/store';
import { invoke } from "@tauri-apps/api/core";

export const policyConfig = writable({
  enableLogin: true,
  enableAIAssistance: true,
  restrictPublicWorkspaceCreation: false,
  disableActiveSync: false,
  hubCreationAllowed: true
  // Other policy settings
});

// Function to load policy config from the registry
export async function loadPolicyConfig() {
  try {
    const config = await invoke('get_policy_config');
    policyConfig.set({
      enableLogin: config.enable_login,
      enableAIAssistance: config.enable_ai_assistance,
      restrictPublicWorkspaceCreation: config.restric_public_workspace_creation,
      disableActiveSync: config.disable_active_sync,
      hubCreationAllowed: config.hub_creation_allowed
      // Map other properties as needed
    });
  } catch (error) {
    console.error('Failed to load policy configuration:', error);
  }
}