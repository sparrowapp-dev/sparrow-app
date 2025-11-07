<script lang="ts">
  import { SaveRegular } from "@sparrow/library/icons";
  import { Button } from "@sparrow/library/ui";
  import { Input } from "@sparrow/library/forms";
  import { ArrowDownloadRegular } from "@sparrow/library/icons";
  import {
    handleTestDataDownloadDesktop,
    handleTestDataDownloadWeb,
  } from "../utils";

  export let tab: any;
  export let isWebApp;

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
  $: columns = datasets.length > 0 ? Object.keys(datasets[0]) : [];

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

  function handleRowClick(row: any, rowIndex: number) {
    console.log("Row clicked:", row);
    console.log("Row index:", startItem + rowIndex);
    // Handle row click - navigate or open details
  }

  function goToFirstPage() {
    currentPage = 1;
  }

  function goToPreviousPage() {
    if (currentPage > 1) currentPage--;
  }

  function goToNextPage() {
    if (currentPage < totalPages) currentPage++;
  }

  function goToLastPage() {
    currentPage = totalPages;
  }

  function changeItemsPerPage(event: Event) {
    const select = event.target as HTMLSelectElement;
    itemsPerPage = parseInt(select.value);
    currentPage = 1; // Reset to first page
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

  // Capitalize column header
  function formatColumnHeader(column: string): string {
    return column
      .split(/(?=[A-Z])|_|-/) // Split on camelCase, underscore, or hyphen
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
</script>

<!-- Header -->
<div
  class="d-flex justify-content-between align-items-center"
  style="margin: 16px;"
>
  <div class="d-flex flex-column h-100 w-100">
    <div class="d-flex justify-content-between align-items-center h-100 w-100">
      <Input
        type="text"
        size="medium"
        maxlength={100}
        width="398px"
        id="renameInputFieldTestdata"
        value={$tab?.name || ""}
        variant="inline"
        placeholder="Enter dataset name"
        disabled={false}
        on:input={(e) => console.log("Input changed:", e.target.value)}
        on:blur={() => console.log("Input blur event")}
      />

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
        <Button
          disable={false}
          startIcon={SaveRegular}
          type="secondary"
          size="medium"
          on:click={() => console.log("Save clicked")}
        />
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
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th class="row-number" style="color: var(--text-ds-neutral-400);"
              >Dataset</th
            >
            {#each columns as column}
              <th class="column-header">
                {formatColumnHeader(column)}
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each paginatedData as row, index}
            <tr class="data-row" on:click={() => handleRowClick(row, index)}>
              <td class="row-number">
                {startItem + index}
              </td>
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

    <!-- Pagination Footer -->
    <div class="pagination-footer">
      <div class="pagination-info">
        Showing {startItem}-{endItem} of {datasets.length}
      </div>

      <div class="pagination-controls">
        <select
          class="items-per-page"
          on:change={changeItemsPerPage}
          value={itemsPerPage}
        >
          <option value="10">10 per page</option>
          <option value="25">25 per page</option>
          <option value="50">50 per page</option>
          <option value="100">100 per page</option>
        </select>

        <div class="pagination-buttons">
          <button
            class="page-btn"
            on:click={goToFirstPage}
            disabled={currentPage === 1}
            aria-label="First page"
          >
            «
          </button>
          <button
            class="page-btn"
            on:click={goToPreviousPage}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            ‹
          </button>
          <button
            class="page-btn"
            on:click={goToNextPage}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            ›
          </button>
          <button
            class="page-btn"
            on:click={goToLastPage}
            disabled={currentPage === totalPages}
            aria-label="Last page"
          >
            »
          </button>
        </div>
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
    background-color: var(--bg-ds-surface-900);
    border-radius: 8px;
    overflow: hidden;
    font-family: "Inter", sans-serif;
    min-height: 400px;
  }

  .table-container {
    overflow-x: auto;
    max-height: 600px;
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
    width: 80px;
    text-align: center;
  }

  .column-header {
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
    max-width: 300px;
  }

  .cell-content {
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

  /* Pagination Footer */
  .pagination-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #1f1f1f;
    border-top: 1px solid #333;
    color: #b0b0b0;
    font-size: 13px;
  }

  .pagination-controls {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .items-per-page {
    background: #2a2a2a;
    color: #e0e0e0;
    border: 1px solid #3a3a3a;
    border-radius: 4px;
    padding: 6px 10px;
    font-size: 13px;
    cursor: pointer;
    outline: none;
  }

  .items-per-page:hover {
    border-color: #4a4a4a;
  }

  .pagination-buttons {
    display: flex;
    gap: 4px;
  }

  .page-btn {
    background: #2a2a2a;
    color: #e0e0e0;
    border: 1px solid #3a3a3a;
    border-radius: 4px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s ease;
  }

  .page-btn:hover:not(:disabled) {
    background: #3a3a3a;
    border-color: #4a4a4a;
  }

  .page-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .pagination-footer {
      flex-direction: column;
      gap: 12px;
    }

    .pagination-info {
      width: 100%;
      text-align: center;
    }

    .pagination-controls {
      width: 100%;
      justify-content: space-between;
    }
  }
</style>
