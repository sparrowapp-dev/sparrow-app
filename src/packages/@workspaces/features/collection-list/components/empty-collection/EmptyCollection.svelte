<script lang="ts">
  import Plus from "$lib/assets/plus.svelte";
  import { hasWorkpaceLevelPermission } from "$lib/utils/helpers";
  import {
    PERMISSION_NOT_FOUND_TEXT,
    workspaceLevelPermissions,
  } from "$lib/utils/constants/permissions.constant";
  import { WorkspaceRole } from "$lib/utils/enums";
  import Tooltip from "$lib/components/tooltip/Tooltip.svelte";
  import List from "@library/ui/list/List.svelte";
  import { PlusIcon } from "@library/icons";

  export let userRoleInWorkspace: WorkspaceRole;
  export let onImportCollectionPopup: () => void;
  export let handleCreateApiRequest: () => void;
</script>

<div class="d-flex flex-column align-items-center px-3">
  <List height={"calc(100vh - 160px)"} classProps={"pb-2 pe-1"}>
    <p class="text-fs-12 text-center" style="color: var(--text-secondary-50)">
      Add Collections to your Workspace to group your requests or send an API
      request directly
    </p>
    <div class="w-100 mt-3">
      <p
        class="add-collection d-flex justify-content-center align-items-center border-radius-2"
        style="color: var(--text-secondary-100);"
        role="button"
        on:click={() => {
          onImportCollectionPopup();
        }}
      >
        <PlusIcon
          height={"22px"}
          width={"22px"}
          color={"var(--text-secondary-200)"}
        />
        <span
          style="color: var(--text-secondary-200)"
          class="ps-2 fw-bold text-fs-12">Add Collection</span
        >
      </p>
    </div>
  </List>
</div>

<style>
  .add-collection {
    border: 1px solid var(--text-secondary-300);
    height: 32px;
  }
  .add-collection:hover{
    border: 1px solid var(--text-primary-300);
  }
</style>
