<script lang="ts">
  // Exports
  export let tab: TabDocument;
  export let folder: Folder;
  export let collection: CollectionDocument;
  export let userRoleInWorkspace: boolean;
  export let onRename: (
    collection: CollectionDocument,
    folder: Folder,
    newName: string,
  ) => Promise<void>;
  export let onCreateAPIRequest: (
    collection: CollectionDocument,
    folder: Folder,
  ) => Promise<void>;
  export let onUpdateDescription: (
    tab: TabDocument,
    newDescription: string,
  ) => Promise<void>;
  export let getTotalRequests: (
    collection: CollectionDocument,
    tab: TabDocument,
  ) => Promise<number>;

  // Components
  import Tooltip from "$lib/components/tooltip/Tooltip.svelte";

  // Types
  import type {
    CollectionDocument,
    TabDocument,
  } from "$lib/database/app.database";

  // Constant
  import { PERMISSION_NOT_FOUND_TEXT } from "$lib/utils/constants/permissions.constant";
  import type { Folder } from "@common/types/rest-explorer";

  // Local Variables
  let totalRequests: number = 0;

  // Funciton to update total requests
  const updateTotalRequests = async () => {
    totalRequests = await getTotalRequests(collection, tab);
  };

  // Check if the tab or collection updates
  $: {
    if (tab && collection) {
      updateTotalRequests();
    }
  }
</script>

<div class="main-container d-flex">
  <div
    class="my-collection d-flex flex-column"
    style="width:calc(100% - 280px); margin-top: 15px;"
  >
    <Tooltip title={PERMISSION_NOT_FOUND_TEXT} show={!userRoleInWorkspace}>
      <div class="d-flex aling-items-center justify-content-between gap-2 mb-4">
        <input
          type="text"
          required
          id="renameInputFieldFolder"
          value={tab?.name}
          disabled={tab?.source === "SPEC"}
          class="bg-backgroundColor input-outline border-0 text-left w-100 ps-2 py-0 fs-5"
          maxlength={100}
          on:blur={(event) =>
            onRename(collection, folder, event?.target?.value)}
          on:keydown={(event) => {
            if (event.key === "Enter") {
              onRename(collection, folder, event?.target?.value);
            }
          }}
        />

        <button
          disabled={!userRoleInWorkspace || tab?.source === "SPEC"}
          class="btn w-25 btn-primary rounded border-0 text-align-right py-1"
          on:click={() => {
            onCreateAPIRequest(collection, folder);
          }}>New Request</button
        >
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
        disabled={!userRoleInWorkspace || tab?.source === "SPEC"}
        id="updateFolderDescField"
        style="font-size: 12px; "
        class="form-control bg-backgroundColor border-0 text-textColor fs-6 h-50 input-outline"
        value={tab.description}
        placeholder="Describe the folder. Add code examples and tips for your team to effectively use the APIs."
        on:blur={(event) => onUpdateDescription(tab, event.target.value)}
        on:keydown={(event) => {
          if (event.key === "Enter") {
            onUpdateDescription(tab, event.target.value);
          }
        }}
      />
    </div>
  </div>
  <div
    class="d-flex flex-column align-items-left justify-content-start"
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
  .main-container {
    height: calc(100vh - 80px);
    background-color: var(--background-color);
  }

  .my-collection {
    padding: 20px;
  }

  .input-outline {
    border-radius: 0%;
  }
  textarea::placeholder {
    font-size: 12px;
    color: var(--text-color);
  }

  .input-outline:focus {
    outline: 2px solid var(--sparrow-blue);
  }
</style>
