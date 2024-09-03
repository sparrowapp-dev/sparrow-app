<script lang="ts">
  import type { Writable } from "svelte/store";
  import { Handle, Position, type NodeProps } from "@xyflow/svelte";
  import { ArrowIcon } from "../../icons";

  // type $$Props = NodeProps;

  export let data: { color: Writable<string> };
  export let id;

  const { color } = data;
  let isAddBlockVisible = false;
</script>

<div
  class="start-block position-relative"
  on:mouseenter={() => {
    isAddBlockVisible = !data?.onCheckEdges(id);
  }}
>
  <Handle type="target" position={Position.Left} />
  <span class="text-fs-12">{data.label}</span>
  <Handle type="source" position={Position.Right} />
  {#if isAddBlockVisible}
    <div class="add-block-btn" style="position: absolute;   ">
      <div class="arrow">
        <ArrowIcon />
      </div>
      <span
        on:click={() => {
          data.onClick(id);
          isAddBlockVisible = false;
        }}
      >
        <span class="btnc py-2 px-3"> + Add Block </span>
      </span>
    </div>
  {/if}
</div>

<style lang="scss">
  .start-block {
    padding: 8px 30px;
    background: #eee;
    background-color: var(--bg-tertiary-300);
    height: auto;
    border-radius: 0.125rem;
    font-size: 0.7rem;
  }
  .add-block-btn {
    color: var(--text-primary-300);
    width: max-content;
    top: 50%;
    right: 0px;
    transform: translateY(-50%) translateX(100%);
    align-items: center;
    display: none;
  }
  .start-block:hover {
    .add-block-btn {
      display: flex;
    }
  }
  .btnc {
    border: 1px dashed var(--border-primary-300);
  }
  .arrow {
    padding: 8px 4px;
    display: inline-block;
  }
</style>
