<script lang="ts">
  import { hasWorkpaceLevelPermission } from "@sparrow/common/utils";
  import {
    PERMISSION_NOT_FOUND_TEXT,
    workspaceLevelPermissions,
  } from "@sparrow/common/constants/permissions.constant";
  import { WorkspaceRole } from "@sparrow/common/enums";
  import { Tooltip } from "@sparrow/library/ui";
  import { List } from "@sparrow/library/ui";
  import { PlusIcon } from "@sparrow/library/icons";

  export let userRoleInWorkspace: WorkspaceRole;
  export let onImportCollectionPopup: () => void;
  export let handleCreateApiRequest: () => void;
  export let isAddCollectionDisabled = false;
  export let onImportCurlPopup: () => void;
  /**
   * Role of user in active workspace
   */
  export let userRole;
  export let isGuestUser;
  export let currentWorkspace;
  export let onItemCreated;

  let currentWorkspaceId;
  currentWorkspace.subscribe((value) => {
    currentWorkspaceId = value?._data?._id;
  });
  export let collectionList;
</script>

<div class="d-flex flex-column align-items-center">
  <List classProps={"pb-2 p-1 w-100"}>
    {#if userRole !== WorkspaceRole.WORKSPACE_VIEWER}
      <p
        class="text-fs-12 text-center w-100"
        style="color: var(--text-secondary-50)"
      >
        Add Collections to your Workspace to group your requests or send an API
        request directly.
      </p>
    {/if}
    <div class="w-100 mt-0">
      {#if userRole !== WorkspaceRole.WORKSPACE_VIEWER}
        <button
          disabled={userRole === WorkspaceRole.WORKSPACE_VIEWER}
          class="bg-transparent w-100 mb-2 add-collection d-flex justify-content-center align-items-center border-radius-2"
          style="color: var(--text-secondary-100);"
          on:click={() => {
            if (isGuestUser === true) {
              onItemCreated("collection", {
                workspaceId: currentWorkspaceId,
                collection: collectionList,
              });
            } else {
              onImportCollectionPopup();
            }
          }}
        >
          <PlusIcon
            height={"22px"}
            width={"22px"}
            color={"var(--text-secondary-200)"}
          />
          <span
            style="color: var(--text-secondary-200)"
            class="ps-2 text-fs-12 fw-bold">Add Collection</span
          >
        </button>
        <p
          class="import-curl w-100 d-flex justify-content-center align-items-center border-radius-2"
          style="color: var(--text-secondary-100);"
          role="button"
          on:click={() => {
            onImportCurlPopup();
          }}
        >
          <span style="color: var(--text-secondary-100)" class="ps-2 text-fs-12"
            >Import cURL</span
          >
        </p>
      {/if}
    </div>
  </List>
</div>

<style>
  .add-collection {
    border: 1px solid var(--text-secondary-300);
    height: 32px;
  }
  .add-collection:hover {
    border: 1px solid var(--text-primary-300);
  }
  .add-collection:disabled {
    border: 1px solid var(--button-disabled);
    color: var(--button-disabled);
    cursor: not-allowed;
  }
  .add-collection.disabled:hover {
    border: 1px solid var(--text-secondary-300);
  }
  .import-curl {
    background-color: var(--bg-primary-300);
    height: 32px;
  }
  .import-curl:hover {
    background-color: var(--bg-primary-250);
  }
  .import-curl:active {
    background-color: var(--bg-primary-500);
  }
</style>
