<script lang="ts">
  import { Button } from "@sparrow/library/ui";
  import {
    DocumentRegular,
    ArrowExpandRegular,
    DismissRegular,
  } from "@sparrow/library/icons";

  export let isOpen = false;
  export let testDataSet = null;
  export let onClose;
  export let onOpenTestflowDataSetTab = null;

  let selectedCellContent = null;
  let cellModalPosition = { x: 0, y: 0 };

  function handleCellClick(content, e) {
    selectedCellContent = content;
    cellModalPosition = {
      x: e.clientX + 10,
      y: e.clientY + 10,
    };
  }

  function closeCellModal() {
    selectedCellContent = null;
  }

  // Updated function to pass complete dataset object
  function handleExpandDataSet() {
    if (onOpenTestflowDataSetTab && testDataSet) {
      // Pass the complete testDataSet object instead of just the ID
      onOpenTestflowDataSetTab(testDataSet);
      // Close the modal after opening the new tab
      onClose();
    }
  }

  // Extract data from testDataSet
  $: parsedData = (() => {
    if (!testDataSet?.item?.dataSet) return [];
    return testDataSet.item.dataSet;
  })();

  $: columns = parsedData.length > 0 ? Object.keys(parsedData[0]) : [];

  // Format file size
  function formatFileSize(size) {
    if (!size) return "0 KB";
    const sizeStr = size.toString().toLowerCase();
    if (sizeStr.includes("kb")) return size;
    if (sizeStr.includes("mb")) return size;
    // Assume it's in bytes and convert to KB
    const bytes = parseFloat(size);
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  // Format date
  function formatDate(dateStr) {
    if (!dateStr) return "Unknown";
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffMinutes < 1) return "a few seconds ago";
      if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
      if (diffMinutes < 1440)
        return `${Math.floor(diffMinutes / 60)} hours ago`;

      return date.toLocaleDateString();
    } catch {
      return "Unknown";
    }
  }
</script>

{#if isOpen}
  <!-- Modal Backdrop -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="modal-backdrop" on:click={onClose}>
    <!-- Modal Content -->
    <div class="modal-content" on:click|stopPropagation>
      <div class="file-preview-container">
        <div class="file-preview-header">
          <div class="file-header-left">
            <div class="file-name">
              <DocumentRegular />
              {testDataSet?.name || "Test Data"}
            </div>
            <div class="file-meta">
              Last updated {formatDate(testDataSet?.updatedAt)} • Size {formatFileSize(
                testDataSet?.fileSize,
              )} •
              {parsedData.length} rows
            </div>
          </div>

          <div class="file-header-actions">
            <Button
              type="secondary"
              size="small"
              startIcon={ArrowExpandRegular}
              onClick={handleExpandDataSet}
            />
            <Button
              type="secondary"
              size="small"
              startIcon={DismissRegular}
              onClick={onClose}
            />
          </div>
        </div>

        <div class="file-preview-csv">
          <div class="table-container">
            {#if parsedData.length > 0}
              <table class="data-table">
                <thead>
                  <tr>
                    <th class="row-number">#</th>
                    {#each columns as column}
                      <th>{column}</th>
                    {/each}
                  </tr>
                </thead>
                <tbody>
                  {#each parsedData as row, index}
                    <tr>
                      <td class="row-number">{index + 1}</td>
                      {#each columns as column}
                        <td
                          class="table-cell-clickable"
                          on:click={(e) => handleCellClick(row[column], e)}
                          title="Click to view full content"
                        >
                          {row[column] ?? "-"}
                        </td>
                      {/each}
                    </tr>
                  {/each}
                </tbody>
              </table>
            {:else}
              <div class="empty-state">
                <div class="empty-text">No data available</div>
              </div>
            {/if}
          </div>
        </div>

        {#if selectedCellContent !== null}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div class="cell-modal-overlay" on:click={closeCellModal}>
            <div
              class="cell-modal"
              style="left: {cellModalPosition.x}px; top: {cellModalPosition.y}px;"
              on:click|stopPropagation
            >
              <div class="cell-modal-header">
                <button class="cell-modal-close" on:click={closeCellModal}>
                  <DismissRegular />
                </button>
              </div>
              <div class="cell-modal-content">
                {selectedCellContent}
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: var(--bg-ds-surface-900);
    border-radius: 8px;
    width: 90vw;
    max-width: 1200px;
    height: 80vh;
    overflow: hidden;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }

  .file-preview-container {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .file-preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-ds-surface-600);
    background: var(--bg-ds-surface-800);
  }

  .file-header-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .file-name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-ds-neutral-50);
  }

  .file-meta {
    font-size: 12px;
    color: var(--text-ds-neutral-400);
  }

  .file-header-actions {
    display: flex;
    gap: 8px;
  }

  .file-preview-csv {
    flex: 1;
    overflow: hidden;
    padding: 16px 20px;
  }

  .table-container {
    height: 100%;
    overflow: auto;
    border: 1px solid var(--border-ds-surface-600);
    border-radius: 8px;
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    color: var(--text-ds-neutral-200);
  }

  .data-table thead {
    background: var(--bg-ds-surface-700);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .data-table th,
  .data-table td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid var(--border-ds-surface-600);
  }

  .data-table th {
    font-weight: 600;
    color: var(--text-ds-neutral-100);
    background: var(--bg-ds-surface-700);
  }

  .row-number {
    width: 60px;
    text-align: center !important;
    color: var(--text-ds-neutral-400);
    font-weight: 500;
  }

  .data-table tbody tr:hover {
    background: var(--bg-ds-surface-600);
  }

  .table-cell-clickable {
    cursor: pointer;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .table-cell-clickable:hover {
    background: var(--bg-ds-surface-500);
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
  }

  .empty-text {
    color: var(--text-ds-neutral-400);
    font-size: 16px;
  }

  .cell-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2000;
  }

  .cell-modal {
    position: absolute;
    background: var(--bg-ds-surface-800);
    border: 1px solid var(--border-ds-surface-600);
    border-radius: 8px;
    min-width: 200px;
    max-width: 400px;
    max-height: 300px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    z-index: 2001;
  }

  .cell-modal-header {
    display: flex;
    justify-content: flex-end;
    padding: 8px;
    border-bottom: 1px solid var(--border-ds-surface-600);
  }

  .cell-modal-close {
    background: none;
    border: none;
    color: var(--text-ds-neutral-400);
    cursor: pointer;
    padding: 4px;
  }

  .cell-modal-content {
    padding: 12px;
    color: var(--text-ds-neutral-200);
    word-wrap: break-word;
    font-size: 14px;
    max-height: 250px;
    overflow-y: auto;
  }
</style>
