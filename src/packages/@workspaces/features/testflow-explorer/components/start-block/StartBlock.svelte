<script lang="ts">
  import type { Writable } from "svelte/store";
  import { Handle, Position, type NodeProps } from "@xyflow/svelte";
  import { ArrowIcon } from "../../icons";
  import { PlayArrow } from "@library/icons";
  import { onMount } from "svelte";

  // type $$Props = NodeProps;

  export let data: {
    onCheckEdges: (id: string) => boolean;
    label: string;
    onClick: (id: string) => void;
    blocks: any;
    connector: any;
  };
  export let id;

  let isAddBlockVisible = false;

  onMount(() => {
    data.blocks.subscribe(() => {
      setTimeout(() => {
        isAddBlockVisible = !data?.onCheckEdges(id);
      }, 10);
    });
    data.connector.subscribe(() => {
      setTimeout(() => {
        isAddBlockVisible = !data?.onCheckEdges(id);
      }, 10);
    });
  });
</script>

<div class="start-block position-relative">
  <span
    ><PlayArrow
      height={"14px"}
      width={"12px"}
      color={"var(--icon-primary-300)"}
    /><span class="ms-3 text-fs-12">Start</span>
    <Handle type="source" position={Position.Right} />
    {#if isAddBlockVisible}
      <div class="add-block-btn" style="position: absolute;   ">
        <div class="arrow">
          <ArrowIcon />
        </div>
        <span
          on:click={() => {
            data.onClick(id);
          }}
        >
          <span class="btnc py-1 px-3 d-flex align-items-center">
            <span class="text-fs-16 me-2">+</span> <span>Add Block</span>
          </span>
        </span>
      </div>
    {/if}
  </span>
</div>

<style lang="scss">
  .start-block {
    padding: 8px 15px;
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
    display: flex;
  }
  .btnc {
    border: 1px dashed var(--border-primary-300);
  }
  .arrow {
    padding: 8px 4px;
    display: inline-block;
  }
</style>
