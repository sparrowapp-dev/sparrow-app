<script lang="ts">
  import { writable } from "svelte/store";
  import { SvelteFlow, Background, Controls } from "@xyflow/svelte";

  import { StartBlock, RequestBlock } from "../components";

  import "@xyflow/svelte/dist/style.css";
  import { onMount } from "svelte";
  export let tab;
  export let onUpdateNodes;
  export let onUpdateEdges;

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

  const createNewNode = (_id: string) => {
    if (!_id) return;
    if (checkIfEdgesExist(_id)) {
      return;
    }

    const targetNode = Number(_id) + 1 + "";

    nodes.update((nodes) => {
      const n = nodes.length;
      return [
        ...nodes,
        {
          id: targetNode,
          type: "requestBlock",
          data: {
            color: writable("#ff4000"),
            onClick: function (_id: string) {
              createNewNode(_id);
            },
            onCheckEdges: function (_id: string) {
              return checkIfEdgesExist(_id);
            },
            label: "REST API Request",
          },
          position: {
            x: nodes[n - 1].position.x + 300,
            y: nodes[n - 1].position.y - 0,
          },
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
            color: writable("#ff4000"),
            onClick: function (_id: string) {
              createNewNode(_id);
            },
            onCheckEdges: function (_id: string) {
              return checkIfEdgesExist(_id);
            },
            label: "REST API Request",
          },
          position: {
            x: dbNodes[i].position.x,
            y: dbNodes[i].position.y,
          },
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
  });
  edges.subscribe((val) => {
    if (val) onUpdateEdges(val);
  });
</script>

<div class="h-100">
  <SvelteFlow {nodes} {edges} {nodeTypes}>
    <Background
      bgColor={"var(--bg-secondary-850)"}
      patternColor={"var(--bg-secondary-500)"}
      size={4}
      gap={20}
    />
  </SvelteFlow>
</div>

<style>
  :global(.svelte-flow__attribution) {
    display: none;
  }
</style>
