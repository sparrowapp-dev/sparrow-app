<script lang="ts">
  import {
    CollectionIcongs,
    FolderIcon4 as FolderIcon,
    StackIcon,
    SocketIoIcon,
    GraphIcon,
    SocketIcon,
    WorkspaceIcongs,
    FlowIcon,
    RequestIcon,
    getIcon,
    putIcon,
    deleteIcon,
    patchIcon,
    postIcon,
  } from "@sparrow/library/icons";
  import NoResults from "./sub-components/NoResults.svelte";
  import { KeyboardShortcuts } from "@sparrow/library/ui";
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
  export let osKeyName = "Ctrl";
  export let isGuestUser = false;
  SocketIcon;
  import TitleBar from "./sub-components/TitleBar.svelte";
  import ItemBar from "./sub-components/ItemBar.svelte";

  const methodIcons = {
    GET: getIcon,
    POST: postIcon,
    DELETE: deleteIcon,
    PUT: putIcon,
    PATCH: patchIcon,
    SOCKETIO: SocketIoIcon,
    WEBSOCKET: SocketIcon,
  };
  const methodIconsProps = {
    SOCKETIO: "var(--icon-ds-success-300)",
    WEBSOCKET: "var(--icon-ds-primary-400)",
    GRAPHQL: "var(--icon-ds-accent-400)",
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

  $: selectedTypeMapping = {
    workspaces: {
      items: filteredWorkspaces,
      title: searchQuery === "" ? "Recent Workspaces" : "Workspaces",
      // shortcutKeys: [osKeyName, "Shift", "W"],
      icon: WorkspaceIcongs,
      nav: (item) => handleGlobalSearchWorkspaceNavigation(item),
      getName: (item) => item.name,
      getPath: (item) => item.team.teamName,
    },
    folders: {
      items: filteredFolder,
      title: searchQuery === "" ? "Recent Folders" : "Folders",
      shortcutKeys: [osKeyName, "Shift", "F"],
      icon: FolderIcon,
      nav: (item) =>
        handleGlobalSearchFolderNavigation(
          item.workspaceId,
          item.collectionId,
          item.tree,
        ),
      getName: (item) => item.tree.name,
      getPath: (item) => item.path,
    },
    collections: {
      items: filteredCollection,
      title: searchQuery === "" ? "Recent Collections" : "Collections",
      shortcutKeys: [osKeyName, "Shift", "C"],
      icon: CollectionIcongs,
      nav: (item) =>
        handleGlobalSearchCollectionNavigation(item.workspaceId, item.tree),
      getName: (item) => item.tree.name,
      getPath: (item) => item.path,
    },
    requests: {
      items: filteredRequest,
      title: searchQuery === "" ? "Recent Requests" : "Requests",
      shortcutKeys: [osKeyName, "Shift", "A"],
      icon: RequestIcon,
      nav: (item) =>
        handleGlobalSearchRequestNavigation(
          item.tree.id,
          item.workspaceId,
          item.collectionId,
          item.folderDetails?.id || "",
          item.tree,
        ),
      getName: (item) => item.tree.name,
      getPath: (item) => item.path,
      getIcon: (item) => methodIcons[item.tree.request.method] || GraphIcon,
      filter: (item) => !(isWebApp && item.tree.request.method === "GRAPHQL"),
      getIconProps: (item) => {
        const type = item.tree.request.method || "";
        return {
          width: "16px",
          height: "16px",
          color: methodIconsProps[type],
        };
      },
    },
    environments: {
      items: filteredEnvironments,
      title: searchQuery === "" ? "Recent Environments" : "Environments",
      shortcutKeys: [osKeyName, "Shift", "E"],
      icon: StackIcon,
      nav: (item) => handleGlobalSearchEnvironmentNavigation(item),
      getName: (item) => item.title,
      getPath: (item) => "",
    },
    flows: {
      items: filteredTestflows,
      title: searchQuery === "" ? "Recent Test Flows" : "Test Flows",
      shortcutKeys: [osKeyName, "Shift", "T"],
      icon: FlowIcon,
      nav: (item) => handleGlobalSearchTestflowNavgation(item),
      getName: (item) => item.name,
      getPath: (item) => item.description || "",
    },
  };

  $: recentSections = [
    {
      key: "requests",
      condition: filteredRequest && filteredRequest.length,
      items: filteredRequest ? filteredRequest.slice(0, 3) : [],
    },
    {
      key: "collections",
      condition: filteredCollection && filteredCollection[0],
      items: filteredCollection ? [filteredCollection[0]] : [],
    },
    {
      key: "environments",
      condition: filteredEnvironments && filteredEnvironments[0],
      items: filteredEnvironments ? [filteredEnvironments[0]] : [],
    },
    {
      key: "folders",
      condition: filteredFolder && filteredFolder[0],
      items: filteredFolder ? [filteredFolder[0]] : [],
    },
    {
      key: "workspaces",
      condition: filteredWorkspaces && filteredWorkspaces[0],
      items: filteredWorkspaces ? [filteredWorkspaces[0]] : [],
    },
    {
      key: "flows",
      condition: filteredTestflows && filteredTestflows.length,
      items: filteredTestflows ? filteredTestflows.slice(0, 1) : [],
    },
  ];

  $: searchSections = [
    {
      key: "requests",
      condition: filteredRequest && filteredRequest.length,
      items: filteredRequest || [],
    },
    {
      key: "collections",
      condition: filteredCollection && filteredCollection.length,
      items: filteredCollection || [],
    },
    {
      key: "folders",
      condition: filteredFolder && filteredFolder.length,
      items: filteredFolder || [],
    },
    {
      key: "environments",
      condition: filteredEnvironments && filteredEnvironments.length,
      items: filteredEnvironments || [],
    },
    {
      key: "flows",
      condition: filteredTestflows && filteredTestflows.length,
      items: filteredTestflows || [],
    },
    {
      key: "workspaces",
      condition: filteredWorkspaces && filteredWorkspaces.length,
      items: filteredWorkspaces || [],
    },
  ];

  $: config =
    selectedType !== "" ? selectedTypeMapping[selectedType.toLowerCase()] : [];
</script>

<div class="recent-items-container">
  {#if selectedType === ""}
    {#if searchQuery === ""}
      {#each recentSections as section (section.key)}
        {#if section.condition}
          <TitleBar data={selectedTypeMapping[section.key]} />
          {#each section.items as item}
            {#if section.key === "requests"}
              {#if !(isWebApp && item.tree.request.method === "GRAPHQL")}
                {@const details = getRequestDetails(item)}
                <ItemBar
                  data={{
                    name: details.name,
                    path: item.path,
                    url: details.url,
                  }}
                  icon={methodIcons[details.method] || GraphIcon}
                  iconProps={{
                    width: "16px",
                    height: "16px",
                    color: methodIconsProps[details.method],
                  }}
                  onClick={() => {
                    handleGlobalSearchRequestNavigation(
                      item.tree.id,
                      item.workspaceId,
                      item.collectionId,
                      item.folderDetails?.id || "",
                      item.tree,
                    );
                  }}
                />
              {/if}
            {:else if section.key === "collections"}
              <ItemBar
                data={{ name: item.tree.name, path: item.path }}
                icon={CollectionIcongs}
                iconProps={{
                  width: "16px",
                  height: "16px",
                  color: "var(--icon-ds-neutral-200)",
                }}
                onClick={() => {
                  handleGlobalSearchCollectionNavigation(
                    item.workspaceId,
                    item.tree,
                  );
                }}
              />
            {:else if section.key === "environments"}
              <ItemBar
                data={{ name: item.title, path: "" }}
                icon={StackIcon}
                iconProps={{
                  width: "16px",
                  height: "16px",
                  color: "var(--icon-ds-neutral-200)",
                }}
                onClick={() => handleGlobalSearchEnvironmentNavigation(item)}
              />
            {:else if section.key === "folders"}
              <ItemBar
                data={{ name: item.tree.name, path: item.path }}
                icon={FolderIcon}
                iconProps={{
                  width: "16px",
                  height: "16px",
                  color: "var(--icon-ds-neutral-200)",
                }}
                onClick={() =>
                  handleGlobalSearchFolderNavigation(
                    item.workspaceId,
                    item.collectionId,
                    item.tree,
                  )}
              />
            {:else if section.key === "workspaces" && !isGuestUser}
              <ItemBar
                data={{ name: item.name, path: item.team.teamName }}
                icon={WorkspaceIcongs}
                iconProps={{
                  width: "16px",
                  height: "16px",
                  color: "var(--icon-ds-neutral-200)",
                }}
                onClick={() => handleGlobalSearchWorkspaceNavigation(item)}
              />
            {:else if section.key === "flows"}
              <ItemBar
                data={{
                  name: item.name,
                  path: item.description || "",
                }}
                icon={FlowIcon}
                iconProps={{
                  width: "16px",
                  height: "16px",
                  color: "var(--icon-ds-neutral-200)",
                }}
                onClick={() => handleGlobalSearchTestflowNavgation(item)}
              />
            {/if}
          {/each}
        {/if}
      {/each}
    {:else if (filteredRequest && filteredRequest.length) || (filteredCollection && filteredCollection.length) || (filteredFolder && filteredFolder.length) || (filteredEnvironments && filteredEnvironments.length) || (filteredTestflows && filteredTestflows.length) || (filteredWorkspaces && filteredWorkspaces.length)}
      {#each searchSections as section (section.key)}
        {#if section.condition}
          <TitleBar
            data={{
              title: selectedTypeMapping[section.key].title,
              shortcutKeys: selectedTypeMapping[section.key].shortcutKeys,
            }}
          />
          {#each section.items as item}
            {#if section.key === "requests"}
              {#if !(isWebApp && item.tree.request.method === "GRAPHQL")}
                {@const details = getRequestDetails(item)}
                <ItemBar
                  data={{
                    name: details.name,
                    path: item.path,
                    url: details.url,
                  }}
                  icon={methodIcons[details.method] || GraphIcon}
                  iconProps={{
                    width: "16px",
                    height: "16px",
                    color: methodIconsProps[details.method],
                  }}
                  onClick={() =>
                    handleGlobalSearchRequestNavigation(
                      item.tree.id,
                      item.workspaceId,
                      item.collectionId,
                      item.folderDetails?.id || "",
                      item.tree,
                    )}
                />
              {/if}
            {:else if section.key === "collections"}
              <ItemBar
                data={{ name: item.tree.name, path: item.path }}
                icon={CollectionIcongs}
                iconProps={{
                  width: "16px",
                  height: "16px",
                  color: "var(--icon-ds-neutral-200)",
                }}
                onClick={() =>
                  handleGlobalSearchCollectionNavigation(
                    item.workspaceId,
                    item.tree,
                  )}
              />
            {:else if section.key === "folders"}
              <ItemBar
                data={{ name: item.tree.name, path: item.path }}
                icon={FolderIcon}
                iconProps={{
                  width: "16px",
                  height: "16px",
                  color: "var(--icon-ds-neutral-200)",
                }}
                onClick={() =>
                  handleGlobalSearchFolderNavigation(
                    item.workspaceId,
                    item.collectionId,
                    item.tree,
                  )}
              />
            {:else if section.key === "environments"}
              <ItemBar
                data={{ name: item.title, path: "" }}
                icon={StackIcon}
                iconProps={{
                  width: "16px",
                  height: "16px",
                  color: "var(--icon-ds-neutral-200)",
                }}
                onClick={() => handleGlobalSearchEnvironmentNavigation(item)}
              />
            {:else if section.key === "flows"}
              <ItemBar
                data={{
                  name: item.name,
                  path: item.description || "",
                }}
                icon={FlowIcon}
                iconProps={{
                  width: "16px",
                  height: "16px",
                  color: "var(--icon-ds-neutral-200)",
                }}
                onClick={() => handleGlobalSearchTestflowNavgation(item)}
              />
            {:else if section.key === "workspaces" && !isGuestUser}
              <ItemBar
                data={{ name: item.name, path: item.team.teamName }}
                icon={WorkspaceIcongs}
                iconProps={{
                  width: "16px",
                  height: "16px",
                  color: "var(--icon-ds-neutral-200)",
                }}
                onClick={() => handleGlobalSearchWorkspaceNavigation(item)}
              />
            {/if}
          {/each}
        {/if}
      {/each}
    {:else}
      <NoResults {searchQuery} />
    {/if}
  {:else if selectedType !== ""}
    {#if config}
      <TitleBar
        data={{
          title: config.title,
          shortcutKeys: config.shortcutKeys,
        }}
      />

      {#if config.items?.length > 0}
        {#each config.items as item}
          {#if !config.filter || config.filter(item)}
            <ItemBar
              data={{
                name: config.getName(item),
                path: config.getPath(item),
                url: config.getUrl ? config.getUrl(item) : undefined,
              }}
              icon={config.getIcon ? config.getIcon(item) : config.icon}
              iconProps={config.getIconProps
                ? config.getIconProps(item)
                : {
                    color: "var(--text-ds-neutral-300)",
                    width: "16px",
                    height: "16px",
                  }}
              onClick={() => config.nav(item)}
            />
          {/if}
        {/each}
      {:else}
        <NoResults
          {searchQuery}
          type={searchQuery ? "Basic" : "Custom"}
          customText="No results found. Get started by creating one!"
        />
      {/if}
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
</style>
