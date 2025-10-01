<script lang="ts">
  import { writable } from "svelte/store";
  import {
    SvelteFlow,
    Background,
    type Node,
    type NodeTypes,
    type EdgeTypes,
    SvelteFlowProvider,
  } from "@xyflow/svelte";
  import {
    StartBlock,
    RequestBlock,
    Edge,
    TestFlowBottomPanel,
  } from "../../testflow-explorer/components";

  import type { Tab } from "@sparrow/common/types/workspace/tab";
  import type { Observable } from "rxjs";
  import type {
    TFEdgeHandlerType,
    TFEdgeType,
    TFNodeType,
  } from "@sparrow/common/types/workspace/testflow";
  import { Debounce } from "@sparrow/common/utils";
  import "@xyflow/svelte/dist/style.css";

  // Props
  export let tab: Observable<Partial<Tab>>;

  // State
  let selectedBlock: any | undefined;
  let selectedNodeIndex = 0;
  let responses: any[] = [];
  let divElement: HTMLElement;
  let isEdgeDeletable = false;

  // Stores
  const nodes = writable<Node[]>([]);
  const edges = writable<TFEdgeHandlerType[]>([]);

  const checkIfEdgesExist = (_id: string, _direction = "right") => {
    let edge: TFEdgeHandlerType[] = [];
    edges.subscribe((value) => {
      edge = value;
    })();
    let response = false;
    edge.forEach((it) => {
      const [sourceId, targetId] = it.id.replace("xy-edge__", "").split("-");
      if (_direction === "right" && sourceId === _id) response = true;
      if (_direction === "left" && targetId === _id) response = true;
    });
    return response;
  };

  const deleteEdges = (_source: string, _target: string) => {
    edges.update((_edges) => {
      const filteredEdges = _edges.filter(
        (edge) => !(edge.source === _source && edge.target === _target),
      );
      return [...filteredEdges];
    });
  };

  const createNewNode = async (
    _id: string,
    _requestData = undefined,
    _direction = "add-block-after",
    _duplicate: { duplicate: boolean } = { duplicate: false },
  ) => {
    // Disabled in schedule run view
  };

  const handleNodeClick = (nodeId: string) => {
    nodes.update((_nodes) => {
      const nodeIndex = _nodes.findIndex((n) => n.id === nodeId);
      if (nodeIndex !== -1) {
        const responseIndex = nodeIndex - 1; // skip startBlock
        if (responseIndex >= 0 && responseIndex < responses.length) {
          selectedNodeIndex = responseIndex;
          selectedBlock = {
            ..._nodes[nodeIndex],
            data: {
              ..._nodes[nodeIndex].data,
              response: responses[responseIndex],
            },
          };
        } else if (nodeIndex === 0) {
          selectedBlock = undefined; // startBlock clicked
        }
      }
      return _nodes;
    });
  };

  const unselectNodes = () => {
    selectedBlock = undefined;
    nodes.update((_nodes) => _nodes.map((n) => ({ ...n, selected: false })));
  };

  let prevTabId = "";
  $: if ($tab && $tab.tabId && prevTabId !== $tab.tabId) {
    // Update nodes store
    (async () => {
      nodes.update((_nodes) => {
        const dbNodes =
          ($tab?.property?.testflowScheduleRunView?.nodes as TFNodeType[]) ||
          [];
        let res: any[] = [];
        for (let i = 0; i < dbNodes.length; i++) {
          const dbNode = dbNodes[i];
          res.push({
            id: dbNode.id,
            type: dbNode.type,
            data: {
              blockName: dbNode?.data?.blockName,
              blocks: _nodes,
              connector: edges,
              onClick: createNewNode,
              onCheckEdges: checkIfEdgesExist,
              onContextMenu: () => {},
              onOpenAddCustomRequestModal: () => {},
              onOpenSaveNodeRequestModal: () => {},
              updateBlockName: () => {},
              collectionId: dbNode.data?.collectionId,
              requestId: dbNode.data?.requestId,
              folderId: dbNode.data?.folderId,
              requestData: dbNode.data?.requestData,
              collections: [],
              tabId: $tab?.tabId,
            },
            position: dbNode.position,
            deletable: dbNode.id !== "1",
            draggable: dbNode.id !== "1",
          });
        }
        return res;
      });

      // Update edges store
      edges.update((_edges) => {
        const dbEdges = $tab?.property?.testflowScheduleRunView
          ?.edges as TFEdgeType[];
        let res = [];
        for (let i = 0; i < (dbEdges?.length || 0); i++) {
          res.push({
            id: dbEdges[i].id,
            source: dbEdges[i].source,
            type: "edge",
            target: dbEdges[i].target,
            deletable: isEdgeDeletable,
            data: {
              onDeleteEdge: deleteEdges,
              onCreateNode: createNewNode,
            },
          });
        }
        return res;
      });
      prevTabId = $tab.tabId;
    })();
  }

  // Node + edge types
  const nodeTypes: NodeTypes = {
    startBlock: StartBlock,
    requestBlock: RequestBlock,
  } as unknown as NodeTypes;

  const edgeTypes: EdgeTypes = {
    edge: Edge,
  } as unknown as EdgeTypes;

  const focusDiv = () => divElement.focus();

  // Drag handlers
  const handleDragEnter = new Debounce().debounce(() => {
    nodes.update((nodes) =>
      nodes.map((n) => ({ ...n, data: { ...n.data, parentDrag: true } })),
    );
  }, 300);

  const handleDragEnd = new Debounce().debounce(() => {
    nodes.update((nodes) =>
      nodes.map((n) => ({ ...n, data: { ...n.data, parentDrag: false } })),
    );
  }, 300);
