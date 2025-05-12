// stores/policyStore.js
import { writable, derived } from 'svelte/store';
import { invoke } from "@tauri-apps/api/core";

// Track loading state
export const policyLoading = writable(true);

// Define store with default values
export const policyConfig = writable({
  enableLogin: true,
  enableAIAssistance: true,
  restrictPublicWorkspaceCreation: false,
  disableActiveSync: false,
  hubCreationAllowed: true
  // Other policy settings
});

// Create a derived store to check if policies are ready
export const policiesReady = derived(
  [policyLoading, policyConfig],
  ([$loading, $config]) => !$loading
);

// Function to load policy config from the registry
export async function loadPolicyConfig() {
  try {
    policyLoading.set(true);
    const config = await invoke('get_policy_config');
    policyConfig.set({
      enableLogin: config.enable_login,
      enableAIAssistance: config.enable_ai_assistance,
      restrictPublicWorkspaceCreation: config.restrict_public_workspace_creation,
      disableActiveSync: config.disable_active_sync,
      hubCreationAllowed: config.hub_creation_allowed
    });
    
    console.log('Policy configuration loaded:', config);
  } catch (error) {
    console.error('Failed to load policy configuration:', error);
  } finally {
    policyLoading.set(false);
  }
}

// Load policies when the store is imported
// This should happen as early as possible in your app bootstrap
loadPolicyConfig();

// Helper to check if a policy is enabled or disabled
export function isPolicyEnabled(policyName) {
  let result = false;
  
  // We need to get the current value synchronously
  const unsubscribe = policyConfig.subscribe(config => {
    result = !config[policyName];
  });
  
  // Clean up the subscription
  unsubscribe();
  
  return result;
}