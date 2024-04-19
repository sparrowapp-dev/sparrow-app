<script lang="ts">
  import Plus from "$lib/assets/plus.svelte";
  import { hasWorkpaceLevelPermission } from "$lib/utils/helpers";
  import {
    PERMISSION_NOT_FOUND_TEXT,
    workspaceLevelPermissions,
  } from "$lib/utils/constants/permissions.constant";
  import { WorkspaceRole } from "$lib/utils/enums";
  import Tooltip from "$lib/components/tooltip/Tooltip.svelte";

  export let getUserRoleInWorkspace: () => WorkspaceRole;
  export let onImportCollectionPopup: () => void;
  export let handleCreateApiRequest: () => void;
</script>

<div class="d-flex flex-column align-items-center px-3 pt-3">
  <p
    style="font-size: 14px;
font-weight: 300;"
  >
    Add Collections to your Workspace to group your requests or send an API
    request directly
  </p>
  <div class="w-100 mt-3">
    <Tooltip
      title={PERMISSION_NOT_FOUND_TEXT}
      show={!hasWorkpaceLevelPermission(
        getUserRoleInWorkspace(),
        workspaceLevelPermissions.ADD_ENVIRONMENT,
      )}
      placement="top"
      classProp="w-100"
    >
      <button
        disabled={!hasWorkpaceLevelPermission(
          getUserRoleInWorkspace(),
          workspaceLevelPermissions.ADD_ENVIRONMENT,
        )}
        class="buttons w-100 d-flex mb-3 justify-content-center align-items-center gap-1"
        on:click={() => {
          onImportCollectionPopup();
        }}
      >
        <Plus
          color={!hasWorkpaceLevelPermission(
            getUserRoleInWorkspace(),
            workspaceLevelPermissions.ADD_ENVIRONMENT,
          )
            ? "gray"
            : "white"}
          height={14}
          width={14}
        />Collection
      </button>
    </Tooltip>
    <Tooltip title={"API Request"} show={false}>
      <button
        class="buttons w-100 d-flex mb-3 justify-content-center align-items-center gap-1"
        on:click={handleCreateApiRequest}
      >
        <Plus height={14} width={14} classProp="my-auto" />
        API Request</button
      ></Tooltip
    >
  </div>
</div>

<style>
  .buttons {
    width: 180px;
    height: 32px;
    padding: 4px, 12px, 4px, 4px;
    border-radius: 4px;
    background: linear-gradient(270deg, #6147ff -1.72%, #1193f0 100%);
    border: none;
  }
</style>
