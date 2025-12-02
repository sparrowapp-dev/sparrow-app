<script lang="ts">
  import { SaveRegular } from "@sparrow/library/icons";
  import { Button, notifications, Tooltip } from "@sparrow/library/ui";
  import { Input } from "@sparrow/library/forms";
  import { ArrowDownloadRegular } from "@sparrow/library/icons";
  import {
    handleTestDataDownloadDesktop,
    handleTestDataDownloadWeb,
  } from "../utils";
  import { Pagination } from "@sparrow/library/ui";
  import { onDestroy, onMount } from "svelte";

  export let tab: any;
  export let isWebApp;
  export let onUpdateName;
  export let onSaveDataset;
  export let onRenameDataset;
  export let isWorkspaceViewer;

  let testDataName: string;

  $: testDataName = $tab?.name || "";

  const handleExport = async () => {
    await handleTestDataDownloadWeb(
      $tab?.property?.testflowDataSet?.item?.dataSet,
      $tab?.property?.testflowDataSet?.formatType,
      $tab?.property?.testflowDataSet?.name,
    );
  };

  const handleExportDownload = async () => {
    await handleTestDataDownloadDesktop(
      $tab?.property?.testflowDataSet?.item?.dataSet,
      $tab?.property?.testflowDataSet?.formatType,
      $tab?.property?.testflowDataSet?.name,
    );
  };

  // Convert UTC date string → local date-time
  const formatLocalDate = (utcDate: string) => {
    if (!utcDate) return "";
    const date = new Date(utcDate);
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Reactive data source from tab
  $: datasets = $tab?.property?.testflowDataSet?.item?.dataSet || [];

  // Pagination
  let currentPage = 1;
  let itemsPerPage = 10;

  // Get column headers dynamically from first object
  $: columns = Array.isArray(datasets)
    ? Array.from(new Set(datasets.flatMap((obj) => Object.keys(obj))))
    : [];

  // Paginated data
  $: paginatedData = datasets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  $: totalPages = Math.ceil(datasets.length / itemsPerPage);
  $: startItem = datasets.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  $: endItem = Math.min(currentPage * itemsPerPage, datasets.length);

  // Reset to first page when data changes
  $: if (datasets) {
    currentPage = 1;
  }
  let originalName = "";
  $: if ($tab?.name && originalName === "" && $tab.isSaved) {
    originalName = $tab?.name;
  }

  $: isSaveDisabled = (testDataName ?? "").trim().length === 0 || $tab?.isSaved;

  function handleTestDataHeadingChange(_name, event) {
    onUpdateName(_name, event);
  }

  async function handleSave() {
    const res = await onRenameDataset($tab?.id, testDataName);
    if (res?.isSuccessful) {
      isSaveDisabled = true;
      originalName = $tab.name;
      notifications.success(`Changes Saved for "${testDataName}" test data.`);
      if (onSaveDataset) {
        await onSaveDataset();
      }
    } else {
      notifications.error("Failed to save changes. Please try again.");
    }
  }

  onMount(() => {
    window.addEventListener("keydown", handleKeyDown);
  });

  onDestroy(() => {
    window.removeEventListener("keydown", handleKeyDown);
  });

  const handleKeyDown = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "s") {
      event.preventDefault();
      const canSave =
        !isSaveDisabled && !$tab?.isSaved && !isWorkspaceViewer && $tab?.tabId;

      if (canSave && $tab?.tabId) {
        handleSave();
      }
    }
  };

  function handleRowClick(row: any, rowIndex: number) {
    // Handle row click - navigate or open details
  }

  // Format value for display
  function formatValue(value: any): string {
    if (value === null || value === undefined) return "-";
    if (typeof value === "object") return JSON.stringify(value);
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
  }

  // Truncate long text
  function truncateText(text: string, maxLength: number = 50): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }
</script>

<!-- Header -->
<div
  class="d-flex justify-content-between align-items-center"
  style="margin: 16px; padding-bottom: 8px;"
