<script lang="ts">
  import { Options, Button, Modal, notifications } from "@sparrow/library/ui";
  import { MoreVerticalRegular } from "@sparrow/library/icons";
  import { startLoading, stopLoading } from "@sparrow/common/store";
  import { Input } from "@sparrow/library/forms";
  import {
    handleTestDataDownloadDesktop,
    handleTestDataDownloadWeb,
  } from "../../../testflow-dataset-explorer/utils";
  import type { TestflowDataSetItem } from "../../../../../../@sparrow-common/src/types/workspace/testflow-dateset-tab";

  export let dataset: any;
  export let onOpenDataset: (data: TestflowDataSetItem) => void;
  export let onPerformDatasetOperations: (
    op: string,
    id: string,
    name?: string,
  ) => Promise<any>;
  export let onPreviewDataset: (data: any) => void;
  export let activeMenuId;
  export let setActiveMenuId;
  export let isWebApp;
  let showMenu;
  $: showMenu = activeMenuId === dataset.id;
  let activeWrapper: HTMLElement;
  let isDeletePopup = false;
  let deleteLoader = false;
  let isEditingName = false;
  let dataSetName = dataset?.name || dataset?.id;

  $: {
    if (!isEditingName) {
      dataSetName = dataset?.name || dataset?.id;
    }
  }

  function handleSelectClick(event: MouseEvent) {
    const selectElement = document.getElementById(
      `show-more-dataset-${dataset?.id}`,
    );
    if (selectElement && !selectElement.contains(event.target as Node)) {
      setActiveMenuId(null);
    }
  }

  function toggleMenu() {
    if (activeMenuId === dataset.id) {
      setActiveMenuId(null);
    } else {
      setActiveMenuId(dataset.id);
    }
  }

  async function handleDelete() {
    deleteLoader = true;

    const deletedName = dataset?.name;

    const res = await onPerformDatasetOperations("delete", dataset?.id);

    if (res.isSuccessful) {
      notifications.success(`"${deletedName}" test data deleted successfully.`);
    } else {
      notifications.error("Failed to delete test data. Please try again.");
    }

    deleteLoader = false;
    isDeletePopup = false;
    showMenu = false;
  }

  function formatDate(iso) {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleString();
  }

  const handleNameChange = (e: CustomEvent<string>) => {
    dataSetName = e.detail;
  };

  const handleBlur = async () => {
    if (isEditingName) {
      const trimmedNewName = dataSetName.trim();
      const trimmedOldName = (dataset?.name || dataset?.id || "").trim();

      if (trimmedNewName !== trimmedOldName && trimmedNewName.length > 0) {
        await onPerformDatasetOperations("rename", dataset?.id, trimmedNewName);
      }

      isEditingName = false;
    }
  };

  const handleExportDownload = async () => {
    showMenu = false;
    setActiveMenuId(null);
    await handleTestDataDownloadDesktop(
      dataset?.originalData?.item?.dataSet,
      dataset?.originalData?.formatType,
      dataset?.name,
    );
  };

  const handleExport = async () => {
    showMenu = false;
    setActiveMenuId(null);
    await handleTestDataDownloadWeb(
      dataset?.originalData?.item?.dataSet,
      dataset?.originalData?.formatType,
      dataset?.name,
    );
  };

  const startRename = () => {
    isEditingName = true;
    showMenu = false;
    // Focus the input after the DOM updates
    setTimeout(() => {
      const input = document.getElementById(
        `dataset-name-${dataset?.id}`,
      ) as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 0);
  };
</script>

<svelte:window
  on:click={handleSelectClick}
  on:contextmenu|preventDefault={handleSelectClick}
/>

<Modal
  title={"Delete Test Data?"}
  type={"danger"}
  width={"35%"}
  zIndex={700}
  isOpen={isDeletePopup}
  handleModalState={() => (isDeletePopup = false)}
>
  <div class="text-lightGray mb-1 text-fs-14">
    <p>
      Are you sure you want to delete
      <strong style="color:var(--text-ds-neutral-100)">
        "{dataset?.name}"
      </strong>? This file might be linked to one or more scheduled test
      executions. Deleting it could impact their results.
    </p>
  </div>

  <div class="d-flex justify-content-end gap-3 mt-1">
    <Button
      title={"Cancel"}
      type={"secondary"}
      onClick={() => (isDeletePopup = false)}
    />
    <Button
      title={"Delete"}
      type={"danger"}
      loader={deleteLoader}
      loaderText="Deleting..."
      onClick={handleDelete}
    />
  </div>
</Modal>

<tr
  class="data-row"
  on:click={() => {
    onPreviewDataset(dataset.originalData);
  }}
>
  <td>
    <div class="d-flex flex-column">
      {#if isEditingName}
        <div class="input-wrapper">
          <Input
            id={`dataset-name-${dataset?.id}`}
            variant="inline"
            size="small"
            width="130px"
            placeholder="Enter dataset name"
            bind:value={dataSetName}
            on:input={handleNameChange}
            on:blur={handleBlur}
          />
        </div>
      {:else}
        <span class="data-name text-fs-12 truncate">{dataSetName}</span>
      {/if}

      <span class="data-sub text-fs-12 text-muted"
        >{dataset?.item?.description || ""}</span
      >
    </div>
  </td>
  <td><span class="text-fs-12">{dataset?.formatType || "-"}</span></td>
  <td><span class="text-fs-12">{dataset?.fileSize || "-"}</span></td>
  <td><span class="text-fs-12">{formatDate(dataset?.lastUpdated)}</span></td>
  <td bind:this={activeWrapper}>
    {#if showMenu && !isDeletePopup}
      <div on:click|stopPropagation on:contextmenu|stopPropagation>
        <Options
          xAxis={activeWrapper.getBoundingClientRect().right - 165}
          yAxis={[
            activeWrapper.getBoundingClientRect().top - 5,
            activeWrapper.getBoundingClientRect().bottom + 5,
          ]}
          zIndex={700}
          width="120px"
          menuItems={[
            {
              onClick: startRename,
              displayText: "Rename",
              disabled: false,
              hidden: false,
            },
            {
              onClick: isWebApp ? handleExport : handleExportDownload,
              displayText: "Export",
              disabled: false,
              hidden: false,
            },
            {
              onClick: () => {
                showMenu = false;
                isDeletePopup = true;
              },
              displayText: "Delete",
              disabled: false,
              hidden: false,
            },
          ]}
        />
      </div>
    {/if}

    <div class="d-flex align-items-center gap-2">
      <Button
        tabindex={-1}
        id={`show-more-dataset-${dataset.id}`}
        size="extra-small"
        customWidth={"24px"}
        type="teritiary-regular"
        startIcon={MoreVerticalRegular}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          toggleMenu();
        }}
      />
    </div>
  </td>
</tr>

<style>
  .data-row td {
    padding: 12px;
    border-bottom: 1px solid var(--border-ds-neutral-700);
    background-color: var(--bg-ds-neutral-900);
  }
  .data-row td {
    padding: 12px;
    border-bottom: 1px solid var(--border-ds-neutral-700);
    background-color: var(--bg-ds-neutral-900);
    transition: background-color 0.2s ease;
  }

  .data-row:hover td {
    background-color: var(--bg-ds-surface-400);
    cursor: pointer;
  }

  .data-name.truncate {
    max-width: 260px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
  }
  .data-sub {
    font-size: 12px;
    color: var(--text-ds-neutral-400);
    margin-top: 2px;
  }
  /* Ensure consistent height when editing */
  .input-wrapper {
    display: inline-flex;
    align-items: center;
    max-width: 126px;
  }

  .input-wrapper :global(input) {
    margin: -2px -8px;
    width: auto !important;
    min-width: 20px;
    max-width: 126px;
    font-size: 12px;
    background-color: transparent;
    border: 1px solid var(--border-ds-neutral-700);
    border-radius: 4px;
    transition: width 0.1s ease;
  }

  /* make input width auto-adjust based on content */
  .input-wrapper :global(input) {
    width: fit-content !important;
  }
</style>
