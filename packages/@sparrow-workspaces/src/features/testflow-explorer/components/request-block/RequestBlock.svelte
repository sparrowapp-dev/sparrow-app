<script lang="ts">
  import { Handle, Position, type Node } from "@xyflow/svelte";
  import { ArrowSolid } from "../../icons";
  import {
    ArrowRightIcon,
    DotIcon,
    DropIcon,
    CheckmarkCircleRegular,
    MoreHorizontalRegular,
    ErrorCircleRegular,
    ClockRegular,
    DeleteRegular,
    RenameRegular,
    ArrowExportRegular,
    ArrowImportRegular,
  } from "@sparrow/library/icons";
  import { ChevronDownRegular } from "@sparrow/library/icons";
  import { onDestroy, onMount } from "svelte";
  import { ResponseStatusCode } from "@sparrow/common/enums";
  import { ArrowIcon } from "../../icons";
  import { ArrowSwapRegular } from "@sparrow/library/icons";
  import { InfoRegular } from "@sparrow/library/icons";
  import SelectApiRequest from "../select-api/SelectAPIRequest.svelte";
  import type { CollectionDocument } from "@app/database/database";
  import type { Observable } from "rxjs";
  import { testFlowDataStore } from "../../../../features/testflow-explorer/store/testflow";
  import { createDeepCopy } from "@sparrow/common/utils";
  import { ParseTime } from "@sparrow/common/utils";
  import type {
    TFDataStoreType,
    TFNodeStoreType,
  } from "@sparrow/common/types/workspace/testflow";
  import type { Unsubscriber } from "svelte/store";
  import { Button } from "@sparrow/library/ui";

  /**
   * The data object containing various handlers and data stores.
   */
  export let data: {
    blocks: any;
    connector: any;
    onCheckEdges: (id: string) => boolean;
    name: string;
    method: string;
    onClick: (id: string) => void;
    onContextMenu: (id: string, event: string) => void;
    onOpenAddCustomRequestModal: (id: string) => void;
    onOpenSaveNodeRequestModal: (
      nodeId: string,
      name: string,
      requestId: string,
      collectionId: string,
      method: string,
      folderId: string,
    ) => void;
    updateBlockName: (field: string, value: string) => void;
    tabId: string;
    collections: Observable<CollectionDocument[]>;
    parentDrag: boolean;
  };
  export let selected;

  /**
   * The unique identifier for the current block.
   */
  export let id;

  let isEditing = false;
  let blockName = "";
  let isAddBlockVisible = false; // State to track visibility of add block button
  let isRunTextVisible = false; // State to track visibility of run text
  let isDropHereVisible = false; // state to track if there is drag in test flow screen
  let dataBlocksSubscriber: Unsubscriber;
  let dataConnectorSubscriber: Unsubscriber;
  let req = {
    name: "",
    method: "",
  };
  let isCreateBlockArrowHovered = false;
  let moreOptionsMenu: boolean = false;
  let testflowStore: TFDataStoreType;
  let currentBlock: TFNodeStoreType | undefined;
  const parseTime = new ParseTime();

  const truncateName = (name: string, charLimit: number) => {
    return name?.length > charLimit
      ? name.substring(0, charLimit) + "..."
      : name;
  };

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

    data.onOpenSaveNodeRequestModal(
      id,
      name,
      requestId,
      collectionId,
      method,
      folderId ?? "",
    );
  };

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

  onMount(() => {
    // Subscribe to changes in the blocks
    dataBlocksSubscriber = data.blocks.subscribe((_nodes: Node) => {
      _nodes.forEach((_node) => {
        if (_node.id === id) {
          setTimeout(() => {
            req.name = _node?.data?.requestData?.name;
            req.method = _node?.data?.requestData?.method;
            blockName = _node?.data?.blockName;
          }, 10);
        }
      });
      // Update visibility of the "Add Block" button based on edge check
      setTimeout(() => {
        isAddBlockVisible = !data?.onCheckEdges(id);
      }, 10);
      isDropHereVisible = _nodes[0].data.parentDrag;
    });
    dataConnectorSubscriber = data.connector.subscribe(() => {
      // Update visibility of the "Add Block" button based on edge check
      setTimeout(() => {
        isAddBlockVisible = !data?.onCheckEdges(id);
      }, 10);
    });
  });

  onDestroy(() => {
    // Clean up the subscription on component destruction
    testFlowDataStoreSubscriber();
    dataBlocksSubscriber();
    dataConnectorSubscriber();
  });

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

  const handleClick = (item: any) => {
    if (item.onClick) item.onClick();
  };

  let moreOptions = [
    {
      name: "Rename Block",
      iconSize: "16px",
      iconColor: "var(--icon-ds-neutral-50)",
      Icon: RenameRegular,
      onClick: () => {
        isEditing = true;
      },
    },
    {
      name: "Run From Here",
      iconSize: "16px",
      iconColor: "var(--icon-ds-neutral-50)",
      Icon: ArrowExportRegular,
      onClick: () => {
        data.onContextMenu(id, "run-from-here");
      },
    },
    {
      name: "Run Till Here",
      iconSize: "16px",
      iconColor: "var(--icon-ds-neutral-50)",
      Icon: ArrowImportRegular,
      onClick: () => {
        data.onContextMenu(id, "run-till-here");
      },
    },
    {
      name: "Delete",
      iconSize: "16px",
      iconColor: "var(--icon-ds-danger-300)",
      Icon: DeleteRegular,
      onClick: () => {
        data.onContextMenu(id, "delete");
      },
    },
  ];

  const handleOpenAddCustomRequestModal = () => {
    data.onOpenAddCustomRequestModal(id);
  };
