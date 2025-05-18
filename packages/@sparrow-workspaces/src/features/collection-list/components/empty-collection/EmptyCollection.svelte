<script lang="ts">
  import { hasWorkpaceLevelPermission } from "@sparrow/common/utils";
  import {
    PERMISSION_NOT_FOUND_TEXT,
    workspaceLevelPermissions,
  } from "@sparrow/common/constants/permissions.constant";
  import { WorkspaceRole } from "@sparrow/common/enums";
  import { Button, Tooltip } from "@sparrow/library/ui";
  import { List } from "@sparrow/library/ui";
  import { AddRegular, PlusIcon } from "@sparrow/library/icons";

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
  export let isMockCollection = false;
  export let isCollectionEmpty = false;

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
        class="text-fs-12 text-center w-100 {isCollectionEmpty ? 'ps-3' : ''}"
        style="color: var(--text-ds-neutral-400)"
      >
        {isMockCollection
          ? "Create mock collections to test and organize your API without a live server."
          : "Build your API workflow and organize it with collections. Add a collection or import a cURL command to get started."}
      </p>
    {/if}
    <div
      class="w-100 mt-2 {isCollectionEmpty ? 'ps-3' : ''}"
      style="display: flex; flex-direction:column; "
    >
      {#if userRole !== WorkspaceRole.WORKSPACE_VIEWER}
        <span class="mb-2">
          <Button
            title={isMockCollection ? "Add Mock Collection" : "Add Collection"}
            type="secondary"
            size="small"
            customWidth="100%"
            startIcon={AddRegular}
            disabled={userRole === WorkspaceRole.WORKSPACE_VIEWER}
            onClick={() => {
              if (isMockCollection) {
                onItemCreated("mockCollection", {
                  workspaceId: currentWorkspaceId,
                  collection: collectionList,
                });
              } else if (isGuestUser === true) {
                onItemCreated("collection", {
                  workspaceId: currentWorkspaceId,
                  collection: collectionList,
                });
              } else {
                onImportCollectionPopup();
              }
            }}
          ></Button>
        </span>
      {/if}

      {#if !isMockCollection}
        <Button
          title="Import cURL"
          onClick={() => {
            onImportCurlPopup();
          }}
          type="primary"
          size="small"
          customWidth="100%"
        />
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
