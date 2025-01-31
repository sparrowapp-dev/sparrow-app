<script lang="ts">
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
    RequestIcon,
  } from "../images";
  import NoResults from "./NoResults.svelte";
  import type { SearchConfig } from "../types/types";
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
  import TitleBar from "./TitleBar.svelte";
  import ItemBar from "./ItemBar.svelte";

  const methodIcons = {
    GET: getIcon,
    POST: postIcon,
    DELETE: deleteIcon,
    PUT: putIcon,
    PATCH: patchIcon,
    SOCKETIO: socketIoIcon,
    WEBSOCKET: webSocketIcon,
  };

  $: config = searchConfigs[selectedType.toLowerCase()];

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

  export const searchConfigs: Record<string, SearchConfig> = {
    workspaces: {
      icon: WorkspaceIcon,
      getItemData: (item) => ({
        name: item.name,
        path: item.team.teamName,
        type: "workspace",
        originalData: item,
      }),
      handleNavigation: handleGlobalSearchWorkspaceNavigation,
    },
    folders: {
      icon: FolderIcon,
      getItemData: (item) => ({
        name: item.tree.name,
        path: item.path,
        type: "folder",
        originalData: item,
      }),
      handleNavigation: (data) =>
        handleGlobalSearchFolderNavigation(
          data.workspaceId,
          data.collectionId,
          data.tree,
        ),
    },
    collections: {
      icon: CollectionIcon,
      getItemData: (item) => ({
        name: item.tree.name,
        path: item.path,
        type: "collection",
        originalData: item,
      }),
      handleNavigation: (data) =>
        handleGlobalSearchCollectionNavigation(data.workspaceId, data.tree),
    },
    requests: {
      icon: RequestIcon,
      getItemData: (item) => ({
        name: item.tree.name,
        path: item.path,
        url: item.tree.request?.url || "",
        type: "request",
        originalData: item,
      }),
      handleNavigation: (data) =>
        handleGlobalSearchRequestNavigation(
          data.tree.id,
          data.workspaceId,
          data.collectionId,
          data.folderDetails?.id || "",
          data.tree,
        ),
    },
    environments: {
      icon: EnvironmentIcon,
      getItemData: (item) => ({
        name: item.title,
        type: "environment",
        originalData: item,
      }),
      handleNavigation: handleGlobalSearchEnvironmentNavigation,
    },
    flows: {
      icon: FlowIcon,
      getItemData: (item) => ({
        name: item.name,
        path: item.description || "",
        type: "flow",
        originalData: item,
      }),
      handleNavigation: handleGlobalSearchTestflowNavgation,
    },
  };

  const titleConfig = {
    workspaces: {
      title: "Recent Workspaces",
      shortcutKeys: ["Shift", "W"],
    },
    folders: {
      title: "Recent Folders",
      shortcutKeys: ["Shift", "F"],
    },
    collections: {
      title: "Recent Collections",
      shortcutKeys: ["Shift", "C"],
    },
    requests: {
      title: "Recent Requests",
      shortcutKeys: ["Shift", "A"],
    },
    environments: {
      title: "Recent Environments",
      shortcutKeys: ["Shift", "E"],
    },
    flows: {
      title: "Recent Test Flows",
      shortcutKeys: ["Shift", "T"],
    },
  };
</script>