>
  <div class="d-flex flex-column h-100 w-100">
    <div class="d-flex justify-content-between align-items-center h-100 w-100">
      <div class="input-small-placeholder">
        <Input
          type="text"
          size="large"
          maxlength={100}
          width="300px"
          id="renameInputFieldTestdata"
          bind:value={testDataName}
          variant="inline"
          placeholder="Enter dataset name"
          disabled={isWorkspaceViewer}
          on:input={() => handleTestDataHeadingChange(testDataName, "")}
          on:blur={() => handleTestDataHeadingChange(testDataName, "blur")}
        />
      </div>

      <div class="d-flex gap-2">
        {#if !isWebApp}
          <Button
            id="export-file"
            disable={false}
            title="Export"
            type="secondary"
            size="medium"
            startIcon={ArrowDownloadRegular}
            onClick={handleExportDownload}
          />
        {:else}
          <Button
            id="export-file"
            disable={false}
            title="Export"
            type="secondary"
            size="medium"
            startIcon={ArrowDownloadRegular}
            onClick={handleExport}
          />
        {/if}
        {#if !isWorkspaceViewer}
          <Tooltip title="Save" placement="top-center">
            <Button
              disable={isSaveDisabled}
              startIcon={SaveRegular}
              type="secondary"
              size="medium"
              onClick={handleSave}
            />
          </Tooltip>
        {/if}
      </div>
    </div>

    <div
      class="header-subtext mt-1 d-flex align-items-center gap-2"
      style="margin-left: 8px;"
    >
      <span
        >File Type: {$tab?.property?.testflowDataSet?.formatType || "N/A"}</span
      >
      <span style="margin: 0 6px;">•</span>
      <span
        >Last updated {formatLocalDate(
          $tab?.property?.testflowDataSet?.updatedAt,
        )}</span
      >
      <span style="margin: 0 6px;">•</span>
      <span>Size: {$tab?.property?.testflowDataSet?.fileSize || "—"}</span>
    </div>
  </div>
</div>

<div class="table-wrapper" style="margin: 16px;">
  {#if datasets.length > 0}
    <div class="table-area">
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th
                class="row-number"
                style="color: var(--text-ds-neutral-400); font-size: 12px;"
              >
                Dataset
              </th>
              {#each columns as column}
                <th class="column-header">
                  {column}
                </th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each paginatedData as row, index}
              <tr class="data-row" on:click={() => handleRowClick(row, index)}>
                <td class="row-number">{startItem + index}</td>
                {#each columns as column}
                  <td class="data-cell">
                    <span class="cell-content" title={formatValue(row[column])}>
                      {truncateText(formatValue(row[column]))}
                    </span>
                  </td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      <div class="pagination-wrapper">
        <Pagination
          {currentPage}
          {itemsPerPage}
          totalItems={datasets.length}
          onPageChange={(page) => (currentPage = page)}
          onItemsPerPageChange={(newLimit) => {
            itemsPerPage = newLimit;
            currentPage = 1;
          }}
          itemsPerPageOptions={[10, 25, 50, 100]}
          showItemCount={true}
          containerWidth="100%"
        />
      </div>
    </div>
  {:else}
    <div class="empty-state">
      <div class="empty-icon">📊</div>
      <div class="empty-title">No data available</div>
      <div class="empty-text">
        {#if !$tab?.property?.testflowDataSet}
          No dataset found in the current tab
        {:else}
          The dataset is empty
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  :global(.input-small-placeholder input::placeholder) {
    font-size: 16px !important;
  }

  .header-subtext {
    font-family: "Inter", sans-serif;
    font-weight: 700;
    font-style: normal;
    font-size: 12px;
    line-height: 1.3;
    letter-spacing: 0;
    color: var(--text-ds-neutral-200);
  }
  .table-wrapper {
    display: flex;
    flex-direction: column;
    background-color: var(--bg-ds-surface-900);
    border-radius: 8px;
    font-family: "Inter", sans-serif;
    min-height: 400px;
    height: calc(100vh - 190px);
    overflow: hidden;
  }

  .table-area {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  .table-container {
    flex: 1;
    overflow: auto;
  }

  .pagination-wrapper {
    flex-shrink: 0;
    background: var(--bg-ds-surface-900);
    padding: 4px 4px;
    position: sticky;
    bottom: 0;
    z-index: 5;
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;
    color: #e0e0e0;
    font-size: 14px;
  }

  thead {
    background-color: var(--bg-ds-surface-900);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  th {
    padding: 12px 16px;
    text-align: left;
    font-weight: 600;
    color: var(--text-ds-neutral-50);
    border-bottom: 1px solid var(--border-ds-surface-600);
    white-space: nowrap;
  }

  .row-number {
    font-size: 12px;
    font-weight: 600;
    width: 80px;
    text-align: center;
  }

  .column-header {
    font-size: 12px;
    color: var(--text-ds-neutral-400);
    min-width: 120px;
  }

  tbody tr {
    border-bottom: 1px solid var(--border-ds-surface-600);
  }

  .data-row {
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .data-row:hover {
    background-color: var(--bg-ds-surface-600);
  }

  td {
    padding: 12px 16px;
    vertical-align: middle;
  }

  .data-cell {
    padding: 16px;
    max-width: 300px;
  }

  .cell-content {
    font-size: 12px;
    font-weight: 600;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Empty State */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: #666;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  .empty-title {
    font-size: 18px;
    font-weight: 600;
    color: #888;
    margin-bottom: 8px;
  }

  .empty-text {
    font-size: 14px;
    color: #666;
    text-align: center;
  }
</style>
