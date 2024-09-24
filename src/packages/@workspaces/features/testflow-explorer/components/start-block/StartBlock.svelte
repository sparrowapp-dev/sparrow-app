<script lang="ts">
  import type { Unsubscriber } from "svelte/store";
  import { Handle, Position } from "@xyflow/svelte";
  import { ArrowIcon } from "../../icons";
  import { PlayArrow } from "@library/icons";
  import { onDestroy, onMount } from "svelte";
  import { Events } from "$lib/utils/enums/mixpanel-events.enum";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";

  /**
   * The data object containing various handlers and data stores.
   */
  export let data: {
    onCheckEdges: (id: string) => boolean;
    onClick: (id: string) => void;
    blocks: any;
    connector: any;
  };

  /**
   * The unique identifier for the current block.
   */
  export let id: string;

  // State to control the visibility of the "Add Block" button
  let isAddBlockVisible = false;

  // Unsubscribers for the blocks and connector stores
  let dataBlocksSubscriber: Unsubscriber;
  let dataConnectorSubscriber: Unsubscriber;

  // Lifecycle method - runs when the component is mounted
  onMount(() => {
    // Subscribe to changes in the blocks store
    dataBlocksSubscriber = data.blocks.subscribe(() => {
      // Update visibility of the "Add Block" button based on edge check
      setTimeout(() => {
        isAddBlockVisible = !data?.onCheckEdges(id);
      }, 10);
    });
    // Subscribe to changes in the connector store
    dataConnectorSubscriber = data.connector.subscribe(() => {
      // Update visibility of the "Add Block" button based on edge check
      setTimeout(() => {
        isAddBlockVisible = !data?.onCheckEdges(id);
      }, 10);
    });
  });

  // Lifecycle method - runs when the component is destroyed
  onDestroy(() => {
    // Unsubscribe from the blocks and connector stores to avoid memory leaks
    dataBlocksSubscriber();
    dataConnectorSubscriber();
  });
</script>

<div
  class="start-block position-relative"
  on:click={() => {
    MixpanelEvent(Events.Start_TestFlows);
  }}
>
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
