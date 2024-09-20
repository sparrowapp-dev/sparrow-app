<script lang="ts">
  import { writable } from "svelte/store";
  import {
    SvelteFlow,
    Background,
    type Node,
    type NodeTypes,
  } from "@xyflow/svelte";

  import {
    StartBlock,
    RequestBlock,
    RequestBodyTestFlow,
    RunHistory,
    RequestHeaderTestFlow,
    RequestParameterTestFlow,
    RequestNavigatorTestFlow,
    ResponseErrorScreen,
    ResponseStatus,
    ResponseNavigator,
    ResponseBodyNavigator,
    ResponseBody,
    ResponseHeaders,
  } from "../components";
  import {
    RequestSectionEnum,
    type CollectionDto,
    type Tab,
  } from "@common/types/workspace";

  import "@xyflow/svelte/dist/style.css";
  import { onDestroy, onMount } from "svelte";

  import "@xyflow/svelte/dist/style.css";
  import type { Observable } from "rxjs";
  import type { CollectionDocument } from "@app/database/database";
  import {
    DropButton,
    TableNavbar,
    TableSidebar,
  } from "@workspaces/common/components";
  import { RunIcon } from "@library/icons";
  import { ResponseStatusCode } from "$lib/utils/enums";
  import type {
    TFEdgeHandlerType,
    TFEdgeType,
    TFNodeType,
    TFResponseStateType,
  } from "@common/types/workspace/testflow";
  import type { TFNodeStoreType } from "@workspaces/features/socket-explorer/store/testflow";

  // Declaring props for the component
  export let tab: Observable<Partial<Tab>>;
  export let onUpdateNodes;
  export let onUpdateEdges;
  export let collectionList: Observable<CollectionDocument[]>;
  export let onClickRun;
  export let testflowStore;
  export let toggleHistoryDetails;
  export let toggleHistoryContainer;

  // Writable stores for nodes and edges
  const nodes = writable<Node[]>([]);
  const edges = writable<TFEdgeHandlerType[]>([]);

  // Flag to control whether nodes are draggable
  let isNodesDraggable = false;

  /**
   * Checks if edges exist for the given node ID.
   * @param _id - Node ID to check for connected edges.
   * @returns True if edges exist, otherwise false.
   */
  const checkIfEdgesExist = (_id: string) => {
    let edge: TFEdgeHandlerType[] = [];
    edges.subscribe((value) => {
      edge = value;
    })();
    let response = false;
    edge.forEach((it) => {
      if (it.id.replace("xy-edge__", "").split("-")[0] === _id) {
        response = true;
      }
    });
    return response;
  };

  /**
   * Updates the selected API in a specific node.
   * @param id - Node ID.
   * @param name - Name of the API.
   * @param requestId - Request ID.
   * @param collectionId - Collection ID.
   * @param method - Request method (e.g., GET, POST).
   * @param folderId - Folder ID (optional).
   */
  const updateSelectedAPI = (
    id: string,
    name: string,
    requestId: string,
    collectionId: string,
    method: string,
    folderId?: string,
  ) => {
    nodes.update((_nodes) => {
      const dbNodes = _nodes;
      for (let index = 0; index < dbNodes.length; index++) {
        if (dbNodes[index].id === id) {
          dbNodes[index].data.requestId = requestId;
          dbNodes[index].data.name = name;
          dbNodes[index].data.collectionId = collectionId;
          dbNodes[index].data.method = method;
          dbNodes[index].data.folderId = folderId ?? "";
        }
      }
      return dbNodes;
    });
  };

  /**
   * Finds the next available node ID.
   * @param list - List of existing nodes.
   * @returns The next available node ID as a string.
   */
  const findNextNodeId = (list: { id: string }[]): string => {
    const isNameAvailable: (proposedName: string) => boolean = (
      proposedName,
    ) => {
      return list.some((element) => {
        return element.id === proposedName;
      });
    };

    for (let i = 1; i < list.length + 10; i++) {
      const proposedName: string = `${i}`;
      if (!isNameAvailable(proposedName)) {
        return proposedName;
      }
    }
    return "";
  };
  // List to store collection documents and filtered collections
  let collectionListDocument;
  let filteredCollections = writable<CollectionDto[]>([]);
  let isRunDisabled = false;

  // Filter collections based on the current tab's workspace ID
  const collectionsSubscriber = collectionList.subscribe((value) => {
    if (value) {
      collectionListDocument = value;
      collectionListDocument = collectionListDocument?.filter(
        (value) => value.workspaceId === $tab?.path?.workspaceId,
      );
      filteredCollections.set(
        collectionListDocument as unknown as CollectionDto[],
      );
    }
  });

  /**
   * Creates a new node and connects it to the existing node.
   * @param _id - The ID of the existing node.
   */
  const createNewNode = (_id: string) => {
    if (!_id) return;
    if (checkIfEdgesExist(_id)) {
      return;
    }

    const targetNode = findNextNodeId($nodes);

    nodes.update((_nodes: Node[] | any[]) => {
      let nextNodePosition;
      // Find the next node position based on the current node's position
      for (let i = 0; i < _nodes?.length; i++) {
        if (_nodes[i].id === _id) {
          nextNodePosition = {
            x: _nodes[i].position.x + 300,
            y: _nodes[i].position.y,
          };
        }
      }
      return [
        ...(_nodes || []),
        {
          id: targetNode,
          type: "requestBlock",
          data: {
            blocks: nodes,
            connector: edges,
            onClick: function (_id: string) {
              createNewNode(_id);
            },
            onCheckEdges: function (_id: string) {
              return checkIfEdgesExist(_id);
            },
            onUpdateSelectedAPI: function (
              _id: string,
              name: string,
              requestId: string,
              collectionId: string,
              method: string,
              folderId?: string,
            ) {
              updateSelectedAPI(
                _id,
                name,
                requestId,
                collectionId,
                method,
                folderId,
              );
            },
            collections: filteredCollections,
            tabId: $tab.tabId,
          },
          position: nextNodePosition,
          deletable: true,
          draggable: isNodesDraggable,
        },
      ];
    });
    edges.update((edges) => {
      return [
        ...edges,
        {
          id: "xy-edge__" + _id + "-" + targetNode,
          source: _id,
          target: targetNode,
        },
      ];
    });
  };

  /**
   * Initializes nodes and edges on component mount.
   */
  onMount(() => {
    // Load initial nodes from the tab property
    nodes.update((_nodes: Node[]) => {
      const dbNodes = $tab?.property?.testflow?.nodes as TFNodeType[];
      let res = [];
      for (let i = 0; i < dbNodes.length; i++) {
        res.push({
          id: dbNodes[i].id,
          type: dbNodes[i].type,
          data: {
            blocks: nodes,
            connector: edges,
            onClick: function (_id: string) {
              createNewNode(_id);
            },
            onCheckEdges: function (_id: string) {
              return checkIfEdgesExist(_id);
            },
            onUpdateSelectedAPI: function (
              _id: string,
              name: string,
              requestId: string,
              collectionId: string,
              method: string,
              folderId?: string,
            ) {
              updateSelectedAPI(
                _id,
                name,
                requestId,
                collectionId,
                method,
                folderId,
              );
            },
            name: dbNodes[i].data?.name,
            method: dbNodes[i].data?.method,
            collectionId: dbNodes[i].data?.collectionId,
            requestId: dbNodes[i].data?.requestId,
            folderId: dbNodes[i].data?.folderId,
            collections: filteredCollections,
            tabId: $tab.tabId,
          },
          position: {
            x: dbNodes[i].position.x,
            y: dbNodes[i].position.y,
          },
          deletable: dbNodes[i].id === "1" ? false : true,
          draggable: isNodesDraggable,
        });
      }
      return res;
    });
    edges.update((_edges: TFEdgeHandlerType[]) => {
      const dbEdges = $tab?.property?.testflow?.edges as TFEdgeType[];
      let res = [];
      for (let i = 0; i < dbEdges.length; i++) {
        res.push({
          id: dbEdges[i].id,
          source: dbEdges[i].source,
          target: dbEdges[i].target,
        });
      }
      return res;
    });
  });

  let selectedNode: TFNodeStoreType | undefined;

  // Reactive statement to handle selected node updates
  $: {
    if (testflowStore || selectedNodeId) {
      let isIdExist = false;
      testflowStore?.nodes?.forEach((element: TFNodeStoreType) => {
        if (element.id === selectedNodeId) {
          selectedNode = element;
          responseState.responseBodyLanguage = selectedNode.response
            .responseContentType as string;
          responseState.responseBodyFormatter = "Pretty";
          isIdExist = true;
        }
      });
      if (!isIdExist) {
        selectedNode = undefined;
      }
    }
  }

  /**
   * The node types used in the SvelteFlow graph.
   */
  const nodeTypes = {
    startBlock: StartBlock,
    requestBlock: RequestBlock,
  } as unknown as NodeTypes;
  let nodesValue = 1;

  let selectedNodeId = "0";

  /**
   * Checks if a response exists for a given node ID.
   * @param id - The ID of the node to check.
   * @returns - True if the response exists, false otherwise.
   */
  const checkIfResponseExist = (id: string) => {
    let result = false;
    testflowStore?.nodes?.forEach((element: TFNodeStoreType) => {
      if (element.id === id) {
        result = true;
      }
    });
    return result;
  };

  // Subscribe to changes in the nodes
  const nodesSubscriber = nodes.subscribe((val: Node[]) => {
    if (val && val.length) onUpdateNodes(val);
    nodesValue = val.length;
    // Find the node where selected is true
    let selectedNodeTrue = val.find((node: Node) => node.selected === true);

    if (selectedNodeTrue) {
      selectedNodeId = selectedNodeTrue.id;
      // if (selectedNodeTrue.data.requestId) {
      //   if (checkIfResponseExist(selectedNodeTrue.id)) {
      //     selectedNodeId = selectedNodeTrue.id;
      //   }
      // }
    }
  });

  // Subscribe to changes in the edges
  const edgesSubscriber = edges.subscribe((val) => {
    if (val) onUpdateEdges(val);
  });

  let selectedTab = "response";

  let requestNavigation = "Request Body";
  let responseNavigation = "Response";

  /**
   * Updates the active tab inside the Request Body section.
   * @param tab - The tab to update.
   * @returns- The updated request navigation.
   */
  const updateActiveTabInsideRequestBody = (tab: string) => {
    if (tab === "Body") {
      requestNavigation = "Request Body";
    } else if (tab === "Headers") {
      requestNavigation = "Headers";
    } else {
      requestNavigation = "Parameters";
    }

    return requestNavigation;
  };

  /**
   * Updates the navigation inside the Response section.
   * @param tab - The tab to update.
   * @returns - The updated response navigation.
   */
  function updateResponseNavigation(tab: string) {
    if (tab === "Response") {
      responseNavigation = "Response";
    } else if (tab === "Headers") {
      responseNavigation = "Headers";
    }
    return responseNavigation;
  }

  // API response UI states
  let responseState: TFResponseStateType = {
    responseBodyLanguage: "",
    responseBodyFormatter: "",
  };

  /**
   * Updates the response state with partial changes.
   * @param _state - The partial state to update.
   */
  const onUpdateRequestState = async (_state: Partial<TFResponseStateType>) => {
    responseState = {
      ...responseState,
      ..._state,
    };
  };

  onDestroy(() => {
    collectionsSubscriber.unsubscribe();
    nodesSubscriber();
    edgesSubscriber();
  });
