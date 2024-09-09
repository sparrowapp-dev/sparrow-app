<script lang="ts">
  import type { Writable } from "svelte/store";
  import { Handle, Position } from "@xyflow/svelte";
  import { ArrowIcon } from "../../icons";
  import { VectorIcon } from "@library/icons";

  export let data: {
    onCheckEdges: (id: string) => boolean;
    label: string;
    onClick: (id: string) => void;
  };
  export let id;

  let isAddBlockVisible = false;
</script>

<div
  class="request-block position-relative"
  on:mouseenter={() => {
    isAddBlockVisible = !data?.onCheckEdges(id);
  }}
>
  <Handle type="target" position={Position.Left} />
  <div class="px-3 py-2">
    <span class="text-fs-12 text-fs-10">
      <VectorIcon
        height={"12px"}
        width={"12px"}
        color={"var(--icon-primary-300)"}
      />
      <span class="ms-2">REST API Request</span>
    </span>
  </div>
  <hr class="my-0" />
  <div class="px-3 py-2">
    <span class="text-fs-12 text-fs-10 text-secondary-200"
      >Select an API request</span
    >
  </div>
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
  .request-block {
    background: #eee;
    background-color: var(--bg-tertiary-300);
    height: auto;
    border-radius: 0.125rem;
    font-size: 0.7rem;
    width: 200px;
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
  .request-block:hover {
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
