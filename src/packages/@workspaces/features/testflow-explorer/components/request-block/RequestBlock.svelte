<script lang="ts">
  import { Handle, Position } from "@xyflow/svelte";
  import { ArrowSolid, DropdownArrow } from "../../icons";
  import {
    ArrowRightIcon,
    DotIcon,
    ClockIcon,
    ExclamationIcon,
    CheckIcon2,
  } from "@library/icons";
  import { onDestroy } from "svelte";
  import { ResponseStatusCode } from "$lib/utils/enums";
  import { InfoIcon } from "../../icons";
  import { VectorIcon } from "@library/icons";
  import SelectApiRequest from "../select-api/SelectAPIRequest.svelte";
  import type { CollectionDocument } from "@app/database/database";
  import type { Observable } from "rxjs";
  import { testFlowDataStore } from "@workspaces/features/socket-explorer/store/testflow";

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
    tabId: string;
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

  let isCreateBlockArrowHovered = false;

  let testflowStore;
  let currentBlock;
  const testFlowDataStoreSubscriber = testFlowDataStore.subscribe((val) => {
    if (val) {
      testflowStore = val.get(data.tabId);
      if (testflowStore?.nodes?.length >= 1) {
        testflowStore?.nodes?.forEach((element) => {
          if (element.id === id) {
            currentBlock = element;
            if (currentBlock?.response?.status === "Not Found") {
              currentBlock.response.status =
                ResponseStatusCode.INTERNAL_SERVER_ERROR;
            }
          }
        });
      } else {
        currentBlock = undefined;
      }
    } else {
      currentBlock = undefined;
    }
  });
  onDestroy(() => {
    testFlowDataStoreSubscriber();
  });
  const checkIfRequestSucceed = (currentBlock) => {
    if (
      Number(currentBlock?.response?.status.split(" ")[0]) >= 200 &&
      Number(currentBlock?.response?.status.split(" ")[0]) < 300
    )
      return true;
    return false;
  };
</script>

<div
  class="request-block position-relative border-radius-4"
  style={!currentBlock
    ? ""
    : checkIfRequestSucceed(currentBlock)
    ? "border-left: 2px solid #69D696;"
    : "border-left: 2px solid #FF7878;"}
  on:mouseenter={() => {
    isAddBlockVisible = !data?.onCheckEdges(id);
  }}
>
  <Handle type="target" position={Position.Left} />
  <div class="px-3 py-2">
    <span class="text-fs-12 text-fs-10">
      {#if !currentBlock}
        <VectorIcon
          height={"12px"}
          width={"12px"}
          color={"var(--icon-primary-300)"}
        />
      {:else if checkIfRequestSucceed(currentBlock)}
        <CheckIcon2 height={"12px"} width={"12px"} color={"#69D696"} />
      {:else}
        <ExclamationIcon height={"12px"} width={"12px"} color="#FF7878" />
      {/if}
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
    {#if !currentBlock}
      {#if data?.name?.length > 0 || isRunTextVisible}
        <div class="d-flex run-txt-container">
          <InfoIcon height="8px" width="8px" />
          <p style="font-size: 8px;">Run the block to get response</p>
        </div>
      {/if}
    {/if}
  </div>
  {#if currentBlock}
    <div class="px-3 pb-2 d-flex">
      <!-- Response status -->
      <span
        class="d-flex align-items-center me-2 text-fs-8 text-{Number(
          currentBlock?.response?.status.split(' ')[0],
        ) >= 200 && Number(currentBlock?.response?.status.split(' ')[0]) < 300
          ? 'getColor'
          : 'deleteColor'}"
      >
        <DotIcon
          color={checkIfRequestSucceed(currentBlock) ? "#69D696" : "#FF7878"}
          height={"6px"}
          width={"6px"}
        />
        <span class="ms-1">
          {currentBlock?.response?.status.split(" ")[0] || ""}
        </span>
      </span>
      <!-- Response time -->
      <span
        class="d-flex align-items-center me-2 text-fs-8 text-{checkIfRequestSucceed(
          currentBlock,
        )
          ? 'getColor'
          : 'deleteColor'}"
      >
        <ClockIcon
          color={checkIfRequestSucceed(currentBlock) ? "#69D696" : "#FF7878"}
          height={"7px"}
          width={"7px"}
        />
        <span class="ms-1">
          {currentBlock?.response?.time + " ms" || ""}
        </span>
      </span>
    </div>
  {/if}
  <Handle type="source" position={Position.Right} />
  {#if isAddBlockVisible}
    <div class="add-block-btn py-5 ps-2 pe-5" style="position: absolute;   ">
      <span
        on:click={() => {
          data.onClick(id);
          isAddBlockVisible = false;
          isCreateBlockArrowHovered = false;
        }}
        on:mouseenter={() => {
          isCreateBlockArrowHovered = true;
        }}
        on:mouseleave={() => {
          isCreateBlockArrowHovered = false;
        }}
      >
        <span class="d-flex align-items-center">
          <span
            class="btnc position p-1 d-flex align-items-center justify-content-center"
          >
            <ArrowRightIcon
              height={"8px"}
              width={"8px"}
              color={isCreateBlockArrowHovered
                ? "var(--icon-secondary-100)"
                : "var(--icon-primary-300)"}
            />
          </span>
        </span>
      </span>
    </div>
  {/if}
  <!-- Dummy Add block -->
  {#if isCreateBlockArrowHovered && isAddBlockVisible}
    <div
      class="position-absolute d-flex align-items-center"
      style="right:-25px; top:50%; transform : translateX(100%) translateY(-50%); opacity:0.6;"
    >
      <div>
        <ArrowSolid />
      </div>
      <div class="request-block-dummy position-relative">
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
        <div class="px-3 py-3">
          <p
            class="bg-tertiary-190 d-flex align-items-center justify-content-between py-2 px-2 border-radius-2 mb-0 text-fs-10 text-secondary-200"
          >
            <span> Select an API Request </span>
            <span><DropdownArrow height={"8px"} width={"8px"} /></span>
          </p>
        </div>
      </div>
    </div>
  {/if}
  <!------------------->
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
  .request-block-dummy {
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
    height: 18px;
    width: 18px;
    border: 1px solid var(--border-primary-300);
    border-radius: 50%;
  }
  .btnc:hover {
    height: 18px;
    width: 18px;
    border: 1px solid var(--border-primary-300);
    background-color: var(--bg-primary-300);
    border-radius: 50%;
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
