<script lang="ts">
  import { writable } from "svelte/store";
  import { SvelteFlow, Background, Controls } from "@xyflow/svelte";

  import { StartBlock } from "../components";

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
      //   if (n !== 1) {
      //     return nodes;
      //   }

      return [
        ...nodes,
        {
          id: targetNode,
          type: "startBlock",
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
            x: nodes[n - 1].position.x + 200,
            y: nodes[n - 1].position.y,
          },
          //   measured: { width: 400, height: 18 },
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
  };

  $: colorA = $nodes[0].data.color;
  //   $: colorB = $nodes[1].data.color;
  nodes.subscribe((val) => {
    console.log("nodes", val);
  });
  edges.subscribe((val) => {
    console.log("edges", val);
  });
</script>

<div class="h-100">
  <SvelteFlow {nodes} {edges} {nodeTypes}>
    <Background />
    <Controls />
  </SvelteFlow>
</div>
