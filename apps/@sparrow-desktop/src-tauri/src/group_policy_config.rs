#[tauri::command]
pub fn get_policy_config(app_handle: tauri::AppHandle) -> Result<PolicyConfig, String> {
    // For Windows
    #[cfg(target_os = "windows")]
    {
        use winreg::enums::*;
        use winreg::RegKey;

        // Path to your app's policy in the registry
        let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
        let policy_path = "Software\\Policies\\Sparrow";

        // Default configuration
        let mut config = PolicyConfig {
            enable_login: true,
            enable_ai_assistance: true,
            restrict_public_workspace_creation: false,
            disable_active_sync: false,
            hub_creation_allowed: true,
        };

        // Try to open the main policy key
        if let Ok(main_key) = hklm.open_subkey(policy_path) {
            // Read from subkeys if they exist

            // Login settings
            if let Ok(login_key) = main_key.open_subkey("Login") {
                config.enable_login =
                    login_key.get_value::<u32, _>("EnableLogin").unwrap_or(1) == 1;
            }

            // AI Assistance settings
            if let Ok(ai_key) = main_key.open_subkey("AI") {
                config.enable_ai_assistance = ai_key
                    .get_value::<u32, _>("EnableAIAssistance")
                    .unwrap_or(1)
                    == 1;
            }

            // Workspace settings
            if let Ok(workspace_key) = main_key.open_subkey("Workspaces") {
                config.restrict_public_workspace_creation = workspace_key
                    .get_value::<u32, _>("RestrictPublicWorkspaceCreation")
                    .unwrap_or(0)
                    == 1;
            }

            // Sync settings
            if let Ok(sync_key) = main_key.open_subkey("Sync") {
                config.disable_active_sync = sync_key
                    .get_value::<u32, _>("DisableActiveSync")
                    .unwrap_or(0)
                    == 1;
            }

            // HubSpace Setting
            if let Ok(login_key) = main_key.open_subkey("Hubs") {
                config.hub_creation_allowed = login_key
                    .get_value::<u32, _>("HubCreationAllowed")
                    .unwrap_or(1)
                    == 1;
            }
        }

        Ok(config)
    }

    // For non-Windows platforms, return default values
    #[cfg(not(target_os = "windows"))]
    {
        Ok(PolicyConfig {
            enable_login: true,
            enable_ai_assistance: true,
            restrict_public_workspace_creation: false,
            disable_active_sync: false,
            hub_creation_allowed: true,
        })
    }
}

// Define your policy configuration struct
#[derive(serde::Serialize)]
pub struct PolicyConfig {
    enable_login: bool,
    enable_ai_assistance: bool,
    restrict_public_workspace_creation: bool,
    disable_active_sync: bool,
    hub_creation_allowed: bool,
}
