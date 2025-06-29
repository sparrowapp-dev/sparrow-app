<script lang="ts">
  import { Select } from "@sparrow/library/forms";

  // Type definitions for better type safety
  interface AuthProfile {
    name: string;
    description?: string;
    authType: string;
    defaultKey: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
    authId: string;
  }

  interface SelectOption {
    name: string;
    id: string;
    hide?: boolean;
  }

  // Props with proper typing
  export let callback;
  export let authProfilesList: AuthProfile[] = [];
  export let selectedProfileId: string = "None";
  export let disabled: boolean = false;
  export let placeholder: string = "Select Authentication Profile";

  // Reactive statement to transform auth profiles to select options
  $: menuItems = transformAuthProfilesToOptions(authProfilesList);

  /**
   * Transforms auth profiles array to select dropdown options format
   * Filters out profiles with missing required fields and adds default option
   */
  function transformAuthProfilesToOptions(
    profiles: AuthProfile[],
  ): SelectOption[] {
    const defaultOption: SelectOption = {
      name: placeholder,
      id: "None",
      hide: true,
    };

    // Validate and transform profiles
    const validProfiles = profiles
      .filter((profile) => profile?.name && profile?.authId) // Filter out invalid profiles
      .map((profile) => ({
        name: profile.name,
        id: profile.authId,
      }));

    return [defaultOption, ...validProfiles];
  }

  /**
   * Handles auth profile selection
   * Finds the selected profile and triggers callback
   */
  function handleAuthChange(selectedId: string): void {
    if (selectedId === "None") return;

    const selectedProfile = authProfilesList.find(
      (profile) => profile.authId === selectedId,
    );

    if (selectedProfile) {
      // const authType = selectedProfile.authType;
      // const auth = selectedProfile.auth;
      selectedProfileId = selectedId;
      console.log("slected :>> ", {
        selectedRequestAuthProfileId: selectedProfileId,
      });
      callback({ selectedRequestAuthProfileId: selectedProfileId });
    } else {
      console.warn(`Auth profile with ID ${selectedId} not found`);
    }
  }
</script>

<div class="auth-profile-selector">
  <div class="auth-profile-label">
    <p class="label-text">Authentication Profile</p>
    <div class="select-container">
      <Select
        id="auth-profile-list"
        data={menuItems}
        zIndex={499}
        titleId={selectedProfileId}
        onclick={handleAuthChange}
        disabled={disabled || menuItems.length <= 1}
        menuItem={"v2"}
        variant={"secondary"}
        position={"absolute"}
        minHeaderWidth={"100%"}
        size={"medium"}
      />

      <!-- Show count of available profiles -->
      {#if !menuItems.length}
        <small class="no-profiles">No authentication profiles available</small>
      {/if}
    </div>
  </div>
</div>

<style>
  .auth-profile-selector {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .auth-profile-label {
    font-size: 12px;
    font-weight: 500;
  }

  .label-text {
    margin-bottom: 8px;
    color: var(--text-secondary-100, #6b7280);
    margin: 0 0 8px 0;
  }

  .select-container {
    position: relative;
    max-width: 520px;
    margin-bottom: 12px;
  }
  @media (max-width: 768px) {
    .select-container {
      max-width: 100%;
    }
  }

  .no-profiles {
    position: absolute;
    top: 100%;
    left: 0;
    font-size: 10px;
    color: var(--text-secondary-200, #9ca3af);
    color: var(--text-warning, #f59e0b);
    margin-top: 4px;
  }
</style>