<div class="recent-items-container">
  {#if selectedType == "" && searchQuery === ""}
    <div class="recent-section">
      {#if searchQuery == "" && filteredRequest?.length > 0}
        <TitleBar data={titleConfig.requests} />
        <div class="request-section">
          {#each filteredRequest.slice(0, 3) as request}
            {#if !(isWebApp && request.tree.request.method === "GRAPHQL")}
              {@const details = getRequestDetails(request)}
            <ItemBar
                data={{
                  name: details.name,
                  path: request.path,
                  url: details.url
                }}
                icon={methodIcons[details.method] || hexIcon}
                onClick={() => {
                  handleGlobalSearchRequestNavigation(
                    request.tree.id,
                    request.workspaceId,
                    request.collectionId,
                    request.folderDetails?.id || "",
                    request.tree,
                  );
                }}
              />
              {/if}
          {/each}
        </div>
      {/if}
    </div>

    {#if searchQuery == "" && filteredCollection[0]}
      <div style="display:flex;flex-direction:column; gap:4px;">
        <TitleBar data={titleConfig.collections} />
        <ItemBar
        data={{
          name: filteredCollection[0]?.tree.name,
          path: filteredCollection[0]?.path
        }}
        icon={CollectionIcon}
        onClick={() =>
          handleGlobalSearchCollectionNavigation(
            filteredCollection[0].workspaceId,
            filteredCollection[0].tree,
          )}
      />
      </div>
    {/if}

    {#if searchQuery == "" && filteredEnvironments[0]}
      <div style="display:flex;flex-direction:column; gap:4px;">
    <TitleBar data={titleConfig.environments} />
      <ItemBar
        data={{
          name: filteredEnvironments[0].title
        }}
        icon={EnvironmentIcon}
        onClick={() =>
          handleGlobalSearchEnvironmentNavigation(filteredEnvironments[0])}
      />
      </div>
    {/if}

    {#if searchQuery == "" && filteredFolder[0]}
      <div style="display:flex;flex-direction:column; gap:4px;">
      <TitleBar data={titleConfig.folders} />
      <ItemBar
        data={{
          name: filteredFolder[0].tree.name,
          path: filteredFolder[0].path
        }}
        icon={FolderIcon}
        onClick={() =>
          handleGlobalSearchFolderNavigation(
            filteredFolder[0].workspaceId,
            filteredFolder[0].collectionId,
            filteredFolder[0].tree,
          )}
      />
      </div>
    {/if}

    {#if searchQuery == "" && filteredWorkspaces[0]}
      <div style="display:flex;flex-direction:column; gap:4px;">
        <TitleBar data={titleConfig.workspaces} />
        <ItemBar
        data={{
          name: filteredWorkspaces[0].name,
          path: filteredWorkspaces[0].team.teamName
        }}
        icon={WorkspaceIcon}
        onClick={() =>
          handleGlobalSearchWorkspaceNavigation(filteredWorkspaces[0])}
      />
      </div>
    {/if}
    {#if searchQuery == "" && filteredTestflows?.length > 0}
      <TitleBar data={titleConfig.flows} />
      <ItemBar
        data={{
          name: filteredTestflows[0].name,
          path: filteredTestflows[0].description || ""
        }}
        icon={FlowIcon}
        onClick={() =>
          handleGlobalSearchTestflowNavgation(filteredTestflows[0])}
      />
    {/if}
  {:else if selectedType === "" && searchQuery !== ""}
  
    {#if filteredRequest?.length > 0 || filteredCollection?.length > 0 || filteredFolder?.length > 0 || filteredWorkspaces?.length > 0 || filteredEnvironments?.length > 0 || filteredTestflows?.length > 0}
      {#if filteredRequest?.length > 0}
         <TitleBar 
      data={{
        title: "Requests",
        shortcutKeys: ["Shift", "A"]
      }}
    />
    <div class="request-section">
      {#each filteredRequest as request}
        {#if !(isWebApp && request.tree.request.method === "GRAPHQL")}
          {@const details = getRequestDetails(request)}
          <ItemBar
            data={{
              name: details.name,
              path: request.path,
              url: details.url
            }}
            icon={methodIcons[details.method]}
            onClick={() => handleGlobalSearchRequestNavigation(
              request.tree.id,
              request.workspaceId,
              request.collectionId,
              request.folderDetails?.id || "",
              request.tree
            )}
          />
        {/if}
      {/each}
    </div>
      {/if}
    {#if filteredCollection?.length > 0}
    <TitleBar 
      data={{
        title: "Collection",
        shortcutKeys: ["Shift", "C"]
      }}
    />
    {#each filteredCollection as collection}
      <ItemBar
        data={{
          name: collection?.tree.name,
          path: collection?.path
        }}
        icon={CollectionIcon}
        onClick={() => handleGlobalSearchCollectionNavigation(
          collection.workspaceId,
          collection.tree
        )}
      />
    {/each}
  {/if}

  {#if filteredFolder?.length > 0}
    <TitleBar 
      data={{
        title: "Folders",
        shortcutKeys: ["Shift", "F"]
      }}
    />
    {#each filteredFolder as folder}
      <ItemBar
        data={{
          name: folder.tree.name,
          path: folder.path
        }}
        icon={FolderIcon}
        onClick={() => handleGlobalSearchFolderNavigation(
          folder.workspaceId,
          folder.collectionId,
          folder.tree
        )}
      />
    {/each}
  {/if}
     {#if filteredEnvironments?.length > 0}
    <TitleBar 
      data={{
        title: "Environment",
        shortcutKeys: ["Shift", "E"]
      }}
    />
    {#each filteredEnvironments as environment}
      <ItemBar
        data={{
          name: environment.title,
          path: ""
        }}
        icon={EnvironmentIcon}
        onClick={() => handleGlobalSearchEnvironmentNavigation(environment)}
      />
    {/each}
  {/if}

  {#if filteredTestflows?.length > 0}
    <TitleBar 
      data={{
        title: "Test Flows",
        shortcutKeys: ["Shift", "T"]
      }}
    />
    {#each filteredTestflows as testflow}
      <ItemBar
        data={{
          name: testflow.name,
          path: testflow.description || ""
        }}
        icon={FlowIcon}
        onClick={() => handleGlobalSearchTestflowNavgation(testflow)}
      />
    {/each}
  {/if}

  {#if filteredWorkspaces?.length > 0}
    <TitleBar 
      data={{
        title: "Workspaces",
        shortcutKeys: ["Shift", "W"]
      }}
    />
    {#each filteredWorkspaces as workspace}
      <ItemBar
        data={{
          name: workspace.name,
          path: workspace.team.teamName
        }}
        icon={WorkspaceIcon}
        onClick={() => handleGlobalSearchWorkspaceNavigation(workspace)}
      />
    {/each}
  {/if}
    {:else}
      <NoResults {searchQuery} />
    {/if}
  {:else if selectedType.toLowerCase() == "workspaces"}
    
     {#if filteredWorkspaces?.length > 0}
      <TitleBar 
        data={{
          title: "Recent Workspaces",
          shortcutKeys: ["Shift", "W"]
        }}
      />
      {#each filteredWorkspaces as workspace}
        <ItemBar
          data={{
            name: workspace.name,
            path: workspace.team.teamName
          }}
          icon={WorkspaceIcon}
          onClick={() => handleGlobalSearchWorkspaceNavigation(workspace)}
        />
      {/each}
    {:else}
      <NoResults {searchQuery} />
    {/if}

    <!-- Content for workspaces -->
  {:else if selectedType.toLowerCase() == "folders"}
    {#if filteredFolder?.length > 0}
      <TitleBar 
        data={{
          title: "Recent Folders",
          shortcutKeys: ["Shift", "F"]
        }}
      />
      {#each filteredFolder as folder}
        <ItemBar
          data={{
            name: folder.tree.name,
            path: folder.path
          }}
          icon={FolderIcon}
          onClick={() => handleGlobalSearchFolderNavigation(
            folder.workspaceId,
            folder.collectionId,
            folder.tree
          )}
        />
      {/each}
    {:else}
      <NoResults {searchQuery} />
    {/if}

    <!-- Content for folders -->
  {:else if selectedType.toLowerCase() == "collections"}
    {#if filteredCollection?.length > 0}
      <TitleBar 
        data={{
          title: "Recent Collections",
          shortcutKeys: ["Shift", "C"]
        }}
      />
      {#each filteredCollection as collection}
        <ItemBar
          data={{
            name: collection?.tree.name,
            path: collection?.path
          }}
          icon={CollectionIcon}
          onClick={() => handleGlobalSearchCollectionNavigation(
            collection.workspaceId,
            collection.tree
          )}
        />
      {/each}
    {:else}
      <NoResults {searchQuery} />
    {/if}
  {:else if selectedType.toLowerCase() == "requests"}
   {#if filteredRequest?.length > 0}
      <TitleBar 
        data={{
          title: "Recent Requests",
          shortcutKeys: ["Shift", "A"]
        }}
      />
      <div class="request-section">
        {#each filteredRequest as request}
          {#if !(isWebApp && request.tree.request.method === "GRAPHQL")}
            <ItemBar
              data={{
                name: request.tree.name,
                path: request.path,
                url: request.tree.request?.url || ""
              }}
              icon={methodIcons[request.tree.request.method]}
              onClick={() => handleGlobalSearchRequestNavigation(
                request.tree.id,
                request.workspaceId,
                request.collectionId,
                request.folderDetails?.id || "",
                request.tree
              )}
            />
          {/if}
        {/each}
      </div>
    {:else}
      <NoResults {searchQuery} />
    {/if}
  {:else if selectedType.toLowerCase() == "environments"}
    {#if filteredEnvironments?.length > 0}
      <TitleBar 
        data={{
          title: "Recent Environments",
          shortcutKeys: ["Shift", "E"]
        }}
      />
      {#each filteredEnvironments as environment}
        <ItemBar
          data={{
            name: environment.title,
            path: ""
          }}
          icon={EnvironmentIcon}
          onClick={() => handleGlobalSearchEnvironmentNavigation(environment)}
        />
      {/each}
    {:else}
      <NoResults {searchQuery} />
    {/if}
  {:else if selectedType.toLowerCase() == "flows"}
    {#if filteredTestflows?.length > 0}
      <TitleBar 
        data={{
          title: "Recent Test Flows",
          shortcutKeys: ["Shift", "T"]
        }}
      />
      {#each filteredTestflows as testflow}
        <ItemBar
          data={{
            name: testflow.name,
            path: testflow.description || ""
          }}
          icon={FlowIcon}
          onClick={() => handleGlobalSearchTestflowNavgation(testflow)}
        />
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
