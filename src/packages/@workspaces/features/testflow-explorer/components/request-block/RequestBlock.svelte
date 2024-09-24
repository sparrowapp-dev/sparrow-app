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
  import { testFlowDataStore } from "@workspaces/features/testflow-explorer/store/testflow";
  import { ThreeDotIcon } from "$lib/assets/app.asset";
  import { Dropdown, Modal, Tooltip } from "@library/ui";
  import { createDeepCopy } from "$lib/utils/helpers";
  import { ParseTime } from "@common/utils";
  import type {
    TFDataStoreType,
    TFNodeStoreType,
  } from "@common/types/workspace/testflow";

  /**
   * The data object containing various handlers and data stores.
   */
  export let data: {
    onCheckEdges: (id: string) => boolean;
    name: string;
    method: string;
    onClick: (id: string) => void;
    onUpdateSelectedAPI: (
      id: string,
      name: string,
      requestId: string,
      collectionId: string,
      method: string,
      folderId?: string,
    ) => void;
    onOpenDeleteModal: () => void;
    tabId: string;
    collections: Observable<CollectionDocument[]>;
  };
  export let selected;

  /**
   * The unique identifier for the current block.
   */
  export let id;

  let isAddBlockVisible = false; // State to track visibility of add block button
  let isRunTextVisible = false; // State to track visibility of run text

  /**
   * Updates the node when an API is selected.
   * @param name - The name of the API.
   * @param requestId - The request ID.
   * @param collectionId - The collection ID.
   * @param method - The HTTP method.
   * @param [folderId] - Optional folder ID.
   */
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

  let testflowStore: TFDataStoreType;
  let currentBlock: TFNodeStoreType | undefined;

  /**
   * Testflow store subscriber to get current node status
   */
  const testFlowDataStoreSubscriber = testFlowDataStore.subscribe((val) => {
    if (val) {
      testflowStore = val.get(data.tabId) as TFDataStoreType;
      if (testflowStore?.nodes?.length >= 1) {
        testflowStore?.nodes?.forEach((element) => {
          if (element.id === id) {
            currentBlock = createDeepCopy(element);
            if (currentBlock?.response?.status === ResponseStatusCode.ERROR) {
              currentBlock.response.status = "ERR";
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
    // Clean up the subscription on component destruction
    testFlowDataStoreSubscriber();
  });

  const parseTime = new ParseTime();

  /**
   * Checks if the current request was successful based on the response status.
   * @param currentBlock - The current block of the test flow.
   * @returns True if the request succeeded, false otherwise.
   */
  const checkIfRequestSucceed = (currentBlock: TFNodeStoreType) => {
    if (
      Number(currentBlock?.response?.status.split(" ")[0]) >= 200 &&
      Number(currentBlock?.response?.status.split(" ")[0]) < 300
    )
      return true;
    return false;
  };

  let moreOptionsMenu: boolean = false;

  export let isDeleteNodeModalOpen = false;

  const handleOpenModal = () => {
    moreOptionsMenu = !moreOptionsMenu;
    data.onOpenDeleteModal(id);
  };
</script>

<div
  class="request-block position-relative border-radius-4"
  style={selected && !currentBlock
    ? "border: 2px solid var(--border-primary-300);"
    : selected && currentBlock && checkIfRequestSucceed(currentBlock)
    ? "border: 2px solid #69D696;"
    : selected && currentBlock && !checkIfRequestSucceed(currentBlock)
    ? "border: 2px solid #FF7878;"
    : !currentBlock
    ? ""
    : checkIfRequestSucceed(currentBlock)
    ? "border-left: 2px solid #69D696;"
    : "border-left: 2px solid #FF7878;"}
  on:mouseenter={() => {
    isAddBlockVisible = !data?.onCheckEdges(id);
  }}
>
  <Handle type="target" position={Position.Left} />
  <div class=" d-flex justify-content-between align-items-center px-3 py-2">
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

    <div
      style="position: relative;"
      class="ms-2 d-flex justify-content-center align-items-center moreOption-icon rounded"
      tabindex="0"
      on:click={() => {
        moreOptionsMenu = !moreOptionsMenu;
      }}
      on:blur={() => {
        moreOptionsMenu = false;
      }}
    >
      <ThreeDotIcon />

      {#if moreOptionsMenu}
        <div
          class="d-flex align-items-center justify-content-center"
          style="z-index:1000; border-radius:2px; height:29px; width:96px; background-color:#22232E; position:absolute; top:27px; right:-75px;"
        >
          <div
            class="d-flex align-items-center justify-content-start"
            style="color:#FF4646; background-color: #2E2F3D; height:23px; width:90px; border-radius:2px;"
            on:click={() => {
              handleOpenModal();
            }}
          >
            <p class="pb-0 mb-0 ps-1">Delete</p>
          </div>
        </div>
      {/if}
    </div>
  </div>
  <!-- ------------ -->
  <hr class="my-0" />
  <!-- Select API option -->
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
  <!-- ------------ -->
  <!-- Block footer -->
  {#if currentBlock}
    <div class="px-3 pb-2 d-flex">
      <!-- Response status -->
      <span
        class="d-flex align-items-center me-2 text-fs-8 text-{checkIfRequestSucceed(
          currentBlock,
        )
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
          {parseTime.convertMilliseconds(currentBlock?.response?.time) || ""}
        </span>
      </span>
    </div>
  {/if}
  <!-- ------------- -->
  <Handle type="source" position={Position.Right} />
  <!-- Circular arrow button by clicking this a new block adds -->
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
  <!-- ------------------- -->
  <!-- Dummy Add API block -->
  {#if isCreateBlockArrowHovered && isAddBlockVisible}
    <div
      class="position-absolute d-flex align-items-center"
      style="right:-28px; top:50%; transform : translateX(100%) translateY(-50%); opacity:0.6;"
    >
      <div>
        <ArrowSolid />
      </div>
      <div class="request-block-dummy position-relative">
        <div
          class="d-flex justify-content-between align-items-center px-3 py-2"
        >
          <span class="text-fs-12 text-fs-10">
            <VectorIcon
              height={"12px"}
              width={"12px"}
              color={"var(--icon-primary-300)"}
            />
            <span class="ms-2">REST API Request</span>
          </span>
          <div>
            <ThreeDotIcon />
          </div>
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
  <!-- ----------------- -->
</div>

<style lang="scss">
  .request-block {
    background: #eee;
    background-color: var(--bg-tertiary-300);
    height: auto;
    border-radius: 0.125rem;
    font-size: 0.7rem;
    width: 200px;
    border: 2px solid transparent;
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

  .moreOption-icon {
    height: 24px;
    width: 24px;
  }
  .moreOption-icon:hover {
    background-color: var(--bg-tertiary-190);
  }
</style>
