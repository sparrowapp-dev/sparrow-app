<script lang="ts">
  import { DismissCircleRegular } from "@sparrow/library/icons";
  import { getBezierPath } from "@xyflow/svelte";

  export let id;
  export let sourceX;
  export let sourceY;
  export let targetX;
  export let targetY;
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

  const handleDelete = (event) => {
    event.stopPropagation();
    data?.onDelete?.(id);
  };
  const handleAdd = (event: MouseEvent) => {
    event.stopPropagation();
    data?.onAdd?.(id);
  };
</script>

<!-- SVG Path -->
<g class="svelte-flow__edge">
  <path d={edgePath} fill="none" stroke="#333" stroke-width="1.5" />
  <path
    d={edgePath}
    fill="none"
    stroke={selected ? "#007aff" : "#333"}
    stroke-width="1"
    class="svelte-flow__edge-interaction"
  />
  <foreignObject
    x={labelX}
    y={labelY}
    class="btn-container rounded p-2"
    width="65"
    height="36"
  >
    <div class="d-flex justify-content-center align-items-center h-100 gap-2">
      <DismissCircleRegular />
      <DismissCircleRegular />
    </div>
  </foreignObject>
</g>

<!-- HTML Button Overlay -->
<!-- Overlay buttons -->

<style>
  .btn-container {
    transform: translateX(-10%) translateY(-12%);
    background-color: var(--bg-ds-surface-300);
  }
</style>
