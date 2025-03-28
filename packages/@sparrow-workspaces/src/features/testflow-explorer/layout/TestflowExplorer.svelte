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
    TestFlowName,
    SaveTestflow,
  } from "../components";
  import {
    RequestSectionEnum,
    type CollectionDto,
  } from "@sparrow/common/types/workspace";
  import { type Tab } from "@sparrow/common/types/workspace/tab";

  import "@xyflow/svelte/dist/style.css";
  import { onDestroy, onMount } from "svelte";

  import "@xyflow/svelte/dist/style.css";
  import type { Observable } from "rxjs";
  import type { CollectionDocument } from "@app/database/database";
  import {
    DropButton,
    TableNavbar,
    TableSidebar,
    TestFlowTourGuide,
  } from "@sparrow/workspaces/components";
  import { RunIcon } from "@sparrow/library/icons";
  import { Modal } from "@sparrow/library/ui";
  import DeleteNode from "../../../components/delete-node/DeleteNode.svelte";
  import { ResponseStatusCode } from "@sparrow/common/enums";
  import type {
    TFDataStoreType,
    TFEdgeHandlerType,
    TFEdgeType,
    TFNodeHandlerType,
    TFNodeStoreType,
    TFNodeType,
    TFResponseStateType,
  } from "@sparrow/common/types/workspace/testflow";
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Debounce } from "@sparrow/common/utils";

  import {
    currentStep,
    isTestFlowTourGuideOpen,
  } from "../../../stores/guide.tour";
  import { platform } from "@tauri-apps/plugin-os";

  // Declaring props for the component
  export let tab: Observable<Partial<Tab>>;
  export let onUpdateNodes;
  export let onUpdateEdges;
  export let collectionList: Observable<CollectionDocument[]>;
  export let onClickRun;
  export let onRunSampleApi;
  export let testflowStore: TFDataStoreType;
  export let toggleHistoryDetails;
  export let toggleHistoryContainer;
  export let environmentVariables;
  export let isTestflowEditable;
  export let onRedrectRequest;
  export let onUpdateTestFlowName;
  export let onSaveTestflow;
  export let isWebApp;
  export let deleteNodeResponse;

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
  let collectionListDocument: CollectionDocument[];
  let filteredCollections = writable<CollectionDto[]>([]);

  // Sync the nodes with collection data
  const syncNodesWithCollectionList = () => {
    nodes.update((_nodes) => {
      const dbNodes = _nodes;
      for (let index = 0; index < dbNodes.length; index++) {
        if (collectionListDocument) {
          const collection = collectionListDocument.find(
            (col) => col.id === dbNodes[index].data.collectionId,
          );
          if (collection) {
            let request;
            if (
              dbNodes[index].data.folderId &&
              dbNodes[index].data.folderId?.length > 0
            ) {
              const folder = collection.items.find(
                (fol) => fol.id === dbNodes[index].data.folderId,
              );
              if (folder) {
                request = folder.items.find(
                  (req) => req.id === dbNodes[index].data.requestId,
                );
              }
            } else {
              request = collection.items.find(
                (req) => req.id === dbNodes[index].data.requestId,
              );
            }
            dbNodes[index].data.name = request?.name || "";
            dbNodes[index].data.method = request?.request?.method || "";
          }
        }
      }
      return dbNodes;
    });
  };

  // Filter collections based on the current tab's workspace ID
  const collectionsSubscriber = collectionList.subscribe((value) => {
    if (value) {
      collectionListDocument = value?.filter(
        (value) => value.workspaceId === $tab?.path?.workspaceId,
      );
      filteredCollections.set(
        collectionListDocument as unknown as CollectionDto[],
      );
      syncNodesWithCollectionList();
    }
  });

  let limitNodesChange = 0;
  nodes.subscribe((nodes) => {
    if (nodes?.length > 0) {
      if (!limitNodesChange) {
        syncNodesWithCollectionList();
        limitNodesChange = limitNodesChange + 1;
      }
    }
  });

  let deletedNodeId: string;
  let deleteNodeName: string = "";

  /**
   * Opens the delete confirmation modal and sets the ID of the node to be deleted.
   * Also triggers the count of the next node to be deleted.
   *
   * @param id - The ID of the node to be deleted.
   */
  const handleDeleteModal = (id: string) => {
    if (!id) return;
    if (id === "1") return;
    isDeleteNodeModalOpen = true;
    deletedNodeId = id;
    let filteredNodes = $nodes.filter(
      (node) => node.id === id,
    ) as unknown as TFNodeHandlerType[];
    deleteNodeName = filteredNodes[0]?.data?.name;
    countNextDeletedNode(id);
  };

  /**
   * Creates a new node and connects it to the existing node.
   * @param _id - The ID of the existing node.
   */
  const createNewNode = async (_id: string, _requestData = undefined) => {
    if (!_id) return;

    // handles run from from start button click
    if (_id === "0") {
      await onClickRun();
      selectFirstNode();
      MixpanelEvent(Events.Run_TestFlows);
      return;
    }

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
            onClick: function (_id: string, _options = undefined) {
              createNewNode(_id, _options);
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
            onOpenDeleteModal: function (id: string) {
              handleDeleteModal(id);
            },
            name: _requestData ? _requestData?.name : "",
            method: _requestData ? _requestData?.method : "",
            collectionId: _requestData ? _requestData?.collectionId : "",
            folderId: _requestData?.folderId ? _requestData?.folderId : "",
            requestId: _requestData ? _requestData?.requestId : "",
            collections: filteredCollections,
            tabId: $tab.tabId,
          },
          position: nextNodePosition,
          deletable: false,
          draggable: isNodesDraggable, // Disable dragging for this node
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
          deletable: false,
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
            onClick: function (_id: string, _options = undefined) {
              createNewNode(_id, _options);
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
            onOpenDeleteModal: function (id: string) {
              handleDeleteModal(id);
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
          deletable: dbNodes[i].id === "1" ? false : false,
          draggable: isNodesDraggable, // Disable dragging for this node
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
          deletable: false,
        });
      }
      return res;
    });
  });

  let selectedNode: TFNodeStoreType | undefined;

  // Get the platform
  const getPlatform = async () => {
    const os = await platform();
    return os;
  };

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

  let selectedNodeName = "";
  let selectedNodeId = "";

  // Subscribe to changes in the nodes
  const nodesSubscriber = nodes.subscribe((val: Node[]) => {
    if (val && val.length) onUpdateNodes(val);
    nodesValue = val.length;
    // Find the node where selected is true
    let node = val.find((node: Node) => node.selected === true);

    if (node) {
      selectedNodeName = node?.data?.name as string;
      selectedNodeId = node.id;
    } else {
      (selectedNodeName = ""), (selectedNodeId = "");
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
    if (tab === "Request Body") {
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

  let isDeleteNodeModalOpen = false;

  /**
   * Handles the deletion of a node and its related edges by filtering
   * the `nodes` and `edges` stores, and performs necessary cleanup actions.
   * @param id - The ID of the node to delete.
   */
  const handleDeleteNode = (id: string) => {
    nodes.update((_nodes) => {
      const remainingNodes = _nodes.filter(
        (node) => Number(node.id) < Number(id),
      );
      return remainingNodes;
    });

    edges.update((_edges) => {
      const remainingEdges = _edges.filter(
        (edge) =>
          Number(edge.source) !== Number(id) &&
          Number(edge.target) < Number(id),
      );
      return remainingEdges;
    });

    deleteNodeResponse($tab.tabId, selectedNodeId);
    unselectNodes();

    isDeleteNodeModalOpen = false;
  };

  let deleteCount = 0; // Variable to store the count of nodes to be deleted

  /**
   *  Count nodes with an id greater than the one being deleted
   * @param id - node id from which count starts
   */
  const countNextDeletedNode = (id: string) => {
    nodes.subscribe((_nodes) => {
      deleteCount = _nodes.filter(
        (node) => Number(node.id) > Number(id),
      ).length;
    });
  };

  /**
   * Handles key press events, preventing default behavior for "Backspace" and "Delete" keys.
   * If "Delete" is pressed, it triggers the deletion modal for the selected node.
   *
   * @param event - The key press event object.
   */
  const handleKeyPress = async (event: KeyboardEvent) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const platform = await getPlatform();
      if (platform === "macos") {
        handleDeleteModal(selectedNodeId);
      }
    }
    if (event.key === "Delete") {
      event.preventDefault();
      handleDeleteModal(selectedNodeId);
    }
  };

  // API response UI states
  let responseState: TFResponseStateType = {
    responseBodyLanguage: "JSON",
    responseBodyFormatter: "Pretty",
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

  /**
   * Unselect all the existing nodes
   */
  const unselectNodes = () => {
    nodes.update((_nodes: Node[] | any[]) => {
      _nodes.forEach((_nodeItem) => {
        _nodeItem.selected = false;
      });
      return _nodes;
    });
  };

  /**
   * Select all the existing nodes
   */
  const selectFirstNode = () => {
    nodes.update((_nodes: Node[] | any[]) => {
      _nodes.forEach((_nodeItem, index) => {
        if (index === 1) {
          _nodeItem.selected = true;
        } else {
          _nodeItem.selected = false;
        }
      });
      return _nodes;
    });
  };

  let divElement: HTMLElement;
  /**
   * Focuses the div element by calling its focus method.
   */
  const focusDiv = () => {
    divElement.focus();
  };

  /**
   * Handles the drag enter event and updates all nodes to set `parentDrag` to true.
   */
  const handleDragEnter = new Debounce().debounce(() => {
    nodes.update((nodes) => {
      return nodes.map((node, index, array) => ({
        ...node,
        data: {
          ...node.data,
          parentDrag: true,
        },
      }));
    });
  }, 300);

  /**
   * Handles the drag end event with a debounce of 1000 milliseconds
   * and updates all nodes to set `parentDrag` to false.
   */
  const handleDragEnd = new Debounce().debounce(() => {
    nodes.update((nodes) =>
      nodes.map((node, index, array) => ({
        ...node,
        data: {
          ...node.data,
          parentDrag: false,
        },
      })),
    );
  }, 300);

  /**
   * Cleanup function to be called when the component is destroyed.
   * Unsubscribes from `collectionsSubscriber` and invokes the cleanup
   * functions for `nodesSubscriber` and `edgesSubscriber`.
   */
  onDestroy(() => {
    collectionsSubscriber.unsubscribe();
    nodesSubscriber();
    edgesSubscriber();
  });

  let sampleApiData: TFNodeStoreType;
  onMount(() => {
    setTimeout(() => {
      sampleApiData = onRunSampleApi();
    }, 0);
  });
</script>

<div
  class="h-100 d-flex flex-column position-relative"
  on:dragenter={(e) => {
    // Listens item enter.
    e.preventDefault();
    handleDragEnter();
  }}
  on:drop={(e) => {
    // listens item drop.
    e.preventDefault();
    handleDragEnd();
  }}
  on:dragover={(e) => {
    // Necessary to enable dropping.
    e.preventDefault();
  }}
>
  <div class="p-3" style="position:absolute; z-index:3; top:0;">
    <!-- INSERT NAME COMPONENT HERE -->
    <TestFlowName {onUpdateTestFlowName} testFlowName={$tab?.name} />
  </div>
  <div
    class="d-flex justify-content-between position-absolute p-3"
    style="top:0; ;
  right:0;
  z-index:3;"
  >
    <div class="d-flex">
      {#if testflowStore?.isTestFlowRunning}
        <div class="d-flex testing-text-container">
          <div class="loader"></div>
          <p class="testing-txt">Testing</p>
        </div>
      {/if}
      <div class="run-btn" style="margin-right: 5px; position:relative;">
        {#if nodesValue > 1}
          <DropButton
            title="Run"
            type="default"
            iconRequired={true}
            icon={RunIcon}
            iconHeight={"14px"}
            iconWidth={"14px"}
            style="height: 36px;"
            disable={testflowStore?.isTestFlowRunning}
            iconColor={"var(--icon-secondary-100)"}
            onClick={async () => {
              unselectNodes();
              await onClickRun();
              selectFirstNode();
              MixpanelEvent(Events.Run_TestFlows);
            }}
          />
        {/if}

        {#if $isTestFlowTourGuideOpen && $currentStep == 6}
          <div style="position:absolute;  top:60px; right:320px">
            <TestFlowTourGuide
              targetId="run-btn"
              title="Ready, Set, Run 🏃🏻‍♂️"
              pulsePosition={{ top: "-62px", left: "260px" }}
              description={`The flow is almost ready, just waiting for you to hit 'Run' and watch the magic happen! <br/> Alternatively, you can use the "Start" play button to initiate the flow as well.`}
              tipPosition="top-right"
              onNext={async () => {
                currentStep.set(7);
              }}
              onClose={() => {
                isTestFlowTourGuideOpen.set(false);
              }}
            />
          </div>
        {/if}
      </div>
      <div>
        <SaveTestflow
          isSave={$tab.isSaved}
          {isTestflowEditable}
          {onSaveTestflow}
        />
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
  <div
    bind:this={divElement}
    tabindex="0"
    on:keydown={handleKeyPress}
    on:click={focusDiv}
    style="flex:1; overflow:auto; outline: none; position:realtive;"
  >
    <SvelteFlow {nodes} {edges} {nodeTypes}>
      <Background
        bgColor={"var(--bg-secondary-850)"}
        patternColor={"var(--bg-secondary-500)"}
        size={4}
        gap={20}
      />
    </SvelteFlow>

    {#if $isTestFlowTourGuideOpen && $currentStep == 3}
      <div style="position:absolute; top:260px; left:265px; z-index:1000;">
        <TestFlowTourGuide
          title="One Block At A Time 🧱"
          pulsePosition={{ top: "-64px", left: "30px" }}
          description={`Wow! You’ve made it to the canvas! Now, just click 'Add Block' and you’re almost there.`}
          tipPosition="top-left"
          onNext={() => {
            currentStep.set(4);
            createNewNode("1");
          }}
          onClose={() => {
            isTestFlowTourGuideOpen.set(false);
          }}
        />
      </div>
    {/if}

    {#if $isTestFlowTourGuideOpen && $currentStep == 4}
      <div style="position:absolute; top:232px; left:638px; z-index:1000;">
        <TestFlowTourGuide
          title="Block Added! 👏 "
          description={`Now, just one more step—click on the dropdown to select an API. Don’t worry, we’ve provided a sample API in case you don’t have one ready in your collection.`}
          tipPosition="left-top"
          pulsePosition={{ top: "8px", left: "-150px" }}
          onNext={() => {
            currentStep.set(5);
          }}
          onClose={() => {
            isTestFlowTourGuideOpen.set(false);
          }}
        />
      </div>
    {/if}

    {#if $isTestFlowTourGuideOpen && $currentStep == 5}
      <div style="position:absolute; top:265px; left:632px; z-index:1000;">
        <TestFlowTourGuide
          title="Sample API waiting...⏱️"
          description={`Ready for you to get selected and move ahead! Just choose it from the dropdown and you’re good to go.`}
          tipPosition="left-top"
          pulsePosition={{ top: "10px", left: "-145px" }}
          onNext={() => {
            currentStep.set(6);
          }}
          onClose={() => {
            isTestFlowTourGuideOpen.set(false);
          }}
        />
      </div>
    {/if}
  </div>
  {#if testflowStore?.nodes?.length >= 1 && selectedNode}
    <div class="request-container" style="z-index:10;">
      <div
        class="rounded-2 d-flex flex-column"
        style="background-color:var(--bg-secondary-850); border:1px solid var(--border-tertiary-300);  margin:10px; height:350px;"
      >
        <!-- Request Response Nav -->
        <TableNavbar
          bind:selectedNode
          onClose={() => {
            unselectNodes();
          }}
          onRedirect={() => {
            const path = selectedNode?.request?.path;
            onRedrectRequest(
              path?.workspaceId,
              path?.collectionId,
              path?.folderId,
              selectedNode?.request?.id,
            );
          }}
        />

        <!-- Request Respone Body -->
        <div
          class="d-flex justify-content-between m-1"
          style="flex:1; overflow:auto;"
        >
          <!-- Sidebar -->
          <TableSidebar {selectedNode} bind:selectedTab />

          <!-- Request Data -->
          <div class="request-rhs-container h-100">
            {#if selectedTab === "response"}
              <div class="p-2 h-100" style="">
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
                                {isWebApp}
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
              <div class="p-2 h-100" style="">
                <div
                  class="d-flex flex-column h-100 pt-1"
                  style="overflow:auto;"
                >
                  <div class="h-100 d-flex flex-column">
                    <RequestNavigatorTestFlow
                      paramsLength={selectedNode?.request?.property?.request
                        ?.queryParams?.length || 0}
                      headersLength={selectedNode?.request?.property?.request
                        ?.headers?.length || 0}
                      autoGeneratedHeadersLength={selectedNode?.request
                        ?.property?.request?.autoGeneratedHeaders?.length || 0}
                      {updateActiveTabInsideRequestBody}
                      bind:requestNavigation
                    />

                    <div style="flex:1; overflow:auto;" class="p-0 w-100">
                      {#if requestNavigation === RequestSectionEnum.REQUEST_BODY}
                        <RequestBodyTestFlow
                          body={selectedNode?.request?.property?.request?.body}
                          method={selectedNode?.request?.property?.request
                            ?.method}
                          requestState={selectedNode?.request?.property?.request
                            ?.state}
                          {environmentVariables}
                        />
                      {:else if requestNavigation === RequestSectionEnum.PARAMETERS}
                        <RequestParameterTestFlow
                          params={selectedNode?.request?.property?.request
                            ?.queryParams}
                          authParameter={{}}
                          isBulkEditActive={false}
                          onUpdateRequestState={() => {}}
                          {environmentVariables}
                        />
                      {:else if requestNavigation === RequestSectionEnum.HEADERS}
                        <RequestHeaderTestFlow
                          headers={selectedNode?.request?.property?.request
                            ?.headers}
                          autoGeneratedHeaders={selectedNode?.request?.property
                            ?.request?.autoGeneratedHeaders}
                          authHeader={{}}
                          {environmentVariables}
                          onHeadersChange={() => {}}
                          isBulkEditActive={false}
                          onUpdateRequestState={() => {}}
                        />
                      {/if}
                    </div>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {:else if $isTestFlowTourGuideOpen && $currentStep === 7}
    <div class="request-container" style="z-index:10;">
      <div
        class="rounded-2 d-flex flex-column"
        style="background-color:var(--bg-secondary-850); border:1px solid var(--border-tertiary-300);  margin:10px; height:350px;"
      >
        <!-- Request Response Nav -->
        <TableNavbar
          bind:selectedNode={sampleApiData}
          onClose={() => {
            unselectNodes();
          }}
          onRedirect={() => {
            const path = sampleApiData?.request?.path;
            onRedrectRequest(
              path?.workspaceId,
              path?.collectionId,
              path?.folderId,
              sampleApiData?.request?.id,
            );
          }}
        />

        <!-- Request Respone Body -->
        <div
          class="d-flex justify-content-between m-1"
          style="flex:1; overflow:auto;"
        >
          <!-- Sidebar -->
          <TableSidebar selectedNode={sampleApiData} bind:selectedTab />

          <!-- Request Data -->
          <div class="request-rhs-container h-100">
            {#if selectedTab === "response"}
              <div class="p-2 h-100" style="">
                <div
                  class="d-flex flex-column h-100 pt-1"
                  style="overflow:auto;"
                >
                  <div class="h-100 d-flex flex-column">
                    <div style="flex:1; overflow:auto;">
                      {#if sampleApiData?.response?.status === ResponseStatusCode.ERROR}
                        <ResponseErrorScreen />
                      {:else if sampleApiData?.response?.status}
                        <div class="h-100 d-flex flex-column">
                          <ResponseStatus response={sampleApiData?.response} />
                          <ResponseNavigator
                            requestStateSection={responseNavigation}
                            {updateResponseNavigation}
                            responseHeadersLength={sampleApiData?.response
                              ?.headers?.length || 0}
                          />
                          {#if responseNavigation === "Response"}
                            {#if responseState?.responseBodyLanguage !== "Image"}
                              <ResponseBodyNavigator
                                response={sampleApiData?.response}
                                apiState={responseState}
                                {onUpdateRequestState}
                                onClearResponse={() => {}}
                                {isWebApp}
                              />
                            {/if}
                            <div style="flex:1; overflow:auto;">
                              <ResponseBody
                                response={sampleApiData?.response}
                                apiState={responseState}
                              />
                            </div>
                          {:else if responseNavigation === "Headers"}
                            <div style="flex:1; overflow:auto;">
                              <ResponseHeaders
                                responseHeader={sampleApiData?.response.headers}
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
              <div class="p-2 h-100" style="">
                <div
                  class="d-flex flex-column h-100 pt-1"
                  style="overflow:auto;"
                >
                  <div class="h-100 d-flex flex-column">
                    <RequestNavigatorTestFlow
                      paramsLength={sampleApiData?.request?.property?.request
                        ?.queryParams?.length || 0}
                      headersLength={sampleApiData?.request?.property?.request
                        ?.headers?.length || 0}
                      autoGeneratedHeadersLength={sampleApiData?.request
                        ?.property?.request?.autoGeneratedHeaders?.length || 0}
                      {updateActiveTabInsideRequestBody}
                      bind:requestNavigation
                    />

                    <div style="flex:1; overflow:auto;" class="p-0 w-100">
                      {#if requestNavigation === RequestSectionEnum.REQUEST_BODY}
                        <RequestBodyTestFlow
                          body={sampleApiData?.request?.property?.request?.body}
                          method={sampleApiData?.request?.property?.request
                            ?.method}
                          requestState={sampleApiData?.request?.property
                            ?.request?.state}
                          {environmentVariables}
                        />
                      {:else if requestNavigation === RequestSectionEnum.PARAMETERS}
                        <RequestParameterTestFlow
                          params={sampleApiData?.request?.property?.request
                            ?.queryParams}
                          authParameter={{}}
                          isBulkEditActive={false}
                          onUpdateRequestState={() => {}}
                          {environmentVariables}
                        />
                      {:else if requestNavigation === RequestSectionEnum.HEADERS}
                        <RequestHeaderTestFlow
                          headers={sampleApiData?.request?.property?.request
                            ?.headers}
                          autoGeneratedHeaders={sampleApiData?.request?.property
                            ?.request?.autoGeneratedHeaders}
                          authHeader={{}}
                          {environmentVariables}
                          onHeadersChange={() => {}}
                          isBulkEditActive={false}
                          onUpdateRequestState={() => {}}
                        />
                      {/if}
                    </div>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}

  <div class="p-3" style="position:absolute; z-index:3; bottom:0; right:0;">
    <p
      class="mb-0 pb-0 text-fs-14"
      style="color: var(--text-primary-300); font-weight:500; cursor:pointer;  "
      on:click={() => {
        currentStep.set(1);
        isTestFlowTourGuideOpen.set(true);
      }}
    >
      Need help?
    </p>
  </div>
</div>
<!-- <svelte:window on:keydown={handleKeyPress} /> -->

<Modal
  title={""}
  type={"dark"}
  width={"540px"}
  zIndex={1000}
  isOpen={isDeleteNodeModalOpen}
  handleModalState={(flag = false) => {
    isDeleteNodeModalOpen = flag;
  }}
>
  <DeleteNode
    {deletedNodeId}
    {deleteNodeName}
    {handleDeleteNode}
    {deleteCount}
    handleModalState={(flag = false) => {
      isDeleteNodeModalOpen = flag;
    }}
  />
</Modal>

<style>
  :global(.svelte-flow__attribution) {
    display: none;
  }
  .loader {
    color: var(--bg-primary-300);
    width: 2px;
    aspect-ratio: 1;
    border-radius: 100%;
    box-shadow:
      9px 0 0 4px,
      18px 0 0 2px,
      27px 0 0 0;
    transform: translateX(-40px);
    animation: l21 0.5s infinite alternate linear;
  }

  @keyframes l21 {
    50% {
      box-shadow:
        9px 0 0 2px,
        18px 0 0 4px,
        27px 0 0 2px;
    }
    100% {
      box-shadow:
        9px 0 0 0,
        18px 0 0 2px,
        27px 0 0 4px;
    }
  }

  .request-rhs-container {
    height: 100%;
    overflow: auto;
    width: calc(100% - 190px);
  }

  .request-container {
    background-color: var(--bg-secondary-800);
    width: 100%;
  }
  .testing-txt {
    color: var(--text-primary-300);
    font-size: 14;
    font-weight: 400;
    align-self: center;
    align-content: center;
    margin-top: 15%;
    margin-right: 10px;
  }
  .testing-text-container {
    align-items: center;
    justify-content: flex-end;
    height: 36px;
    background-color: var(--bg-tertiary-750);
    width: 110px;
    margin-right: 10px;
    border-radius: 4px;
  }
</style>