</script>

<div
  class="h-100 d-flex flex-column position-relative"
  on:dragenter={(e) => {
    e.preventDefault();
    handleDragEnter();
  }}
  on:drop={(e) => {
    e.preventDefault();
    handleDragEnd();
  }}
  on:dragover={(e) => e.preventDefault()}
>
  <div class="p-3 border-bottom">
    <h2 class="schedule-title">{$tab?.name || "Schedule Run Results"}</h2>
  </div>

  <div style="flex: 1; overflow: auto;">
    <div
      bind:this={divElement}
      tabindex="0"
      on:click={focusDiv}
      class="testflow-top-container"
      id="testflow-container-main"
    >
      <SvelteFlowProvider>
        <!-- <SvelteFlow {nodes} {edges} {nodeTypes} {edgeTypes}> -->
        <Background
          bgColor={"var(--bg-ds-surface-900)"}
          patternColor={"var(--bg-ds-surface-500)"}
          size={4}
          gap={20}
        />
        <!-- </SvelteFlow> -->
      </SvelteFlowProvider>
    </div>
  </div>

  <div class="testflow-bottom-container">
    <!-- {#if selectedBlock}
      <div class="bottom-panel-wrapper">
        <TestFlowBottomPanel {selectedBlock} onClose={unselectNodes} />
      </div>
    {:else}
      <div class="empty-state">
        <p>Select a request block to view its response</p>
      </div>
    {/if} -->
  </div>
</div>

<style>
  :global(.svelte-flow__attribution) {
    display: none;
  }
  .schedule-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-ds-neutral-50);
    margin: 0;
  }
  .border-bottom {
    border-bottom: 1px solid var(--border-ds-neutral-400);
  }
  .h-100 {
    height: 100%;
  }
  .d-flex {
    display: flex;
  }
  .flex-column {
    flex-direction: column;
  }
  .position-relative {
    position: relative;
  }
  .p-3 {
    padding: 1rem;
  }
  .testflow-top-container {
    height: 50%;
    outline: none;
    position: relative;
    border-bottom: 1px solid var(--border-ds-neutral-400);
  }
  .testflow-bottom-container {
    height: 50%;
    overflow: auto;
    position: relative;
    background-color: var(--bg-ds-surface-900);
  }
  .bottom-panel-wrapper {
    background-color: transparent;
    margin: 0px 13px 12px 13px;
    height: 100%;
  }
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-ds-neutral-300);
    font-size: 14px;
  }
</style>
