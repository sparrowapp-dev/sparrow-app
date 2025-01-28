<script lang="ts">
  import { onMount } from "svelte";
  import { RxDB } from "../../../../../../apps/@sparrow-desktop/src/database/database";
  import folderIcon from "../../../../static/folderIcon.png";
  import environmentIcon from "../../../../static/envLayer.png";
  import collectionIcon from "../../../../static/collectionStack.png";
  import workspaceIcon from "../../../../static/workspaceBoard.png";
  import { WorkspaceRepository } from "../../../../../../apps/@sparrow-desktop/src/repositories/workspace.repository";
  import { EnvironmentRepository } from "../../../../../../apps/@sparrow-desktop/src/repositories/environment.repository";
  import { TabRepository } from "../../../../../../apps/@sparrow-desktop/src/repositories/tab.repository";
  import keyCommand from "../../../../static/keyCommand.png";
  import { InitTab } from "@sparrow/common/factory";
  import { moveNavigation } from "@sparrow/common/utils";
  import getIcon from "../../../../static/getIcon.png";
  import hexIcon from "../../../../static/iconHex.png";
  import postIcon from "../../../../static/Post.png";
  import deleteIcon from "../../../../static/Delete.png";
  import putIcon from "../../../../static/Put.png";
  import patchIcon from "../../../../static/Patch.png";
  import socketIoIcon from "../../../../static/socketio.png";
  import webSocketIcon from "../../../../static/WebSocket.png";
  import flowIcon from "../../../../static/flowIcon.png";
  import {
    InitRequestTab,
    InitWebSocketTab,
    InitCollectionTab,
    InitFolderTab,
    InitTestflowTab,
    InitEnvironmentTab,
    InitWorkspaceTab,
    InitGraphqlTab,
  } from "@sparrow/common/utils";
  import { TestflowRepository } from "../../../../../../apps/@sparrow-desktop/src/repositories/testflow.repository";
  import {
    GraphqlTabAdapter,
    SocketIoTabAdapter,
  } from "../../../../../../apps/@sparrow-desktop/src/adapter";
  import { SocketTabAdapter } from "../../../../../../apps/@sparrow-desktop/src/adapter/socket-tab";
  import { RequestTabAdapter } from "../../../../../../apps/@sparrow-desktop/src/adapter/request-tab";

  import Modal from "./Modal.svelte";
  import type {
    CollectionDocument,
    EnvironmentDocument,
    WorkspaceDocument,
  } from "@app/database/database";
  import { filter } from "rxjs";
  import NoResults from "./NoResults.svelte";

  export let searchQuery = "";
  export let filteredCollection = [];
  export let filteredFolder = [];
  export let filteredRequest;
  export let selectedType = "";
  export let onApiClick = () => {};
  export let closeGlobalSearch;
  export let handlehideGlobalSearch;
  export let recentEnvironment: RecentItem | null = null;
  export let recentWorkspace: RecentItem | null = null;
  export let workspaceDetailsMap: Record<
    string,
    { teamName: string; workspaceName: string }
  > = {};

  let workspaceRepository = new WorkspaceRepository();
  let environmentRepository = new EnvironmentRepository();
  let tabRepository = new TabRepository();
  let testflowRepository = new TestflowRepository();
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
  $: console.log("the sleected type", selectedType);
  $: console.log("The search query: recnet ", searchQuery);
  $: console.log("filteredCollection is recent ", filteredCollection);
  $: console.log("filteredFolder s\is", filteredFolder);
  $: console.log("filteredRequest is", filteredRequest);
  $: console.log("filteredWorkspace is curr", filteredWorkspaces);
  $: console.log("filteredEnvironment is", filteredEnvironments);

  $: {
    updateWorkspaces(searchQuery);
    updateEnvironments(searchQuery);
    updateTestflows(searchQuery);
  }

  async function updateWorkspaces(query: string) {
    try {
      const workspaces = await workspaceRepository.searchWorkspaces(query);
      filteredWorkspaces = workspaces.map((workspace) => workspace._data);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      filteredWorkspaces = [];
    }
  }

  async function updateEnvironments(query: string) {
    try {
      const environments: EnvironmentDocument[] =
        await environmentRepository.searchEnvironments(query);
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
  }
  async function updateTestflows(query: string) {
    try {
      const testflows = await testflowRepository.searchTestflows(query);
      filteredTestflows = testflows.map((testflow) => testflow._data);
    } catch (error) {
      console.error("Error fetching testflows:", error);
      filteredTestflows = [];
    }
  }

  const handleOpenTestflow = async (testflow: any) => {
    try {
      const isActiveWorkspace = await workspaceRepository.checkActiveWorkspace(
        testflow.workspaceId,
      );

      if (!isActiveWorkspace) {
        const shouldContinue = await new Promise<boolean>((resolve) => {
          const modalContainer = document.createElement("div");
          document.body.appendChild(modalContainer);

          new Modal({
            target: modalContainer,
            props: {
              workspaceName: workspaceDetailsMap[testflow.workspaceId].workspaceName,
              onCancel: () => {
                modalContainer.remove();
                resolve(false);
              },
              onContinue: () => {
                modalContainer.remove();
                resolve(true);
              },
            },
          });
        });

        if (!shouldContinue) return;
        await workspaceRepository.setActiveWorkspace(testflow.workspaceId);
      }

      const existingTab = await tabRepository.getTabById(testflow._id);
      if (existingTab?._data?.isActive) {
        await tabRepository.activeTab(testflow._id, testflow.workspaceId);
        closeGlobalSearch();
        return;
      }

      const path = {
        workspaceId: testflow.workspaceId,
        testflowId: testflow._id,
        collectionId: testflow.collectionId || "",
        folderId: testflow.folderId || "",
      };

      const tab = new InitTestflowTab(testflow._id, testflow.workspaceId);
      tab.updateName(testflow.name);
      tab.updateDescription(testflow.description || "");
      tab.updatePath(path);
      tab.setNodes(testflow.nodes);
      tab.setEdges(testflow.edges);
      tab.updateIsSave(true);

      tabRepository.createTab(tab.getValue());
      moveNavigation("right");
      closeGlobalSearch();
    } catch (error) {
      console.error("Error opening testflow:", error);
    }
  };

  const handleGlobalSearchApiNavigation = async (
    apiId: string,
    workspaceId: string,
    collectionId: string,
    folderId: string,
    tree: any,
  ): Promise<void> => {
    try {
      const isActiveWorkspace =
        await workspaceRepository.checkActiveWorkspace(workspaceId);

      if (!isActiveWorkspace) {
        handlehideGlobalSearch(true);
        console.log(`Workspace ${workspaceId} is not active.`);

        const shouldContinue = await new Promise<boolean>((resolve) => {
          const modalContainer = document.createElement("div");
          document.body.appendChild(modalContainer);

          new Modal({
            target: modalContainer,
            props: {
              collectionName: "Request",
              workspaceName:  workspaceDetailsMap[workspaceId].workspaceName,
              onCancel: () => {
                modalContainer.remove();
                resolve(false);
                handlehideGlobalSearch(false);
              },
              onContinue: () => {
                modalContainer.remove();
                resolve(true);
                closeGlobalSearch();
              },
            },
          });
        });

        if (!shouldContinue) return;
        await workspaceRepository.setActiveWorkspace(workspaceId);
      }

      const existingTab = await tabRepository.getTabById(apiId);
      if (existingTab?._data?.isActive) {
        await tabRepository.activeTab(apiId, workspaceId);
        closeGlobalSearch();
        handlehideGlobalSearch(false);
        return;
      }

      const expectedPath = {
        folderId: folderId || "",
        folderName: tree?.folderDetails?.name || "",
        collectionId: collectionId || "",
        workspaceId: workspaceId || "",
      };

      switch (tree.type) {
        case "GRAPHQL": {
          const graphqlTabAdapter = new GraphqlTabAdapter();
          const adaptedGraphql = graphqlTabAdapter.adapt(
            workspaceId,
            collectionId,
            folderId,
            tree,
          );
          await tabRepository.createTab(adaptedGraphql);
          break;
        }
        case "WEBSOCKET": {
          const socketTabAdapter = new SocketTabAdapter();
          const adaptedSocket = socketTabAdapter.adapt(
            workspaceId,
            collectionId,
            folderId,
            tree,
          );
          await tabRepository.createTab(adaptedSocket);
          break;
        }
        case "SOCKETIO": {
          const socketIoTabAdapter = new SocketIoTabAdapter();
          const adaptedSocketIo = socketIoTabAdapter.adapt(
            workspaceId,
            collectionId,
            folderId,
            tree,
          );
          await tabRepository.createTab(adaptedSocketIo);
          break;
        }
        default: {
          console.log("the tree is", tree);
          console.log("the tree type is", collectionId);
          console.log("the FOLDERiD is", folderId);
          console.log("the WORKSPACE IDe is", workspaceId);

          const requestTabAdapter = new RequestTabAdapter();
          const adaptedRequest = requestTabAdapter.adapt(
            workspaceId,
            collectionId,
            folderId,
            tree,
          );
          await tabRepository.createTab(adaptedRequest);
        }
      }

      moveNavigation("right");
      closeGlobalSearch();
      handlehideGlobalSearch(false);
    } catch (error) {
      console.error("Error in global search API navigation:", error);
      closeGlobalSearch();
      handlehideGlobalSearch(false);
      throw error;
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
  $: console.log("filtered dlows", filteredTestflows);

  const handleOpenCollection = async (workspaceId: string, collection: any) => {
    try {
      const isActiveWorkspace =
        await workspaceRepository.checkActiveWorkspace(workspaceId);

      if (!isActiveWorkspace) {
        const shouldContinue = await new Promise<boolean>((resolve) => {
          const modalContainer = document.createElement("div");
          handlehideGlobalSearch(true);
          document.body.appendChild(modalContainer);

          new Modal({
            target: modalContainer,
            props: {
              workspaceName: workspaceDetailsMap[workspaceId].workspaceName,
              onCancel: () => {
                modalContainer.remove();
                resolve(false);
                handlehideGlobalSearch(false);
              },
              onContinue: () => {
                modalContainer.remove();
                resolve(true);
                closeGlobalSearch();
              },
            },
          });
        });

        if (!shouldContinue) return;

        // First set the active workspace and wait for it to complete
        await workspaceRepository.setActiveWorkspace(workspaceId);

        // Add a small delay to ensure workspace state is fully updated
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Verify workspace was actually changed
        const workspaceChanged =
          await workspaceRepository.checkActiveWorkspace(workspaceId);
        if (!workspaceChanged) {
          throw new Error("Failed to change workspace");
        }
      }

      // Calculate collection stats
      let totalFolder = 0;
      let totalRequest = 0;

      if (collection.items) {
        collection.items.forEach((item: any) => {
          if (
            item.type === "REQUEST" ||
            item.type === "GRAPHQL" ||
            item.type === "SOCKETIO" ||
            item.type === "WEBSOCKET"
          ) {
            totalRequest++;
          } else {
            totalFolder++;
            totalRequest += item?.items?.length || 0;
          }
        });
      }

      const path = {
        workspaceId: workspaceId,
        collectionId: collection.id || "",
        folderId: "",
      };

      const _collection = new InitCollectionTab(collection.id, workspaceId);
      _collection.updateName(collection.name);
      _collection.updateDescription(collection.description);
      _collection.updatePath(path);
      _collection.updateTotalRequests(totalRequest);
      _collection.updateTotalFolder(totalFolder);
      _collection.updateIsSave(true);

      // Create the tab with the new collection
      await tabRepository.createTab(_collection.getValue());

      // Update UI
      moveNavigation("right");
      closeGlobalSearch();
      handlehideGlobalSearch(false);

      // Add success notification
      notifications.success(
        `Collection "${collection.name}" opened successfully.`,
      );
    } catch (error) {
      console.error("Error opening collection:", error);
      notifications.error("Failed to open collection.");
      throw error; // Re-throw to handle at higher level if needed
    }
  };

  const handleOpenFolder = async (
    workspaceId: string,
    collectionId: any,
    folder: any,
  ) => {
    try {
      const isActiveWorkspace =
        await workspaceRepository.checkActiveWorkspace(workspaceId);

      if (!isActiveWorkspace) {
        const shouldContinue = await new Promise<boolean>((resolve) => {
          const modalContainer = document.createElement("div");
          handlehideGlobalSearch(true);
          document.body.appendChild(modalContainer);

          new Modal({
            target: modalContainer,
            props: {
              workspaceName: workspaceDetailsMap[workspaceId].workspaceName,
              onCancel: () => {
                modalContainer.remove();
                handlehideGlobalSearch(false);
                resolve(false);
              },
              onContinue: () => {
                modalContainer.remove();
                resolve(true);
              },
            },
          });
        });

        if (!shouldContinue) return;

        await workspaceRepository.setActiveWorkspace(workspaceId);
        await new Promise((resolve) => setTimeout(resolve, 100));

        const workspaceChanged =
          await workspaceRepository.checkActiveWorkspace(workspaceId);
        if (!workspaceChanged) {
          throw new Error("Failed to change workspace");
        }
      }

      console.log("Opening folder:", folder);
      const path = {
        workspaceId: workspaceId,
        collectionId: collectionId || "",
        folderId: folder.id,
        folderName: folder.name,
      };

      const sampleFolder = new InitFolderTab(folder.id, workspaceId);
      sampleFolder.updateName(folder.name);
      sampleFolder.updatePath(path);
      sampleFolder.updateIsSave(true);
      

      await tabRepository.createTab(sampleFolder.getValue());
      moveNavigation("right");
      closeGlobalSearch();
      handlehideGlobalSearch(false);
      notifications.success(`Folder "${folder.name}" opened successfully.`);
    } catch (error) {
      console.error("Error opening folder:", error);
      notifications.error("Failed to open folder.");
      throw error;
    }
  };

  const handleOpenWorkspace = async (workspace: any) => {
    try {
      console.log("Opening workspace:", workspace);
      const isActiveWorkspace = await workspaceRepository.checkActiveWorkspace(
        workspace._id,
      );

      if (!isActiveWorkspace) {
        const shouldContinue = await new Promise<boolean>((resolve) => {
          const modalContainer = document.createElement("div");
          document.body.appendChild(modalContainer);
          handlehideGlobalSearch(true);

          new Modal({
            target: modalContainer,
            props: {
              workspaceName: workspaceDetailsMap[workspace._id].workspaceName,
              onCancel: () => {
                modalContainer.remove();
                resolve(false);
                handlehideGlobalSearch(false);
              },
              onContinue: () => {
                modalContainer.remove();
                resolve(true);
              },
            },
          });
        });

        if (!shouldContinue) return;

        // Create new tab for the workspace
        const initWorkspaceTab = new InitWorkspaceTab(
          workspace._id,
          workspace._id,
        );
        initWorkspaceTab.updateName(workspace.name);

        // Create tab and set active workspace
        await tabRepository.createTab(
          initWorkspaceTab.getValue(),
          workspace._id,
        );
        await workspaceRepository.setActiveWorkspace(workspace._id);
        closeGlobalSearch();
        handlehideGlobalSearch(false);
        // Navigate and show success notification
        navigate("collections");
        notifications.success(
          `Workspace "${workspace.name}" opened successfully.`,
        );
      }

      // Additional workspace opening logic here if needed
      closeGlobalSearch();
      handlehideGlobalSearch(false);
    } catch (error) {
      closeGlobalSearch();
      console.error("Error opening workspace:", error);
      notifications.error("Failed to open workspace.");
    }
  };

  const handleOpenEnvironment = async (environment: any) => {
    try {
      const isActiveWorkspace = await workspaceRepository.checkActiveWorkspace(
        environment.workspace,
      );

      if (!isActiveWorkspace) {
        const shouldContinue = await new Promise<boolean>((resolve) => {
          const modalContainer = document.createElement("div");
          document.body.appendChild(modalContainer);
          handlehideGlobalSearch(true);

          new Modal({
            target: modalContainer,
            props: {
              workspaceName: workspaceDetailsMap[environment.workspace].workspaceName,
              onCancel: () => {
                modalContainer.remove();
                resolve(false);
                handlehideGlobalSearch(false);
              },
              onContinue: () => {
                modalContainer.remove();
                resolve(true);
              },
            },
          });
        });

        if (!shouldContinue) return;

        await workspaceRepository.setActiveWorkspace(environment.workspace);
        await new Promise((resolve) => setTimeout(resolve, 100));

        const workspaceChanged = await workspaceRepository.checkActiveWorkspace(
          environment.workspace,
        );
        if (!workspaceChanged) {
          throw new Error("Failed to change workspace");
        }
      }

      const initEnvironmentTab = new InitEnvironmentTab(
        environment.id,
        environment.workspace,
      );

      initEnvironmentTab.setName(environment.title);
      initEnvironmentTab.setVariable(environment?.variable);

      await tabRepository.createTab(initEnvironmentTab.getValue());
      closeGlobalSearch();
      handlehideGlobalSearch(false);
      notifications.success(
        `Environment "${environment.title}" opened successfully.`,
      );
    } catch (error) {
      console.error("Error opening environment:", error);
      notifications.error("Failed to open environment.");
      throw error;
    }
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
      filteredWorkspaces = await workspaceRepository.getRecentWorkspaces();
      filteredWorkspaces = filteredWorkspaces.map(
        (workspace) => workspace._data,
      );
      console.log("filteredWorkspaces", filteredWorkspaces);

      const recentTestflows = await testflowRepository.getRecentTestflows();
      filteredTestflows = recentTestflows.map((testflow) => testflow._data);

      const recentEnvironments =
        await environmentRepository.getRecentEnvironments();
    } catch (error) {
      console.error("Error fetching recent workspaces:", error);
    }
  });
</script>

<div class="recent-items-container">
  {#if selectedType == ""}
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
                handleGlobalSearchApiNavigation(
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
            handleOpenCollection(
              filteredCollection[0].workspaceId,
              filteredCollection[0].tree,
            )}
        >
          <div class="request-method">
            <img src={collectionIcon} alt="" class="other-icon" />
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
          on:click={() => handleOpenEnvironment(filteredEnvironments[0])}
        >
          <div class="request-method">
            <img src={environmentIcon} alt="" class="other-icon" />
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
            handleOpenFolder(
              filteredFolder[0].workspaceId,
              filteredFolder[0].collectionId,
              filteredFolder[0].tree,
            )}
        >
          <div class="request-method">
            <img src={folderIcon} alt="" class="other-icon" />
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
          on:click={() => handleOpenWorkspace(filteredWorkspaces[0])}
        >
          <div class="request-method">
            <img src={workspaceIcon} alt="" class="other-icon" />
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
  {:else if selectedType.toLowerCase() == "workspaces"}
    {#if filteredWorkspaces.length > 0}
      <div class="section-header">
        <span class="section-title">Recent Workspaces</span>
        <div class="keyboard-shortcut">
          <div class="shortcut-key">
            <img
              src={keyCommand}
              alt=""
              class="shortcut-icon"
            />
          </div>
          <span class="key">Shift</span>
          <span class="key">W</span>
        </div>
      </div>
      {#each filteredWorkspaces as workspace}
        <div
          class="request-item"
          on:click={() => handleOpenWorkspace(workspace)}
        >
          <div class="request-method">
            <img src={workspaceIcon} alt="" class="other-icon" />
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
            <img
              src={keyCommand}
              alt=""
              class="shortcut-icon"
            />
          </div>
          <span class="key">Shift</span>
          <span class="key">F</span>
        </div>
      </div>
      {#each filteredFolder as folder}
        <div
          class="request-item"
          on:click={() =>
            handleOpenFolder(
              folder.workspaceId,
              folder.collectionId,
              folder.tree,
            )}
        >
          <div class="request-method">
            <img src={folderIcon} alt="" class="other-icon" />
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
      <NoResults {searchQuery} />
    {/if}

    <!-- Content for folders -->
  {:else if selectedType.toLowerCase() == "collections"}
    {#if filteredCollection.length > 0}
      <div class="section-header">
        <span class="section-title">Recent Collection</span>
        <div class="keyboard-shortcut">
          <div class="shortcut-key">
            <img
              src={keyCommand}
              alt=""
              class="shortcut-icon"
            />
          </div>
          <span class="key">Shift</span>
          <span class="key">C</span>
        </div>
      </div>
      {#each filteredCollection as collection}
        <div
          class="request-item"
          on:click={() =>
            handleOpenCollection(collection.workspaceId, collection.tree)}
        >
          <div class="request-method">
            <img src={collectionIcon} alt="" class="other-icon" />
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
      <NoResults {searchQuery} />
    {/if}
  {:else if selectedType.toLowerCase() == "requests"}
    {#if filteredRequest.length > 0}
      <div class="section-header">
        <span class="section-title">Recent Requests</span>
        <div class="keyboard-shortcut">
          <div class="shortcut-key">
            <img
              src={keyCommand}
              alt=""
              class="shortcut-icon"
            />
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
              handleGlobalSearchApiNavigation(
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
            <img
              src={keyCommand}
              alt=""
              class="shortcut-icon"
            />
          </div>
          <span class="key">Shift</span>
          <span class="key">E</span>
        </div>
      </div>
      {#each filteredEnvironments as environment}
        <div
          class="request-item"
          on:click={() => handleOpenEnvironment(environment)}
        >
          <div class="request-method">
            <img src={environmentIcon} alt="" class="other-icon" />
          </div>
          <div class="request-details">
            <div class="request-header">
              <span class="request-title">{environment.title}</span>
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
        <div class="request-item" on:click={() => handleOpenTestflow(testflow)}>
          <div class="request-method">
            <img src={flowIcon} alt="" class="other-icon" />
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
    color: var(--Neutral-500, #62656a);
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
    background-color: #181c26;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 4px;
  }

  .key {
    border-radius: 4px;
    background-color: #181c26;
    color: var(--Neutral-100, #b6b7b9);
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
    background-color: #222630;
  }

  .request-item:hover .request-title {
    color: var(--Neutral-300, #ffffff);
  }

  .request-item:hover .request-path {
    color: var(--Neutral-300, #9b9da1);
  }

  .request-item:hover .request-url {
    color: var(--Blue-300, #6894f9);
  }

  .request-method {
    border-radius: 2px;
    background-color: rgba(29, 33, 43, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    padding: 4px;
    min-height: 24px;
    gap: 8px;
  }

  .method-label {
    color: rgba(105, 214, 150, 1);
    font:
      700 12px Roboto,
      sans-serif;
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
    color: var(--Neutral-300, #9b9da1);
    font:
      400 12px Inter,
      sans-serif;
  }

  .request-path {
    color: var(--Neutral-500, #62656a);
    font:
      400 12px Inter,
      sans-serif;
  }

  .request-url {
    color: var(--Blue-300, #6894f9);
    font:
      400 12px Inter,
      sans-serif;
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
</style>
