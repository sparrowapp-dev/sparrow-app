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

<div class="d-flex flex-column align-items-center">
  <List height={"calc(100vh - 160px)"} classProps={"pb-2 pe-1"}>
    <p class="text-fs-14 text-center">
      Add Collections to your Workspace to group your requests or send an API
      request directly
    </p>
    <div class="w-100 mt-3">
      <p
        class="fw-normal d-flex align-items-center text-fs-14 ps-3" style="color: white;"
        role="button"
        on:click={() => {
          onImportCollectionPopup();
        }}
      >
        <PlusIcon />
        <span>Add Collection</span>
      </p>
    </div>
  </List>
</div>