</script>

<div class="h-100 position-relative">
  <div
    class="d-flex justify-content-between position-absolute p-3"
    style="top:0;
  right:0;
  z-index:100;"
  >
    <div>
      <!-- INSERT NAME COMPONENT HERE -->
    </div>
    <div class="d-flex">
      <div style="margin-right: 5px;">
        {#if nodesValue > 1}
          <DropButton
            title="Run"
            type="default"
            iconRequired={true}
            icon={RunIcon}
            iconHeight={"14px"}
            iconWidth={"14px"}
            style="height: 36px;"
            disable={isRunDisabled}
            iconColor={"var(--icon-secondary-100)"}
            onClick={async () => {
              selectedNodeId = "0";
              isRunDisabled = true;
              await onClickRun();
              isRunDisabled = false;
            }}
          />
        {/if}
      </div>
      <div>
        <!-- INSERT SAVE COMPONENT HERE -->
      </div>
      <div class="position-relative">
        <RunHistory
          {testflowStore}
          testflowName={$tab?.name}
          {toggleHistoryDetails}
          {toggleHistoryContainer}
        />
      </div>
    </div>
  </div>
  <SvelteFlow {nodes} {edges} {nodeTypes}>
    <Background
      bgColor={"var(--bg-secondary-850)"}
      patternColor={"var(--bg-secondary-500)"}
      size={4}
      gap={20}
    />
  </SvelteFlow>

  {#if testflowStore?.nodes?.length >= 1 && selectedNode}
    <div class="request-container" style="">
      <div
        class="rounded-2"
        style="background-color:var(--bg-secondary-850); border:1px solid var(--border-tertiary-300);  margin:10px; margin-top:15px; height:268px;"
      >
        <!-- Request Response Nav -->
        <TableNavbar {selectedNode} />

        <!-- Request Respone Body -->
        <div
          class="d-flex justify-content-between m-1"
          style="max-height: 268px;"
        >
          <!-- Sidebar -->
          <TableSidebar {selectedNode} bind:selectedTab />

          <!-- Request Data -->
          <div class="request-rhs-container">
            {#if selectedTab === "response"}
              <div class="p-2" style="">
                <div
                  class="d-flex flex-column h-100 pt-1"
                  style="overflow:auto;"
                >
                  <div class="h-100 d-flex flex-column">
                    <div style="flex:1; overflow:auto;">
                      {#if selectedNode?.response?.status === ResponseStatusCode.ERROR}
                        <ResponseErrorScreen />
                      {:else if selectedNode?.response?.status}
                        <div class="h-100 d-flex flex-column">
                          <ResponseStatus response={selectedNode?.response} />
                          <ResponseNavigator
                            requestStateSection={responseNavigation}
                            {updateResponseNavigation}
                            responseHeadersLength={selectedNode?.response
                              ?.headers?.length || 0}
                          />
                          {#if responseNavigation === "Response"}
                            {#if responseState?.responseBodyLanguage !== "Image"}
                              <ResponseBodyNavigator
                                response={selectedNode?.response}
                                apiState={responseState}
                                {onUpdateRequestState}
                                onClearResponse={() => {}}
                              />
                            {/if}
                            <div style="flex:1; overflow:auto;">
                              <ResponseBody
                                response={selectedNode?.response}
                                apiState={responseState}
                              />
                            </div>
                          {:else if responseNavigation === "Headers"}
                            <div style="flex:1; overflow:auto;">
                              <ResponseHeaders
                                responseHeader={selectedNode?.response.headers}
                              />
                            </div>
                          {/if}
                        </div>
                      {/if}
                    </div>
                  </div>
                </div>
              </div>
            {:else}
              <div class="p-2" style="">
                <RequestNavigatorTestFlow
                  paramsLength={selectedNode?.request?.property?.request
                    ?.queryParams?.length || 0}
                  headersLength={selectedNode?.request?.property?.request
                    ?.headers?.length || 0}
                  autoGeneratedHeadersLength={selectedNode?.request?.property
                    ?.request?.autoGeneratedHeaders?.length || 0}
                  {updateActiveTabInsideRequestBody}
                  bind:requestNavigation
                />

                <div style="flex:1; overflow:auto;" class="p-0 w-100">
                  {#if requestNavigation === RequestSectionEnum.REQUEST_BODY}
                    <RequestBodyTestFlow
                      body={selectedNode?.request?.property?.request?.body}
                      method={selectedNode?.request?.property?.request?.method}
                      requestState={selectedNode?.request?.property?.request
                        ?.state}
                    />
                  {:else if requestNavigation === RequestSectionEnum.PARAMETERS}
                    <RequestParameterTestFlow
                      params={selectedNode?.request?.property?.request
                        ?.queryParams}
                      authParameter={{}}
                      isBulkEditActive={false}
                      onUpdateRequestState={() => {}}
                      environmentVariables={[]}
                    />
                  {:else if requestNavigation === RequestSectionEnum.HEADERS}
                    <RequestHeaderTestFlow
                      headers={selectedNode?.request?.property?.request
                        ?.headers}
                      autoGeneratedHeaders={selectedNode?.request?.property
                        ?.request?.autoGeneratedHeaders}
                      authHeader={{}}
                      environmentVariables={[]}
                      onHeadersChange={() => {}}
                      isBulkEditActive={false}
                      onUpdateRequestState={() => {}}
                    />
                  {/if}
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  :global(.svelte-flow__attribution) {
    display: none;
  }

  .request-rhs-container {
    height: 224px;
    overflow: auto;
    width: calc(100% - 190px);
  }

  .request-container {
    position: absolute;
    bottom: 0px;
    background-color: var(--bg-secondary-800);
    width: 100%;
  }
</style>
