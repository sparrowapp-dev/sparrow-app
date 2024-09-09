<script lang="ts">
  import { writable } from "svelte/store";
  import { SvelteFlow, Background, Controls } from "@xyflow/svelte";

  import { StartBlock, RequestBlock } from "../components";

  import "@xyflow/svelte/dist/style.css";

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
            y: nodes[0].position.y - 20,
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

  const nodes = writable([
    {
      id: "1",
      type: "startBlock",
      data: {
        color: writable("#ff4000"),
        onClick: function (_id: string) {
          createNewNode(_id);
        },
        onCheckEdges: function (_id: string) {
          return checkIfEdgesExist(_id);
        },
        label: "Start",
      },
      position: { x: 100, y: 350 },
    },
  ]);

  const edges = writable([]);

  const nodeTypes = {
    startBlock: StartBlock,
    requestBlock: RequestBlock,
  };

  nodes.subscribe((val) => {
    console.log("nodes", val);
  });
  edges.subscribe((val) => {
    console.log("edges", val);
  });
</script>

<div class="h-100">
  <SvelteFlow {nodes} {edges} {nodeTypes}>
    <Background bgColor={"var(--bg-secondary-850)"} />
  </SvelteFlow>
</div>

<style>
  :global(.svelte-flow__attribution) {
    display: none;
  }
</style>
