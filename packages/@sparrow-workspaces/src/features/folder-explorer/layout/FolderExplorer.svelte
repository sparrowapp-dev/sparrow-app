<script lang="ts">
  // Exports
  /**
   * The tab of the folder
   */
  export let tab: TabDocument;
  /**
   * The folder data from repository
   */
  export let folder: Folder;
  /**
   * The collection of the folder
   */
  export let collection: CollectionDocument;
  /**
   * Callback to rename folder
   */
  export let onRename: (
    collection: CollectionDocument,
    folder: Folder,
    newName: string,
  ) => Promise<void>;
  /**
   * Callback to create new api request
   */
  export let onCreateAPIRequest: (
    collection: CollectionDocument,
    folder: Folder,
  ) => Promise<void>;
  /**
   * Callback to update description
   */
  export let onUpdateDescription: (
    tab: TabDocument,
    newDescription: string,
  ) => Promise<void>;
  /**
   * Callback to get total number of requests in folder
   */
  export let getTotalRequests: (
    collection: CollectionDocument,
    tab: TabDocument,
  ) => Promise<number>;

  /**
   * Role of user in active workspace
   */
  export let userRole;

  /**
   * Components
   */
  import { Tooltip } from "@sparrow/library/ui";

  /**
   * Types
   */
  import type { CollectionDocument, TabDocument } from "@app/database/database";
  import type { Folder } from "@sparrow/common/types/workspace";

  /**
   * Constants
   */
  import { PERMISSION_NOT_FOUND_TEXT } from "@sparrow/common/constants/permissions.constant";
  import { WorkspaceRole } from "@sparrow/common/enums";

  /**
   * Local variables
   */
  let totalRequests: number = 0;

  /**
   * Funciton to update total requests
   */
  const updateTotalRequests = async () => {
    totalRequests = await getTotalRequests(collection, tab);
  };

  /**
   * Check if the tab or collection updates
   */
  $: {
    if (tab && collection) {
      updateTotalRequests();
    }
  }

  const onRenameInputKeyPress = () => {
    const inputField = document.getElementById(
      "renameInputFieldFolder",
    ) as HTMLInputElement;
    inputField.blur();
  };

  const resetInputField = () => {
    const inputField = document.getElementById(
      "renameInputFieldFolder",
    ) as HTMLInputElement;
    inputField.value = folder?.name;
  };
</script>

<div class="main-container d-flex h-100" style="overflow:auto;">
  <div class="my-collection d-flex flex-column w-100 z-3">
    <Tooltip
      title={PERMISSION_NOT_FOUND_TEXT}
      show={userRole === WorkspaceRole.WORKSPACE_VIEWER}
    >
      <div class="d-flex gap-2 mb-4">
        <div class="d-flex flex-column flex-grow-1">
          <input
            type="text"
            required
            id="renameInputFieldFolder"
            value={folder?.name || "Folder Doesn't Exist."}
            disabled={tab?.source === "SPEC" ||
              userRole === WorkspaceRole.WORKSPACE_VIEWER}
            class="bg-transparent input-outline border-0 text-left w-100 ps-2 py-0 text-fs-18"
            maxlength={100}
            on:blur={(event) => {
              const newValue = event.target.value.trim();
              const previousValue = folder.name;
              if (newValue === "") {
                resetInputField();
              } else if (newValue !== previousValue) {
                onRename(collection, folder, newValue);
              }
            }}
            on:keydown={(event) => {
              if (event.key === "Enter") {
                onRenameInputKeyPress();
              }
            }}
          />
        </div>
        <div class="d-flex flex-row">
          <button
            disabled={userRole === WorkspaceRole.WORKSPACE_VIEWER ||
              tab?.source === "SPEC"}
            class="btn add-button rounded mx-1 border-0 text-align-right py-1"
            style="max-height:60px; width:200px; margin-top: -2px;"
            on:click={() => {
              onCreateAPIRequest(collection, folder);
            }}>New Request</button
          >
        </div>
      </div>
    </Tooltip>

    <div class="d-flex gap-4 mb-4 ps-2">
      <div class="d-flex align-items-center gap-2">
        <span class="fs-4 text-plusButton">{totalRequests}</span>
        <p style="font-size: 12px;" class="mb-0">API Requests</p>
      </div>
    </div>
    <div class="d-flex align-items-start ps-0 h-100">
      <textarea
        disabled={userRole === WorkspaceRole.WORKSPACE_VIEWER ||
          tab?.source === "SPEC"}
        id="updateFolderDescField"
        style="margin-top: -2px;"
        class="bg-transparent border-0 text-textColor text-fs-12 h-50 input-outline shadow-none w-100 p-2"
        value={folder?.description || ""}
        placeholder="Describe the folder. Add code examples and tips for your team to effectively use the APIs."
        on:blur={(event) => {
          if (folder?.description !== event.target.value) {
            onUpdateDescription(tab, event.target.value);
          }
        }}
      />
    </div>
  </div>
  <div
    class="d-flex flex-column align-items-left justify-content-start d-none"
    style="width: 280px;border-left:2px solid #313233"
  >
    <div
      style="text-align:left;font-size:16px; font-weigh:400;"
      class="mt-5 ps-3 text-whiteColor"
    >
      <p>Index</p>
    </div>
    <div class="mt-2 ps-3" style="font-size:12px; font-weight:400">
      <p class="text-textColor">
        Begin adding content, and the Index will automatically populate here.
        This will help you easily navigate and organize your documentation as it
        grows.
      </p>
    </div>
  </div>
</div>

<style>
  .my-collection {
    padding: 24px;
  }

  .input-outline {
    border-radius: 0%;
  }
  textarea::placeholder {
    color: var(--text-color);
  }
  .input-outline:hover {
    outline: 1px solid var(--sparrow-blue);
  }
  .input-outline:focus {
    outline: 1px solid var(--sparrow-blue);
  }
  .add-button {
    background-color: var(--dropdown-button);
  }

  .add-button:hover {
    background-color: var(--dropdown-hover);
  }
</style>
