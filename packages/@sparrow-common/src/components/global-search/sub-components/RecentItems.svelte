<script lang="ts">
  import {
    FolderIcon,
    EnvironmentIcon,
    CollectionIcon,
    WorkspaceIcon,
    getIcon,
    hexIcon,
    postIcon,
    putIcon,
    deleteIcon,
    patchIcon,
    socketIoIcon,
    webSocketIcon,
    FlowIcon,
  } from "@sparrow/common/images";
  import NoResults from "./NoResults.svelte";
  import { KeyboardShortcuts } from "@sparrow/library/ui";
  import { onMount } from "svelte";

  export let searchQuery = "";
  export let filteredCollection = [];
  export let filteredFolder = [];
  export let filteredRequest;
  export let selectedType = "";
  export let handleGlobalSearchRequestNavigation;
  export let handleGlobalSearchCollectionNavigation;
  export let handleGlobalSearchFolderNavigation;
  export let handleGlobalSearchWorkspaceNavigation;
  export let handleGlobalSearchEnvironmentNavigation;
  export let handleGlobalSearchTestflowNavgation;
  export let filteredWorkspaces;
  export let filteredTestflows;
  export let filteredEnvironments;
  export let isWebApp = false;
  export let isGuestUser = false;
  export let osKeyName="Ctrl";

  const methodIcons = {
    GET: getIcon,
    POST: postIcon,
    DELETE: deleteIcon,
    PUT: putIcon,
    PATCH: patchIcon,
    SOCKETIO: socketIoIcon,
    WEBSOCKET: webSocketIcon,
  };

  const getRequestDetails = (request) => {
    switch (request.type) {
      case "GRAPHQL":
        return {
          url: request.tree.graphql?.url || "",
          method: "GRAPHQL",
          name: request.tree.name,
          description: request.tree.description || "",
        };
      case "SOCKETIO":
        return {
          url: request.tree.socketio?.url || "",
          method: "SOCKETIO",
          name: request.tree.name,
          description: request.tree.description || "",
        };
      case "WEBSOCKET":
        return {
          url: request.tree.websocket?.url || "",
          method: "WEBSOCKET",
          name: request.tree.name,
          description: request.tree.description || "",
        };
      default:
        return {
          url: request.tree.request?.url || "",
          method: request.tree.request?.method || "",
          name: request.tree.name,
          description: request.tree.description || "",
        };
    }
  };
</script>

