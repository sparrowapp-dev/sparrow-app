<script lang="ts">
  import { Options, Button, Modal } from "@sparrow/library/ui";
  import { MoreVerticalRegular } from "@sparrow/library/icons";
  import { startLoading, stopLoading } from "@sparrow/common/store";
  import { Input } from "@sparrow/library/forms";

  export let dataset: any;
  export let onOpenDataset: (ds: any) => void;
  export let onPerformDatasetOperations: (
    op: string,
    id: string,
    name?: string,
  ) => Promise<any>;

  let showMenu = false;
  let activeWrapper: HTMLElement;
  let isDeletePopup = false;
  let deleteLoader = false;
  let isEditingName = false;
  let dataSetName = dataset?.name || dataset?.id;

  $: {
    console.log("Dataset Row Rendered:", dataset);
    if (!isEditingName) {
      dataSetName = dataset?.name || dataset?.id;
    }
  }

  function rightClickContextMenu() {
    setTimeout(() => {
      showMenu = !showMenu;
    }, 50);
  }

  async function handleDelete() {
    deleteLoader = true;
    await onPerformDatasetOperations("delete", dataset?.id);
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
      await onPerformDatasetOperations("rename", dataset?.id, dataSetName);
      isEditingName = false;
    }
  };

  const startRename = () => {
    isEditingName = true;
    showMenu = false;
  };
</script>

<svelte:window on:click={() => (showMenu = false)} />

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
      <strong style="color:var(--text-ds-neutral-50)">
        "{dataset?.item?.dataSet?.[0]?.name || dataset?.id}"
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
      onClick={handleDelete}
    />
  </div>
</Modal>

<tr class="data-row" on:click={() => onOpenDataset && onOpenDataset(dataset)}>
  <td>
    <div class="d-flex flex-column">
      {#if isEditingName}
        <Input
          id="dataset-name"
          variant="inline"
          size="small"
          placeholder="Enter dataset name"
          bind:value={dataSetName}
          on:input={handleNameChange}
          on:blur={handleBlur}
        />
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
    {#if showMenu}
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
            onClick: async () =>
              onPerformDatasetOperations("export", dataset.id),
            displayText: "Export",
            disabled: false,
            hidden: false,
          },
          {
            onClick: () => (isDeletePopup = true),
            displayText: "Delete",
            disabled: false,
            hidden: false,
          },
        ]}
      />
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
          rightClickContextMenu();
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
</style>
