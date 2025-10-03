<script lang="ts">
  import {
    AddCircleRegular,
    DismissCircleFilled,
  } from "@sparrow/library/icons";
  import { Tooltip } from "@sparrow/library/ui";
  import { getBezierPath } from "@xyflow/svelte";

  export let id;
  export let sourceX;
  export let sourceY;
  export let targetX;
  export let targetY;
  export let source;
  export let target;
  export let sourcePosition;
  export let targetPosition;
  export let selected: boolean;
  export let data;

  // Reactive: recalculate the edgePath and label position when any inputs change
  let edgePath = "";
  let labelX = 0;
  let labelY = 0;

  $: {
    [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
    });
  }

  const handleDeleteEdge = (event) => {
    event.stopPropagation();
    data?.onDeleteEdge?.(source, target);
  };
  const handleAddNode = (event: MouseEvent) => {
    event.stopPropagation();
    data?.onCreateNode?.(source);
  };
</script>

<!-- SVG Path -->
<g class="svelte-flow__edge">
  <path d={edgePath} fill="none" stroke="transparent" stroke-width="40" />
  <path
    d={edgePath}
    fill="none"
    stroke={selected
      ? "var(--text-ds-neutral-600)"
      : "var(--text-ds-neutral-600)"}
    stroke-width="1"
    class="svelte-flow__edge-interaction"
  />
  <foreignObject
    x={labelX}
    y={labelY}
    class="btn-container rounded p-2"
    width="36"
    height="22"
  >
    <div class="d-flex justify-content-center align-items-center h-100 gap-1">
      <span class="icon-parent" on:click={handleDeleteEdge}>
        <DismissCircleFilled
          size={"14px"}
          color={"var(--icon-ds-danger-300)"}
        />
        <div
          class="icon-tooltip position-absolute text-fs-12 rounded d-flex justify-content-center align-items-center z-2"
          style="height: 26px; width: 157px; background-color:var(--bg-ds-surface-100); top:-45px; left:0%; transform: translateX(-50%);"
        >
          Remove this connection
        </div>
        <span
          class="position-absolute tooltip-square"
          style="top:-15px; left:50%; transform: translateX(-50%) translateY(-100%) rotate(45deg); "
        ></span>
      </span>
      <span class="icon-parent" on:click={handleAddNode}>
        <AddCircleRegular size={"14px"} />
        <div
          class="icon-tooltip position-absolute text-fs-12 rounded d-flex justify-content-center align-items-center z-2"
          style="height: 26px; width: 157px; background-color:var(--bg-ds-surface-100); top:-45px; left:0%; transform: translateX(-50%);"
        >
          Insert a new block here
        </div>
        <span
          class="position-absolute tooltip-square"
          style="top:-15px; left:50%; transform: translateX(-50%) translateY(-100%) rotate(45deg); "
        ></span>
      </span>
    </div>
  </foreignObject>
</g>

<!-- HTML Button Overlay -->
<!-- Overlay buttons -->

<style lang="scss">
  .btn-container {
    overflow: visible;
    transform: translateX(-16px) translateY(-11px);
    background-color: var(--bg-ds-surface-300);
    display: none;
  }
  .svelte-flow__edge:hover {
    height: 500px;
    .btn-container {
      display: block;
    }
  }
  .icon-tooltip {
    display: none !important;
  }

  .tooltip-square {
    display: none !important;
    height: 10px;
    width: 10px;
    background-color: var(--bg-ds-surface-100);
  }

  .icon-parent:hover {
    .icon-tooltip {
      // display: flex !important;
    }
    .tooltip-square {
      // display: block !important;
    }
  }
</style>