</script>

<div
  class="request-block position-relative"
  id="request-div"
  style={selected && !currentBlock?.response.status
    ? "outline: 1px solid var(--border-ds-primary-300);"
    : selected && currentBlock && checkIfRequestSucceed(currentBlock)
      ? "outline: 1px solid var(--border-ds-success-300); border:none;"
      : selected && currentBlock && !checkIfRequestSucceed(currentBlock)
        ? "outline: 1px solid var(--border-ds-danger-300); border:none;"
        : ""}
>
  <Handle
    type="target"
    position={Position.Left}
    class="connecting-dot-left"
    style="border:1px solid var(--border-ds-primary-300); background-color: var(--bg-ds-surface-600); height:6px; width:6px;"
  />
  <div
    class="d-flex px-2 align-items-center"
    style="padding-top: 6px; padding-bottom:6px; height:36px; gap:4px"
  >
    <div
      class="text-fs-12 text-fs-10 d-flex col align-items-center"
      style="gap: 4px;"
    >
      <div class="status-icon">
        {#if !currentBlock?.response?.status}
          <ArrowSwapRegular
            size={"16px"}
            color={"var(--icon-ds-neutral-200)"}
          />
        {:else if checkIfRequestSucceed(currentBlock)}
          <CheckmarkCircleRegular
            size={"16px"}
            color={"var(--icon-ds-success-400)"}
          />
        {:else}
          <ErrorCircleRegular
            size={"16px"}
            color={"var(--icon-ds-danger-300)"}
          />
        {/if}
      </div>
      {#if !isEditing}
        <span class="px-1" style="padding-top: 2px; padding-bottom:1px;">
          {truncateName(blockName, 20)}
        </span>
      {:else}
        <input
          autofocus
          type="text"
          class="rename-input"
          on:input={(e) => {
            e.preventDefault();
            e.stopPropagation();
            data.updateBlockName("blockName", e?.target?.value);
          }}
          on:change={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          on:click={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          value={blockName}
          on:blur={() => {
            if (blockName.trim().length == 0) {
              data.updateBlockName("blockName", "Untitled");
            }
            isEditing = false;
          }}
        />
      {/if}
    </div>
    <div
      style="position: relative;"
      class="d-flex justify-content-center align-items-center"
      tabindex="0"
      on:click={(e) => {
        e.stopPropagation();
        moreOptionsMenu = !moreOptionsMenu;
      }}
      on:blur={() => {
        setTimeout(() => {
          moreOptionsMenu = false;
        }, 10);
      }}
    >
      <span
        class="p-1 rounded-1 more-option-btn"
        style={moreOptionsMenu
          ? "background-color: var(--bg-ds-surface-400) !important;"
          : ""}
      >
        <MoreHorizontalRegular
          size={"16px"}
          color={"var(--icon-ds-neutral-100)"}
        />
      </span>
      {#if moreOptionsMenu}
        <div
          class="menu-container"
          style="background-color: var(--bg-ds-surface-600); z-index:1000; border-radius:4px; width:150px; position:absolute; top:30px; right:-126px;"
        >
          {#each moreOptions as item}
            <div
              class="menu-item d-flex align-items-center justify-content-start gap-2"
              style="color: {item.iconColor};"
              on:click={() => handleClick(item)}
            >
              <svelte:component
                this={item.Icon}
                size={item.iconSize}
                color={item.iconColor}
              />
              <p
                class="menu-text"
                style="
              margin: 0;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              flex: 1;
              max-width: 100px;
            "
              >
                {item.name}
              </p>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <!-- ------------ -->
  <hr class="my-0 base-line" />
  <!-- Select API option -->
  <div class="py-2 dropdown-container px-2">
    <div>
      <SelectApiRequest
        {updateNode}
        collectionData={data.collections}
        name={req.name}
        method={req.method}
        {handleOpenAddCustomRequestModal}
      />
    </div>
    {#if !currentBlock?.response?.status}
      {#if req.name?.length > 0}
        <div class="d-flex run-txt-container">
          <InfoRegular size={"16px"} color={"var(--icon-ds-neutral-400)"} />
          <p style="basic-text-message">Run the block to get response</p>
        </div>
      {/if}
    {/if}
  </div>
  <!-- ------------ -->
  <!-- Block footer -->
  {#if currentBlock?.response?.status}
    <div class="px-2 d-flex response-status-container">
      <!-- Response status -->
      <div
        class="d-flex align-items-center px-1 me-2 text-{checkIfRequestSucceed(
          currentBlock,
        )
          ? 'getColor'
          : 'deleteColor'}"
        style="gap: 6px;"
      >
        <div class="d-flex justify-content-center alin-items-center">
          <DotIcon
            color={checkIfRequestSucceed(currentBlock)
              ? "var(--text-ds-success-400)"
              : "var(--text-ds-danger-300)"}
            height={"6px"}
            width={"6px"}
          />
        </div>
        <span
          class="response-text-{checkIfRequestSucceed(currentBlock)
            ? 'success'
            : 'fail'}"
        >
          {currentBlock?.response?.status.split(" ")[0] || ""}
        </span>
      </div>
      <!-- Response time -->
      <div class="d-flex align-items-center me-2" style="gap: 6px;">
        <div class="d-flex justify-content-center alin-items-center clock-icon">
          <ClockRegular size={"16px"} color={"var(--icon-ds-neutral-200)"} />
        </div>
        <span class="response-text">
          {parseTime.convertMilliseconds(currentBlock?.response?.time) || ""}
        </span>
      </div>
    </div>
  {/if}
  <!-- ------------- -->
  <div class="">
    {#if isDropHereVisible && isAddBlockVisible}
      <div class="">
        {#if isAddBlockVisible}
          <div
            class={`drop-btn z-3`}
            on:drop={(e) => {
              e.preventDefault();
              const requestEvent = JSON.parse(
                e.dataTransfer.getData("text/plain"),
              );
              if (!requestEvent) return;
              const requestData = {
                requestId: requestEvent.requestId,
                folderId: requestEvent.folderId,
                workspaceId: requestEvent.workspaceId,
                collectionId: requestEvent.collectionId,
                name: requestEvent.name,
                method: requestEvent.method,
              };
              data.onClick(id, requestData);
            }}
          >
            <div class="d-flex align-items-center justify-content-center">
              <div class="drop">
                <ArrowIcon />
              </div>

              <span
                class="py-1 px-3 d-flex align-items-center gap-2 dashed-border"
              >
                <DropIcon
                  height={"16px"}
                  width={"16px"}
                  color={"var(--icon-primary-300)"}
                />
                <span class="py-1">Drop Here</span>
              </span>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
  <Handle
    type="source"
    position={Position.Right}
    style="border:1px solid var(--border-ds-primary-300); background-color: var(--bg-ds-surface-600); height:6px; width:6px;"
  />
  <!-- Circular arrow button by clicking this a new block adds -->
  {#if !isDropHereVisible && isAddBlockVisible}
    <div class="add-block-btn py-5 ps-2 pe-5" style="position: absolute;   ">
      <span
        style="border-radius: 50%;"
        on:click={() => {
          data.onClick(id);
          isAddBlockVisible = false;
          isCreateBlockArrowHovered = false;
        }}
      >
        <span class="d-flex align-items-center">
          <span
            class="btnc position p-1 d-flex align-items-center justify-content-center"
            on:mouseenter={() => {
              isCreateBlockArrowHovered = true;
            }}
            on:mouseleave={() => {
              isCreateBlockArrowHovered = false;
            }}
          >
            <ArrowRightIcon
              height={"10px"}
              width={"10px"}
              color={isCreateBlockArrowHovered
                ? "black"
                : "var(--icon-ds-primary-300)"}
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
          <span class="text-fs-12 text-fs-10 d-flex justify-content-center">
            <ArrowSwapRegular />
            <span class="ms-2">REST API Request</span>
          </span>
          <div>
            <MoreHorizontalRegular />
          </div>
        </div>
        <hr class="my-0 base-line" />
        <div class="px-2 py-2">
          <p
            class="dummy-dropdown d-flex align-items-center justify-content-between px-2 mb-0 text-fs-14 text-secondary-200"
          >
            <span> Select API Request </span>
            <span
              ><ChevronDownRegular
                size={"16px"}
                color={"var(--icon-ds-neutral-100)"}
              /></span
            >
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
    background-color: var(--bg-ds-surface-700);
    height: auto;
    border-radius: 0.125rem;
    font-size: 0.7rem;
    width: 222px;
    border-radius: 8px;
    outline: none;
  }
  .connecting-dot-left {
    background-color: var(--bg-ds-surface-600);
    border: 1px solid var(--border-ds-neutral-500);
  }

  .connecting-dot-left:hover {
    border: 1px solid var(--border-ds-primary-300) !important;
  }

  .connecting-dot-left:active {
    border: 1px solid var(--border-ds-primary-300) !important;
  }
  .base-line {
    border: 1px solid var(--bg-ds-surface-400);
  }
  .request-block-dummy {
    background: #eee;
    background-color: var(--bg-ds-surface-700);
    height: auto;
    border-radius: 8px;
    width: 222px;
  }
  .dummy-dropdown {
    height: 36px;
    background-color: var(--bg-ds-surface-400);
    padding-top: 6px;
    padding-bottom: 6px;
    border-radius: 4px;
  }
  .dummy-dropdown-text {
    color: var(--text-ds-neutral-400);
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: 14px;
    line-height: 18px;
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
    outline: 1px solid var(--text-ds-neutral-300);
    .add-block-btn {
      display: flex;
    }
  }
  .btnc {
    height: 18px;
    width: 18px;
    border: 1px solid var(--border-ds-primary-300);
    border-radius: 50%;
  }
  .btnc:hover {
    background-color: var(--bg-ds-primary-300);
    border-radius: 50%;
  }
  .btnc:active {
    background-color: var(--bg-ds-primary-400);
  }
  .arrow {
    padding: 8px 4px;
    display: inline-block;
  }
  .run-txt-container {
    align-items: center;
    padding-top: 10px;
    padding-right: 4px;
    padding-left: 4px;
    gap: 6px;
  }
  .run-txt-container p {
    margin-bottom: 0px;
    color: var(--text-ds-neutral-400);
  }
  .basic-text-message {
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;
  }

  .moreOption-icon {
    height: 24px;
    width: 24px;
  }
  .moreOption-icon:hover {
    background-color: var(--bg-tertiary-190);
  }
  .menu-container {
    padding: 4px;
  }
  .menu-item {
    background-color: var(--bg-ds-surface-600);
    height: 28px;
    border-radius: 4px;
    padding: 6px 8px;
    cursor: pointer;
    color: var(--text-ds-neutral-50);
    border: none;
  }
  .menu-item:hover {
    background-color: var(--bg-ds-surface-400);
  }
  .menu-item:active {
    background-color: var(--bg-ds-surface-700);
  }
  .menu-item:focus-visible {
    outline: 1px solid var(--bg-ds-primary-300);
    background-color: var(--bg-ds-surface-400);
  }
  .rename-input {
    border: none;
    background-color: transparent;
    color: var(--bg-ds-neutral-50);
    height: 24px;
    width: 150px;
    outline: none;
    border-radius: 4px !important;
    padding: 4px 3px;
    caret-color: var(--bg-ds-primary-300);
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: 12px;
  }
  .rename-input:focus {
    border: 1px solid var(--border-ds-primary-300) !important;
  }

  .drop-here-box {
    position: absolute;
    right: -300px;
    top: 00%;
    width: 200px;
    height: 200px;
  }
  .dashed-border {
    border: 1px dashed var(--border-primary-300);
  }
  .drop-btn {
    position: absolute;
    right: -2%;
    top: 50%;
    transform: translateY(-50%) translateX(100%);
    color: var(--text-primary-300);
  }
  .response-text {
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: 12px;
    color: var(--text-ds-neutral-200);
    line-height: 18px;
    margin-bottom: 2px;
  }
  .response-status-container {
    padding-bottom: 8px;
    padding-top: 4px;
  }
  .clock-icon {
    margin-bottom: 2px;
  }
  .status-icon {
    padding-left: 4px;
    padding-right: 2px;
  }
  .response-text-success {
    color: var(--text-ds-success-400);
  }
  .response-text-fail {
    color: var(--text-ds-danger-300);
  }
  .more-option-btn:hover {
    background-color: var(--bg-ds-surface-300);
  }
</style>