<div class="recent-items-container">
  {#if selectedType == "" && searchQuery === ""}
    <div class="recent-section">
      {#if searchQuery == "" && filteredRequest?.length > 0}
        <div class="section-header">
          <span class="section-title">Recent Requests</span>
            <KeyboardShortcuts keys={[osKeyName,"Shift", "A"]} />
        </div>
        <div class="request-section">
          {#each filteredRequest.slice(0, 3) as request}
            {#if !(isWebApp && request.tree.request.method === "GRAPHQL")}
              {@const details = getRequestDetails(request)}
              <div
                class="request-item"
                on:click={() => {
                  handleGlobalSearchRequestNavigation(
                    request.tree.id,
                    request.workspaceId,
                    request.collectionId,
                    request.folderDetails?.id || "",
                    request.tree,
                  );
                }}
              >
                <div class="request-method">
                  <img
                    src={methodIcons[details.method] || hexIcon}
                    alt=""
                    class="request-icon"
                  />
                </div>
                <div class="request-details">
                  <div class="request-header">
                    <span class="request-title">{details.name}</span>
                    <span class="request-path">{request.path}</span>
                  </div>
                  <span class="request-url">{details.url}</span>
                </div>
              </div>
            {/if}
          {/each}
        </div>
        <!-- {:else}
        <NoResults {searchQuery} /> -->
      {/if}
    </div>

    {#if searchQuery == "" && filteredCollection[0]}
      <div style="display:flex;flex-direction:column; gap:4px;">
        <div class="section-top">
          <span class="section-title">Recent Collection</span>
           <KeyboardShortcuts keys={[osKeyName,"Shift", "C"]} />
        </div>
        <div
          class="request-item"
          on:click={() =>
            handleGlobalSearchCollectionNavigation(
              filteredCollection[0].workspaceId,
              filteredCollection[0].tree,
            )}
        >
          <div class="request-method">
            <CollectionIcon color="var(--icon-ds-neutral-200)" />
          </div>
          <div class="request-details">
            <div class="request-header">
              <span class="request-title"
                >{filteredCollection[0]?.tree.name}</span
              >
              <span class="request-path">{filteredCollection[0]?.path}</span>
            </div>
          </div>
        </div>
      </div>
    {/if}

    {#if searchQuery == "" && filteredEnvironments[0]}
      <div style="display:flex;flex-direction:column; gap:4px;">
        <div class="section-top">
          <span class="section-title">Recent Environment</span>
           <KeyboardShortcuts keys={[osKeyName,"Shift", "E"]} />
        </div>

        <div
          class="request-item"
          on:click={() =>
            handleGlobalSearchEnvironmentNavigation(filteredEnvironments[0])}
        >
          <div class="request-method">
            <EnvironmentIcon color="var(--icon-ds-neutral-200)" />
          </div>
          <div class="request-details">
            <div class="request-header">
              <span class="request-title">{filteredEnvironments[0].title}</span>
            </div>
          </div>
        </div>
      </div>
    {/if}

    {#if searchQuery == "" && filteredFolder[0]}
      <div style="display:flex;flex-direction:column; gap:4px;">
        <div class="section-top">
          <span class="section-title">Recent Folder</span>
           <KeyboardShortcuts keys={[osKeyName,"Shift", "F"]} />
        </div>

        <div
          class="request-item"
          on:click={() =>
            handleGlobalSearchFolderNavigation(
              filteredFolder[0].workspaceId,
              filteredFolder[0].collectionId,
              filteredFolder[0].tree,
            )}
        >
          <div class="request-method">
            <FolderIcon color="var(--icon-ds-neutral-200)" />
          </div>
          <div class="request-details">
            <div class="request-header">
              <span class="request-title">{filteredFolder[0].tree.name}</span>
              <span class="request-path">{filteredFolder[0].path}</span>
            </div>
          </div>
        </div>
      </div>
    {/if}

    {#if searchQuery == "" && filteredWorkspaces[0] && !isGuestUser}
      <div style="display:flex;flex-direction:column; gap:4px;">
        <div class="section-top">
          <span class="section-title">Recent Workspace</span>
            <KeyboardShortcuts keys={[osKeyName,"Shift", "W"]} />
        </div>
        <div
          class="request-item"
          on:click={() =>
            handleGlobalSearchWorkspaceNavigation(filteredWorkspaces[0])}
        >
          <div class="request-method">
            <WorkspaceIcon color="var(--icon-ds-neutral-200)" />
          </div>
          <div class="request-details">
            <div class="request-header">
              <span class="request-title">{filteredWorkspaces[0].name}</span>
              <span class="request-path"
                >{filteredWorkspaces[0].team.teamName}</span
              >
            </div>
          </div>
        </div>
      </div>
    {/if}
    {#if searchQuery == "" && filteredTestflows?.length > 0}
      <div class="section-header">
        <span class="section-title">Recent Test Flows</span>
         <KeyboardShortcuts keys={[osKeyName,"Shift", "T"]} />
      </div>
      <div
        class="request-item"
        on:click={() =>
          handleGlobalSearchTestflowNavgation(filteredTestflows[0])}
      >
        <div class="request-method">
          <FlowIcon color="var(--icon-ds-neutral-200)" />
        </div>
        <div class="request-details">
          <div class="request-header">
            <span class="request-title">{filteredTestflows[0].name}</span>
            <span class="request-path"
              >{filteredTestflows[0].description || ""}</span
            >
          </div>
        </div>
      </div>
    {/if}
  {:else if selectedType === "" && searchQuery !== ""}
    {#if filteredRequest?.length > 0 || filteredCollection?.length > 0 || filteredFolder?.length > 0 || filteredWorkspaces?.length > 0 || filteredEnvironments?.length > 0 || filteredTestflows?.length > 0}
      {#if filteredRequest?.length > 0}
        <div class="section-header">
          <span class="section-title">Requests</span>
           <KeyboardShortcuts keys={[osKeyName,"Shift", "A"]} />
        </div>
        <div class="request-section">
          {#each filteredRequest as request}
            {#if !(isWebApp && request.tree.request.method === "GRAPHQL")}
              {@const details = getRequestDetails(request)}
              <div
                class="request-item"
                on:click={() => {
                  handleGlobalSearchRequestNavigation(
                    request.tree.id,
                    request.workspaceId,
                    request.collectionId,
                    request.folderDetails?.id || "",
                    request.tree,
                  );
                }}
              >
                <div class="request-method">
                  <img
                    src={methodIcons[details.method] || hexIcon}
                    alt=""
                    class="request-icon"
                  />
                </div>
                <div class="request-details">
                  <div class="request-header">
                    <span class="request-title">{details.name}</span>
                    <span class="request-path">{request.path}</span>
                  </div>
                  <span class="request-url">{details.url}</span>
                </div>
              </div>
            {/if}
          {/each}
        </div>
      {/if}
      {#if filteredCollection?.length > 0}
        <div class="section-header">
          <span class="section-title">Collection</span>
           <KeyboardShortcuts keys={[osKeyName,"Shift", "C"]} />
        </div>
        {#each filteredCollection as collection}
          <div
            class="request-item"
            on:click={() =>
              handleGlobalSearchCollectionNavigation(
                collection.workspaceId,
                collection.tree,
              )}
          >
            <div class="request-method">
              <CollectionIcon color="var(--icon-ds-neutral-200)" />
            </div>
            <div class="request-details">
              <div class="request-header">
                <span class="request-title">{collection?.tree.name}</span>
                <span class="request-path">{collection?.path}</span>
              </div>
            </div>
          </div>
        {/each}
      {/if}
      {#if filteredFolder?.length > 0}
        <div class="section-header">
          <span class="section-title">Folders</span>
            <KeyboardShortcuts keys={[osKeyName,"Shift", "F"]} />
        </div>
        {#each filteredFolder as folder}
          <div
            class="request-item"
            on:click={() =>
              handleGlobalSearchFolderNavigation(
                folder.workspaceId,
                folder.collectionId,
                folder.tree,
              )}
          >
            <div class="request-method">
              <FolderIcon color="var(--icon-ds-neutral-200)" />
            </div>
            <div class="request-details">
              <div class="request-header">
                <span class="request-title">{folder.tree.name}</span>
                <span class="request-path">{folder.path}</span>
              </div>
            </div>
          </div>
        {/each}
      {/if}
      {#if filteredEnvironments?.length > 0}
        <div class="section-header">
          <span class="section-title">Environment</span>
            <KeyboardShortcuts keys={[osKeyName,"Shift", "E"]} />
        </div>
        {#each filteredEnvironments as environment}
          <div
            class="request-item"
            on:click={() =>
              handleGlobalSearchEnvironmentNavigation(environment)}
          >
            <div class="request-method">
              <EnvironmentIcon color="var(--icon-ds-neutral-200)" />
            </div>
            <div class="request-details">
              <div class="request-header">
                <span class="request-title">{environment.title}</span>
              </div>
            </div>
          </div>
        {/each}
      {/if}
      {#if filteredTestflows?.length > 0}
        <div class="section-header">
          <span class="section-title">Test Flows</span>
            <KeyboardShortcuts keys={[osKeyName,"Shift", "T"]} />
        </div>
        {#each filteredTestflows as testflow}
          <div
            class="request-item"
            on:click={() => handleGlobalSearchTestflowNavgation(testflow)}
          >
            <div class="request-method">
              <FlowIcon color="var(--icon-ds-neutral-200)" />
            </div>
            <div class="request-details">
              <div class="request-header">
                <span class="request-title">{testflow.name}</span>
                <span class="request-path">{testflow.description || ""}</span>
              </div>
            </div>
          </div>
        {/each}
      {/if}
      {#if filteredWorkspaces?.length > 0 && !isGuestUser}
        <div class="section-header">
          <span class="section-title">Workspaces</span>
            <KeyboardShortcuts keys={[osKeyName,"Shift", "W"]} />
        </div>
        {#each filteredWorkspaces as workspace}
          <div
            class="request-item"
            on:click={() => handleGlobalSearchWorkspaceNavigation(workspace)}
          >
            <div class="request-method">
              <WorkspaceIcon color="var(--icon-ds-neutral-200)" />
            </div>
            <div class="request-details">
              <div class="request-header">
                <span class="request-title">{workspace.name}</span>
                <span class="request-path">{workspace.team.teamName}</span>
              </div>
            </div>
          </div>
        {/each}
      {/if}
    {:else}
      <NoResults {searchQuery} />
    {/if}
  {:else if selectedType.toLowerCase() == "workspaces" && !isGuestUser}
    {#if filteredWorkspaces?.length > 0}
      <div class="section-header">
        <span class="section-title">Recent Workspaces</span>
          <KeyboardShortcuts keys={[osKeyName,"Shift", "W"]} />
      </div>
      {#each filteredWorkspaces as workspace}
        <div
          class="request-item"
          on:click={() => handleGlobalSearchWorkspaceNavigation(workspace)}
        >
          <div class="request-method">
            <WorkspaceIcon color="var(--icon-ds-neutral-200)" />
          </div>
          <div class="request-details">
            <div class="request-header">
              <span class="request-title">{workspace.name}</span>
              <span class="request-path">{workspace.team.teamName}</span>
            </div>
          </div>
        </div>
      {/each}
    {:else}
      <div>
        <NoResults
          {searchQuery}
          type="Custom"
          customText="No workspaces found. Create one!"
        />
      </div>
    {/if}

    <!-- Content for workspaces -->
  {:else if selectedType.toLowerCase() == "folders"}
    {#if filteredFolder?.length > 0}
      <div class="section-header">
        <span class="section-title">Recent Folders</span>
           <KeyboardShortcuts keys={[osKeyName,"Shift", "F"]} />
      </div>
      {#each filteredFolder as folder}
        <div
          class="request-item"
          on:click={() =>
            handleGlobalSearchFolderNavigation(
              folder.workspaceId,
              folder.collectionId,
              folder.tree,
            )}
        >
          <div class="request-method">
            <FolderIcon color="var(--icon-ds-neutral-200)" />
          </div>
          <div class="request-details">
            <div class="request-header">
              <span class="request-title">{folder.tree.name}</span>
              <span class="request-path">{folder.path}</span>
            </div>
          </div>
        </div>
      {/each}
    {:else}
      <NoResults
        {searchQuery}
        type="Custom"
        customText="No folders found. Add one!"
      />
    {/if}

    <!-- Content for folders -->
  {:else if selectedType.toLowerCase() == "collections"}
    {#if filteredCollection?.length > 0}
      <div class="section-header">
        <span class="section-title">Recent Collections</span>
          <KeyboardShortcuts keys={[osKeyName,"Shift", "C"]} />
      </div>
      {#each filteredCollection as collection}
        <div
          class="request-item"
          on:click={() =>
            handleGlobalSearchCollectionNavigation(
              collection.workspaceId,
              collection.tree,
            )}
        >
          <div class="request-method">
            <CollectionIcon color="var(--icon-ds-neutral-200)" />
          </div>
          <div class="request-details">
            <div class="request-header">
              <span class="request-title">{collection?.tree.name}</span>
              <span class="request-path">{collection?.path}</span>
            </div>
          </div>
        </div>
      {/each}
    {:else}
      <NoResults
        {searchQuery}
        type="Custom"
        customText="No collections found. Create one!"
      />
    {/if}
  {:else if selectedType.toLowerCase() == "requests"}
    {#if filteredRequest?.length > 0}
      <div class="section-header">
        <span class="section-title">Recent Requests</span>
          <KeyboardShortcuts keys={[osKeyName,"Shift", "A"]} />
      </div>
      <div class="request-section">
        {#each filteredRequest as request}
          {#if !(isWebApp && request.tree.request.method === "GRAPHQL")}
            <div
              class="request-item"
              on:click={() => {
                handleGlobalSearchRequestNavigation(
                  request.tree.id,
                  request.workspaceId,
                  request.collectionId,
                  request.folderDetails?.id || "",
                  request.tree,
                );
              }}
            >
              <div class="request-method">
                <img
                  src={methodIcons[request.tree.request.method] || hexIcon}
                  alt=""
                  class="request-icon"
                />
              </div>
              <div class="request-details">
                <div class="request-header">
                  <span class="request-title">{request.tree.name}</span>
                  <span class="request-path">{request.path}</span>
                </div>
                <span class="request-url"
                  >{request.tree.request?.url || ""}</span
                >
              </div>
            </div>
          {/if}
        {/each}
      </div>
    {:else}
      <NoResults
        {searchQuery}
        type="Custom"
        customText="No requests found. Try one!"
      />
    {/if}
  {:else if selectedType.toLowerCase() == "environments"}
    {#if filteredEnvironments?.length > 0}
      <div class="section-header">
        <span class="section-title">Recent Environments</span>
          <KeyboardShortcuts keys={[osKeyName,"Shift", "E"]} />
      </div>
      {#each filteredEnvironments as environment}
        <div
          class="request-item"
          on:click={() => handleGlobalSearchEnvironmentNavigation(environment)}
        >
          <div class="request-method">
            <EnvironmentIcon color="var(--icon-ds-neutral-200)" />
          </div>
          <div class="request-details">
            <div class="request-header">
              <span class="request-title">{environment.title}</span>
            </div>
          </div>
        </div>
      {/each}
    {:else}
      <NoResults
        {searchQuery}
        type="Custom"
        customText="No environments found. Add one!"
      />
    {/if}
  {:else if selectedType.toLowerCase() == "flows"}
    {#if filteredTestflows?.length > 0}
      <div class="section-header">
        <span class="section-title">Recent Test Flows</span>
          <KeyboardShortcuts keys={[osKeyName,"Shift", "T"]} />
      </div>
      {#each filteredTestflows as testflow}
        <div
          class="request-item"
          on:click={() => handleGlobalSearchTestflowNavgation(testflow)}
        >
          <div class="request-method">
            <FlowIcon color="var(--icon-ds-neutral-200)" />
          </div>
          <div class="request-details">
            <div class="request-header">
              <span class="request-title">{testflow.name}</span>
              <span class="request-path">{testflow.description || ""}</span>
            </div>
          </div>
        </div>
      {/each}
    {:else}
      <NoResults
        {searchQuery}
        type="Custom"
        customText="No test flows found. Build one!"
      />
    {/if}
  {/if}
</div>

<style>
  .recent-items-container {
    display: flex;
    flex-direction: column;
    padding: 8px;
    gap: 4px;
    overflow-y: auto;
  }
  .recent-section {
    margin-bottom: 12px;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2px;
    margin-bottom: 4px;
  }

  .section-title {
    color: var(--text-ds-neutral-500);
    font:
      400 12px Inter,
      sans-serif;
  }

  .request-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px;
    margin-bottom: 2px;
    cursor: pointer;
  }

  .request-item:hover {
    background-color: var(--bg-ds-surface-400);
  }

  .request-item:hover .request-title {
    color: var(--white-color);
  }

  .request-item:hover .request-path {
    color: var(--text-ds-neutral-300);
  }

  .request-item:hover .request-url {
    color: var(--text-ds-primary-300);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .request-method {
    border-radius: 2px;
    background-color: var(--bg-ds-surface-500);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    padding: 4px;
    min-height: 24px;
    gap: 8px;
  }

  .request-icon {
    width: 20px;
    height: 14px;
  }
  .other-icon {
    width: 16px;
    height: 16px;
  }

  .request-details {
    display: flex;
    flex-direction: column;
    min-width: 240px;
    flex: 1;
    gap: 3px;
  }

  .request-header {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .request-title {
    color: var(--text-ds-neutral-300);
    font:
      400 12px Inter,
      sans-serif;
    flex: 1 1 0;
    max-width: fit-content;
  }

  .request-path {
    color: var(--text-ds-neutral-500);
    font:
      400 12px Inter,
      sans-serif;
    flex: 2 1 0;
  }

  .request-url {
    color: var(--text-ds-primary-300);
    font:
      400 12px Inter,
      sans-serif;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
    max-width: 100%;
  }
  .section-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .request-section {
    gap: 2px;
    display: flex;
    flex-direction: column;
  }
  .request-header span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex-shrink: 1;
  }
</style>
