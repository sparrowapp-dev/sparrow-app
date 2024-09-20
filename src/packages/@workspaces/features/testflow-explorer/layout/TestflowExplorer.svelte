<script lang="ts">
  import { writable } from "svelte/store";
  import { SvelteFlow, Background, Controls } from "@xyflow/svelte";

  import {
    StartBlock,
    RequestBlock,
    RequestBodyTestFlow,
    RunHistory,
    RequestHeaderTestFlow,
    RequestParameterTestFlow,
    RequestNavigatorTestFlow,
  } from "../components";
  import { RequestSectionEnum, type Tab } from "@common/types/workspace";

  import "@xyflow/svelte/dist/style.css";
  import { onMount } from "svelte";

  import "@xyflow/svelte/dist/style.css";
  import type { Observable } from "rxjs";
  import type { CollectionDocument } from "@app/database/database";
  import {
    DropButton,
    TableNavbar,
    TableSidebar,
  } from "@workspaces/common/components";
  import {
    ArrowOutwardIcon,
    ArrowSplit,
    CrossIcon,
    VectorIcon,
  } from "@library/icons";
  import { RunIcon } from "@library/icons";
  export let tab: Observable<Tab>;
  export let onUpdateNodes;
  export let onUpdateEdges;
  export let collectionList: Observable<CollectionDocument[]>;
  export let onClickRun;
  export let testflowStore;
  export let toggleHistoryDetails;
  export let toggleHistoryContainer;

  let isNodesDraggable = false;
  const checkIfEdgesExist = (_id: string) => {
    let edge = [];
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
   * finds the next node id
   * @param list - list of existing nodes
   */
  const findNextNodeId = (list): string => {
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
  let collectionListDocument;
  let filteredCollections = writable([]);
  let isRunDisabled = false;

  $: {
    if (collectionList) {
      collectionList.subscribe((value) => {
        collectionListDocument = value;
        collectionListDocument = collectionListDocument?.filter(
          (value) => value.workspaceId === $tab?.path?.workspaceId,
        );
        filteredCollections.set(collectionListDocument);
      });
    }
  }

  const createNewNode = (_id: string) => {
    if (!_id) return;
    if (checkIfEdgesExist(_id)) {
      return;
    }

    const targetNode = findNextNodeId($nodes);

    nodes.update((nodes) => {
      let nextNodePosition;
      // finds next node positions
      for (let i = 0; i < nodes?.length; i++) {
        if (nodes[i].id === _id) {
          nextNodePosition = {
            x: nodes[i].position.x + 300,
            y: nodes[i].position.y,
          };
        }
      }
      return [
        ...nodes,
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
        },
      ];
    });
  };
  const nodes = writable([]);
  const edges = writable([]);
  onMount(() => {
    nodes.update((_nodes) => {
      const dbNodes = $tab?.property?.testflow?.nodes;
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
          draggable: isNodesDraggable, // Disable dragging for this node
        });
      }
      return res;
    });
    edges.update((_edges) => {
      const dbEdges = $tab?.property?.testflow?.edges;
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

  let selectedNode;
  $: {
    if (testflowStore || selectedNodeId) {
      testflowStore?.nodes?.forEach((element) => {
        if (element.id === selectedNodeId) {
          selectedNode = element;
          console.log("This is selcted node", selectedNode);
        }
      });
    }
  }

  const nodeTypes = {
    startBlock: StartBlock,
    requestBlock: RequestBlock,
  };
  let nodesValue = 1;

  let selectedNodeId = 0;
  const checkIfResponseExist = (id) => {
    let result = false;
    testflowStore?.nodes?.forEach((element) => {
      if (element.id === id) {
        result = true;
      }
    });
    return result;
  };
  nodes.subscribe((val) => {
    if (val && val.length) onUpdateNodes(val);
    nodesValue = val.length;
    // Find the node where selected is true
    let selectedNodeTrue = val.find((node) => node.selected === true);

    if (selectedNodeTrue) {
      if (selectedNodeTrue.data.requestId) {
        if (checkIfResponseExist(selectedNodeTrue.id)) {
          selectedNodeId = selectedNodeTrue.id;
        }
      }
    }
  });
  edges.subscribe((val) => {
    if (val) onUpdateEdges(val);
  });

  let selectedTab = "response";

  let requestNavigation = "Request Body";

  function updateActiveTabInsideRequestBody(tab: string) {
    if (tab === "Body") {
      requestNavigation = "Request Body";
    } else if (tab === "Headers") {
      requestNavigation = "Headers";
    } else {
      requestNavigation = "Parameters";
    }

    return requestNavigation;
  }
</script>

<div class="h-100 position-relative">
  <div
    class="d-flex justify-content-between position-absolute p-3"
    style="top:0;
  right:0;
  z-index:100;"
  >
    <div>
      <!-- PASTE NAME CODE HERE -->
    </div>
    <div class="d-flex">
      <div style="margin-right: 5px;">
        <!--PASTE RUN CODE HERE-->
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
              isRunDisabled = true;
              await onClickRun();
              isRunDisabled = false;
            }}
          />
        {/if}
      </div>
      <div>
        <!-- PASTE SAVE CODE HERE -->
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
              <div>Response Body</div>
            {:else}
              <div class="p-2" style="">
                <RequestNavigatorTestFlow
                  paramsLength={selectedNode?.request?.property?.request
                    ?.queryParams?.length || 0}
                  headersLength={selectedNode?.request?.property?.request
                    ?.headers?.length || 0}
                  autoGeneratedHeadersLength={selectedNode?.request?.property
                    ?.request?.request?.autoGeneratedHeaders?.length || 0}
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
                    />
                  {:else if requestNavigation === RequestSectionEnum.HEADERS}
                    <RequestHeaderTestFlow
                      headers={selectedNode?.request?.property?.request
                        ?.headers}
                      autoGeneratedHeaders={selectedNode?.request?.property
                        ?.request?.autoGeneratedHeaders}
                      authHeader={{}}
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
  .button-hover:hover {
    background-color: var(--bg-tertiary-630);
  }
  .request-url {
    width: calc(100% - 200px);
    word-break: keep-all;
    margin-bottom: 0px;
  }

  .request-rhs-container {
    height: 224px;
    overflow: auto;
    width: calc(100% - 190px);
  }

  .button-hover.active {
    background-color: var(--bg-tertiary-630);
  }
  .request-container {
    position: absolute;
    bottom: 0px;
    background-color: var(--bg-secondary-800);
    width: 100%;
  }
  .run-btn {
    position: absolute;
    top: 10px; /* Adjust as needed */
    right: 10px; /* Adjust as needed */
    z-index: 10; /* Ensure it's higher than the SvelteFlow */
    background-color: red;
  }
  .parent-container {
    position: relative;
    height: 100%;
  }
</style>
