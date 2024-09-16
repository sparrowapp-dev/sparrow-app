<script lang="ts">
  import { writable } from "svelte/store";
  import { SvelteFlow, Background, Controls } from "@xyflow/svelte";

  import { StartBlock, RequestBlock, RunHistory } from "../components";

  import "@xyflow/svelte/dist/style.css";
  import { onMount } from "svelte";
  import { Tooltip } from "@library/ui";
  import { WithButtonV3, WithButtonV5 } from "@workspaces/common/hoc";
  import { HistoryIcon } from "@library/icons";
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
            label: "REST API Request",
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
            label: "REST API Request",
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
  });
  edges.subscribe((val) => {
    if (val) onUpdateEdges(val);
  });
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
      </div>
      <div>
        <!--PASTE SAVE CODE HERE -->
      </div>
      <div class="position-relative">
        <RunHistory />
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
</div>

<style>
  :global(.svelte-flow__attribution) {
    display: none;
  }
</style>
