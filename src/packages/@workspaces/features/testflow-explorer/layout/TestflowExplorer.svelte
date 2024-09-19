<script lang="ts">
  import { writable } from "svelte/store";
  import { SvelteFlow, Background, Controls } from "@xyflow/svelte";

  import {
    StartBlock,
    RequestBlock,
    RequestBodyTestFlow,
    RunHistory,
  } from "../components";
  import { RequestSectionEnum, type Tab } from "@common/types/workspace";

  import "@xyflow/svelte/dist/style.css";
  import { onMount } from "svelte";

  import "@xyflow/svelte/dist/style.css";
  import type { Observable } from "rxjs";
  import type { CollectionDocument } from "@app/database/database";
  import { DropButton } from "@workspaces/common/components";
  import {
    ArrowOutwardIcon,
    ArrowSplit,
    CrossIcon,
    VectorIcon,
  } from "@library/icons";
  import RequestNavigatorTestFlow from "../components/request-navigator/RequestNavigatorTestFlow.svelte";
  import RequestParameterTestFlow from "../components/request-parameter/RequestParameterTestFlow.svelte";
  import RequestHeaderTestFlow from "../components/request-header/RequestHeaderTestFlow.svelte";
  export let tab: Observable<Tab>;
  export let onUpdateNodes;
  export let onUpdateEdges;
  export let collectionList: Observable<CollectionDocument[]>;
  export let onClickRun;
  export let testflowStore;
  export let toggleHistoryDetails;
  export let toggleHistoryContainer;

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
            tab: tab,
          },
          position: nextNodePosition,
          deletable: true,
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
          },
          position: {
            x: dbNodes[i].position.x,
            y: dbNodes[i].position.y,
          },
          deletable: dbNodes[i].id === "1" ? false : true,
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

  const nodeTypes = {
    startBlock: StartBlock,
    requestBlock: RequestBlock,
  };

  nodes.subscribe((val) => {
    if (val && val.length) onUpdateNodes(val);
    // console.log(val, "va;");
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
      requestNavigation = "Parameters"; // If the input is neither "body" nor "header"
    }

    return requestNavigation;
  }
</script>

<div class="h-100 position-relative">
  <div
    class="d-flex justify-content-between position-absolute p-3"
    style="top:0;
  left:0;
  right:0;
  z-index:100;"
  >
    <div>
      <!-- PASTE NAME CODE HERE -->
    </div>
    <div class="d-flex">
      <div>
        <!--PASTE RUN CODE HERE-->
        <DropButton
          title="Run"
          type="default"
          onClick={() => {
            onClickRun();
          }}
        />
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

  <div class="request-container" style="">
    <div
      class="rounded-2"
      style="background-color:#121212; border:1px solid #2A2C3C;  margin:10px; margin-top:15px;"
    >
      <!-- Requet Nav -->
      <div
        class="d-flex align-items-center justify-content-between p-1 ps-2 pe-2 "
        style="34px; background-color:#2A2C3C; border-bottom:1px solid #4B4F6B ; "
      >
        <div class="d-flex align-items-center gap-2">
          <VectorIcon
            height={"14"}
            width={"14"}
            color={"var(--icon-primary-300)"}
          />
          <p
            class="mb-0 pb-0 text-fs-12"
            style="font-weight: 500; color:#D7D7D7;"
          >
            REST API REQUEST
          </p>
        </div>
        <div class="d-flex gap-2 align-items-center" style="cursor:pointer">
          <ArrowOutwardIcon width={"8px"} height={"8px"} color={"#8A9299"} />
          <CrossIcon width={"14px"} height={"14px"} color={"#8A9299"} />
        </div>
      </div>

      <!-- Request Body -->
      <div
        class="d-flex justify-content-between m-1"
        style="max-height: 268px;"
      >
        <!-- Sidebar -->
        <div
          style="min-height:268px; min-width:187px; background-color: #22232E;  border-radius:2px;"
          class=""
        >
          <div>
            <p class="text-fs-12 p-1 ms-1 mt-2" style="color:#D7D7D7">
              Select an API request
            </p>
          </div>

          <div style="cursor: pointer;">
            <div
              class="button-hover m-1 d-flex align-items-center justify-content-start gap-2 px-3 mb-2 {selectedTab ===
              'response'
                ? 'active'
                : ''}"
              style=" height:25px; border-radius:2px;"
              on:click={() => {
                selectedTab = "response";
              }}
            >
              <ArrowSplit
                height={"10"}
                width={"10"}
                color={"var(--icon-secondary-100)"}
              />
              <p class="mb-0 pb-0 text-fs-10">Response</p>
            </div>
            <div
              class="button-hover m-1 d-flex align-items-center justify-content-start gap-2 px-3 mb-2 {selectedTab ===
              'request'
                ? 'active'
                : ''} "
              style=" height:25px; border-radius:2px;"
              on:click={() => {
                selectedTab = "request";
              }}
            >
              <VectorIcon
                height={"10"}
                width={"10"}
                color={"var(--icon-secondary-100)"}
              />
              <p class="mb-0 pb-0 text-fs-10">Request</p>
            </div>
          </div>
        </div>

        <!-- Request Data -->
        <div class="request-rhs-container">
          {#if selectedTab === "response"}
            <div>Response Body</div>
          {:else}
            <div class="p-2" style="">
              <RequestNavigatorTestFlow
                paramsLength={testflowStore?.nodes[0].request?.property?.request
                  ?.queryParams?.length || 0}
                headersLength={testflowStore?.nodes[0].request?.property
                  ?.request?.headers?.length || 0}
                autoGeneratedHeadersLength={testflowStore?.nodes[0].request
                  ?.property?.request?.request?.autoGeneratedHeaders?.length ||
                  0}
                {updateActiveTabInsideRequestBody}
                bind:requestNavigation
              />

              <div style="flex:1; overflow:auto;" class="p-0 w-100">
                {#if requestNavigation === RequestSectionEnum.REQUEST_BODY}
                  <RequestBodyTestFlow
                    body={testflowStore?.nodes[0].request?.property?.request
                      ?.body}
                    method={testflowStore?.nodes[0].request?.property?.request
                      ?.method}
                    requestState={testflowStore?.nodes[0].request?.property
                      ?.request?.state}
                  />
                {:else if requestNavigation === RequestSectionEnum.PARAMETERS}
                  <RequestParameterTestFlow
                    params={testflowStore?.nodes[0].request?.property?.request
                      ?.queryParams}
                    authParameter={{}}
                  />
                {:else if requestNavigation === RequestSectionEnum.HEADERS}
                  <RequestHeaderTestFlow
                    headers={testflowStore.nodes[0].request?.property?.request
                      ?.headers}
                    autoGeneratedHeaders={testflowStore.nodes[0].request
                      ?.property?.request?.autoGeneratedHeaders}
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
</div>

<style>
  :global(.svelte-flow__attribution) {
    display: none;
  }
  .button-hover:hover {
    background-color: #3e3f51;
  }

  .request-rhs-container {
    overflow: auto;
    width: calc(100% - 190px);
  }

  .button-hover.active {
    background-color: #3e3f51;
  }
  .request-container {
    position: absolute;
    bottom: 0px;
    background-color: #151515;
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
