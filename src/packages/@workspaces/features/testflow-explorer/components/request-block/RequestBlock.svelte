<script lang="ts">
  import type { Writable } from "svelte/store";
  import { Handle, Position } from "@xyflow/svelte";
  import { ArrowIcon, InfoIcon } from "../../icons";
  import { VectorIcon } from "@library/icons";
  import { onMount } from "svelte";
  import SelectApiRequest from "../select-api/SelectAPIRequest.svelte";
  import type { CollectionDocument } from "@app/database/database";
  import type { Observable } from "rxjs";

  export let data: {
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
  let isRunTextVisible = false;
  const updateNode = (
    name: string,
    requestId: string,
    collectionId: string,
    method: string,
    folderId?: string,
  ) => {
    isRunTextVisible = true;
    data.onUpdateSelectedAPI(
      id,
      name,
      requestId,
      collectionId,
      method,
      folderId ?? "",
    );
  };
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
    {#if data?.name?.length > 0 || isRunTextVisible}
      <div class="d-flex run-txt-container">
        <InfoIcon height="10px" width="10px" />
        <p style="font-size: 10px;">Run the block to get response</p>
      </div>
    {/if}
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
        <span class="btnc py-1 px-3 d-flex align-items-center">
          <span class="text-fs-16 me-2">+</span> <span>Add Block</span>
        </span>
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
  .run-txt-container {
    align-items: center;
    padding-top: 10px;
  }
  .run-txt-container p {
    margin-bottom: 0px;
    color: #808080;
    margin-left: 4px;
  }
</style>
