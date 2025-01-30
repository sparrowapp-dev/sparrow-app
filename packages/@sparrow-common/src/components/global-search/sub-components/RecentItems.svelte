<script lang="ts">
  import { onMount } from "svelte";
  import {
    FolderIcon,
    EnvironmentIcon,
    CollectionIcon,
    WorkspaceIcon,
    keyCommand,
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
  import type { EnvironmentDocument } from "@app/database/database";
  import NoResults from "./NoResults.svelte";

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
  export let searchTestflow;
  export let searchEnvironment;
  export let searchWorkspace;
  export let recentTestflow;
  export let recentEnvironment;
  export let recentWorkspace;

  let filteredWorkspaces = [];
  let filteredEnvironments = [];
  let filteredTestflows = [];

  interface RecentItem {
    title: string;
    workspace: string;
    collection?: string;
    environment?: string;
    url?: string;
    method?: string;
  }
  $: {
    updateWorkspaces(searchQuery);
    updateEnvironments(searchQuery);
    updateTestflows(searchQuery);
  }

  const updateWorkspaces = async (query: string) => {
    try {
      const workspaces = await searchWorkspace(query);
      filteredWorkspaces = workspaces.map((workspace) => workspace._data);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      filteredWorkspaces = [];
    }
  };

  const updateEnvironments = async (query: string) => {
    try {
      const environments: EnvironmentDocument[] =
        await searchEnvironment(query);
      filteredEnvironments = environments.map((environment) => ({
        title: environment.name,
        workspace: environment.workspaceId,
        id: environment.id,
        variable: environment.variable,
      }));
    } catch (error) {
      console.error("Error fetching environments:", error);
      filteredEnvironments = [];
    }
  };

  const updateTestflows = async (query: string) => {
    try {
      const testflows = await searchTestflow(query);
      filteredTestflows = testflows.map((testflow) => testflow._data);
    } catch (error) {
      console.error("Error fetching testflows:", error);
      filteredTestflows = [];
    }
  };

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

  onMount(async () => {
    try {
      filteredWorkspaces = await recentWorkspace();
      filteredWorkspaces = filteredWorkspaces.map(
        (workspace) => workspace._data,
      );

      const recentTestflows = await recentTestflow();
      filteredTestflows = recentTestflows.map((testflow) => testflow._data);

      const recentEnvironments = await recentEnvironment();
    } catch (error) {
      console.error("Error fetching recent workspaces:", error);
    }
  });
</script>

<div class="recent-items-container">
  {#if selectedType == "" && searchQuery === ""}
    <div class="recent-section">
      {#if filteredRequest.length > 0}
        <div class="section-header">
          <span class="section-title">Recent Requests</span>
          <div class="keyboard-shortcut">
            <div class="shortcut-key">
              <img src={keyCommand} alt="" class="shortcut-icon" />
            </div>
            <span class="key">Shift</span>
            <span class="key">A</span>
          </div>
        </div>
        <div class="request-section">
          {#each filteredRequest as request}
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
                  <span class="request-title"
                    >{(details.name)}</span
                  >
                  <span class="request-path">{request.path}</span>
                </div>
                <span class="request-url">{details.url}</span>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <NoResults {searchQuery} />
      {/if}
    </div>

    {#if searchQuery == "" && filteredCollection[0]}
      <div style="display:flex;flex-direction:column; gap:4px;">
        <div class="section-top">
          <span class="section-title">Recent Collection</span>
          <div class="keyboard-shortcut">
            <div class="shortcut-key">
              <img src={keyCommand} alt="" class="shortcut-icon" />
            </div>
            <span class="key">Shift</span>
            <span class="key">C</span>
          </div>
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
          <div class="keyboard-shortcut">
            <div class="shortcut-key">
              <img src={keyCommand} alt="" class="shortcut-icon" />
            </div>
            <span class="key">Shift</span>
            <span class="key">E</span>
          </div>
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
          <div class="keyboard-shortcut">
            <div class="shortcut-key">
              <img src={keyCommand} alt="" class="shortcut-icon" />
            </div>
            <span class="key">Shift</span>
            <span class="key">F</span>
          </div>
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

    {#if searchQuery == "" && filteredWorkspaces[0]}
      <div style="display:flex;flex-direction:column; gap:4px;">
        <div class="section-top">
          <span class="section-title">Recent Workspace</span>
          <div class="keyboard-shortcut">
            <div class="shortcut-key">
              <img src={keyCommand} alt="" class="shortcut-icon" />
            </div>
            <span class="key">Shift</span>
            <span class="key">W</span>
          </div>
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
  {:else if selectedType === "" && searchQuery !== ""}
    {#if filteredRequest?.length > 0 || filteredCollection?.length > 0 || filteredFolder?.length > 0 || filteredWorkspaces?.length > 0 || filteredEnvironments?.length > 0 || filteredTestflows?.length > 0}
      {#if filteredRequest?.length > 0}
        <div class="section-header">
          <span class="section-title">Requests</span>
          <div class="keyboard-shortcut">
            <div class="shortcut-key">
              <img src={keyCommand} alt="" class="shortcut-icon" />
            </div>
            <span class="key">Shift</span>
            <span class="key">A</span>
          </div>
        </div>
        <div class="request-section">
          {#each filteredRequest as request}
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
                  <span class="request-title"
                    >{(details.name)}</span
                  >
                  <span class="request-path">{request.path}</span>
                </div>
                <span class="request-url">{details.url}</span>
              </div>
            </div>
          {/each}
        </div>
      {/if}
      {#if filteredCollection?.length > 0}
        <div class="section-header">
          <span class="section-title">Collection</span>
          <div class="keyboard-shortcut">
            <div class="shortcut-key">
              <img src={keyCommand} alt="" class="shortcut-icon" />
            </div>
            <span class="key">Shift</span>
            <span class="key">C</span>
          </div>
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
                <span class="request-title"
                  >{(collection?.tree.name)}</span
                >
                <span class="request-path">{collection?.path}</span>
              </div>
            </div>
          </div>
        {/each}
      {/if}
      {#if filteredFolder?.length > 0}
        <div class="section-header">
          <span class="section-title">Folders</span>
          <div class="keyboard-shortcut">
            <div class="shortcut-key">
              <img src={keyCommand} alt="" class="shortcut-icon" />
            </div>
            <span class="key">Shift</span>
            <span class="key">F</span>
          </div>
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
                <span class="request-title"
                  >{(folder.tree.name)}</span
                >
                <span class="request-path">{folder.path}</span>
              </div>
            </div>
          </div>
        {/each}
      {/if}
      {#if filteredEnvironments?.length > 0}
        <div class="section-header">
          <span class="section-title">Environment</span>
          <div class="keyboard-shortcut">
            <div class="shortcut-key">
              <img src={keyCommand} alt="" class="shortcut-icon" />
            </div>
            <span class="key">Shift</span>
            <span class="key">E</span>
          </div>
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
                <span class="request-title"
                  >{(environment.title)}</span
                >
              </div>
            </div>
          </div>
        {/each}
      {/if}
      {#if filteredTestflows?.length > 0}
        <div class="section-header">
          <span class="section-title">Test Flows</span>
          <div class="keyboard-shortcut">
            <div class="shortcut-key">
              <img src={keyCommand} alt="" class="shortcut-icon" />
            </div>
            <span class="key">Shift</span>
            <span class="key">T</span>
          </div>
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
                <span class="request-title"
                  >{(testflow.name)}</span
                >
                <span class="request-path">{testflow.description || ""}</span>
              </div>
            </div>
          </div>
        {/each}
      {/if}
      {#if filteredWorkspaces?.length > 0}
        <div class="section-header">
          <span class="section-title">Workspaces</span>
          <div class="keyboard-shortcut">
            <div class="shortcut-key">
              <img src={keyCommand} alt="" class="shortcut-icon" />
            </div>
            <span class="key">Shift</span>
            <span class="key">W</span>
          </div>
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
  {:else if selectedType.toLowerCase() == "workspaces"}
    {#if filteredWorkspaces.length > 0}
      <div class="section-header">
        <span class="section-title">Recent Workspaces</span>
        <div class="keyboard-shortcut">
          <div class="shortcut-key">
            <img src={keyCommand} alt="" class="shortcut-icon" />
          </div>
          <span class="key">Shift</span>
          <span class="key">W</span>
        </div>
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
              <span class="request-title"
                >{(workspace.name)}</span
              >
              <span class="request-path">{workspace.team.teamName}</span>
            </div>
          </div>
        </div>
      {/each}
    {:else}
      <div>
        <NoResults {searchQuery} />
      </div>
    {/if}

    <!-- Content for workspaces -->
  {:else if selectedType.toLowerCase() == "folders"}
    {#if filteredFolder.length > 0}
      <div class="section-header">
        <span class="section-title">Recent Folders</span>
        <div class="keyboard-shortcut">
          <div class="shortcut-key">
            <img src={keyCommand} alt="" class="shortcut-icon" />
          </div>
          <span class="key">Shift</span>
          <span class="key">F</span>
        </div>
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
              <span class="request-title"
                >{(folder.tree.name)}</span
              >
              <span class="request-path">{folder.path}</span>
            </div>
          </div>
        </div>
      {/each}
    {:else}
      <NoResults {searchQuery} />
    {/if}

    <!-- Content for folders -->
  {:else if selectedType.toLowerCase() == "collections"}
    {#if filteredCollection.length > 0}
      <div class="section-header">
        <span class="section-title">Recent Collection</span>
        <div class="keyboard-shortcut">
          <div class="shortcut-key">
            <img src={keyCommand} alt="" class="shortcut-icon" />
          </div>
          <span class="key">Shift</span>
          <span class="key">C</span>
        </div>
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
              <span class="request-title"
                >{(collection?.tree.name)}</span
              >
              <span class="request-path">{collection?.path}</span>
            </div>
          </div>
        </div>
      {/each}
    {:else}
      <NoResults {searchQuery} />
    {/if}
  {:else if selectedType.toLowerCase() == "requests"}
    {#if filteredRequest.length > 0}
      <div class="section-header">
        <span class="section-title">Recent Requests</span>
        <div class="keyboard-shortcut">
          <div class="shortcut-key">
            <CollectionIcon color="var(--icon-ds-neutral-200)" />
          </div>
          <span class="key">Shift</span>
          <span class="key">A</span>
        </div>
      </div>
      <div class="request-section">
        {#each filteredRequest as request}
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
              <span class="request-url">{request.tree.request?.url || ""}</span>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <NoResults {searchQuery} />
    {/if}
  {:else if selectedType.toLowerCase() == "environments"}
    {#if filteredEnvironments.length > 0}
      <div class="section-header">
        <span class="section-title">Recent Environment</span>
        <div class="keyboard-shortcut">
          <div class="shortcut-key">
            <img src={keyCommand} alt="" class="shortcut-icon" />
          </div>
          <span class="key">Shift</span>
          <span class="key">E</span>
        </div>
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
              <span class="request-title"
                >{(environment.title)}</span
              >
            </div>
          </div>
        </div>
      {/each}
    {:else}
      <NoResults {searchQuery} />
    {/if}
  {:else if selectedType.toLowerCase() == "flows"}
    {#if filteredTestflows.length > 0}
      <div class="section-header">
        <span class="section-title">Test Flows</span>
        <div class="keyboard-shortcut">
          <div class="shortcut-key">
            <img src={keyCommand} alt="" class="shortcut-icon" />
          </div>
          <span class="key">Shift</span>
          <span class="key">T</span>
        </div>
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
              <span class="request-title"
                >{(testflow.name)}</span
              >
              <span class="request-path">{testflow.description || ""}</span>
            </div>
          </div>
        </div>
      {/each}
    {:else}
      <NoResults {searchQuery} />
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

  .keyboard-shortcut {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .shortcut-key {
    border-radius: 4px;
    background-color: var(--bg-ds-surface-600);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 4px;
  }

  .key {
    border-radius: 4px;
    background-color: var(--bg-ds-surface-600);
    color: var(--text-ds-neutral-200);
    padding: 2px 4px;
    font:
      400 12px Inter,
      sans-serif;
    line-height: 18px;
    min-height: 24px;
    min-width: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
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
