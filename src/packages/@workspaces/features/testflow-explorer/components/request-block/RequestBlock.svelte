<script lang="ts">
  import type { Writable } from "svelte/store";
  import { Handle, Position } from "@xyflow/svelte";
  import { ArrowIcon } from "../../icons";
  import { VectorIcon } from "@library/icons";
  import { onMount } from "svelte";
  import SelectApiRequest from "../select-api/SelectAPIRequest.svelte";
  import type { CollectionDocument } from "@app/database/database";
  import type { Observable } from "rxjs";
  import Drop from "../../icons/Drop.svelte";

  export let data: {
    parentDrag: boolean;
    isLastNode: boolean; // Add this property
    onCheckEdges: (id: string) => boolean;
    name?: string;
    method?: string;
    onClick: (id: string) => void;
    onUpdateSelectedAPI: (
      id: string,
      name: string,
      requestId: string,
      collectionId: string,
      method: string,
      folderId?: string,
    ) => void;
    collections: Observable<CollectionDocument[]>;
  };
  export let id;

  let isAddBlockVisible = false;
  let isDropHereVisible = false;
  const updateNode = (
    name: string,
    requestId: string,
    collectionId: string,
    method: string,
    folderId?: string,
  ) => {
    data.onUpdateSelectedAPI(
      id,
      name,
      requestId,
      collectionId,
      method,
      folderId ?? "",
    );
  };

  $: {
    isDropHereVisible = data.parentDrag && data.isLastNode;
  }
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
    <SelectApiRequest
      {updateNode}
      collectionData={data.collections}
      name={data.name}
      method={data.method}
    />
  </div>
  <Handle type="source" position={Position.Right} />
  {#if isAddBlockVisible}
    <div class="add-block-btn">
      <div class="arrow">
        <ArrowIcon />
      </div>
      <span
        on:click={() => {
          data.onClick(id);
          isAddBlockVisible = false;
        }}
      >
        <span class="btnc py-1 px-3 d-flex align-items-center">
          <span class="text-fs-16 me-2">+</span> <span>Add Block</span>
        </span>
      </span>
    </div>
  {/if}

  {#if isDropHereVisible}
    <div class="position-absolute drop-btn">
      <div class="d-flex align-items-center justify-content-center">
        <div class="drop">
          <ArrowIcon />
        </div>

        <span class="btnc py-1 px-3 d-flex align-items-center gap-2">
          <Drop />
          <span class="py-1">Drop Here</span>
        </span>
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .drop-btn {
    position: absolute;
    right: -2%;
    top: 50%;
    transform: translateY(-50%) translateX(100%);
    color: var(--text-primary-300);
  }
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
    position: absolute;
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
  .arrow .drop {
    padding: 8px 4px;
    display: inline-block;
  }
</style>
