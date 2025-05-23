<script lang="ts">
  import { Button } from "@sparrow/library/ui";
  import type { Observable } from "rxjs";
  import type { Tab } from "@sparrow/common/types/workspace/tab";
  import {
    ArrowClockWiseRegular,
    HistoryRegular,
  } from "@sparrow/library/icons";
  import { writable } from "svelte/store";
  import { Search } from "@sparrow/library/forms";
  import { HistoryTable } from "../components";
  // import type { CollectionDocument, TabDocument } from "@app/database/database";

  export let tab: Observable<Tab>;
  // export let tab: TabDocument;

  export let collection;

  let searchTerm = "";

  $: historyItems = writable(
    (collection?.mockRequestHistory || []).sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    ),
  );

  $: if (collection?.mockRequestHistory) {
    historyItems.set(
      [...collection.mockRequestHistory].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    );
  }

  function handleRefresh() {
    if (collection?.mockRequestHistory) {
      historyItems.set(
        [...collection.mockRequestHistory].sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        ),
      );
    }
  }

  $: filteredItems = searchTerm
    ? $historyItems.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.method?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.responseStatus?.toString().includes(searchTerm),
      )
    : $historyItems;

  $: searchHasNoResults = searchTerm && filteredItems.length === 0;

  $: hasHistoryData =
    collection?.mockRequestHistory && collection.mockRequestHistory.length > 0;
</script>

{#if $tab.tabId && collection}
  <div class="d-flex mock-history-explorer-layout h-100">
    <div class="w-100 d-flex flex-column h-100 p-3 pb-0 gap-3">
      <div class="d-flex justify-content-between align-items-center">
        <p
          class="text-ds-font-size-20 text-ds-line-height-120 text-ds-font-weight-semi-bold mb-0"
        >
          History
        </p>
        <div class="d-flex gap-2">
          <Search
            variant="primary"
            size="medium"
            id="search-history"
            placeholder="Search"
            customWidth=""
            bind:value={searchTerm}
          />
          <Button
            startIcon={ArrowClockWiseRegular}
            type="secondary"
            size="medium"
            iconSize={20}
            onClick={handleRefresh}
          />
        </div>
      </div>
      {#if !hasHistoryData}
        <div
          style="flex:1; overflow:auto;"
          class="d-flex align-items-center justify-content-center"
        >
          <div class="d-flex flex-column align-items-center gap-4">
            <HistoryRegular
              size={"32px"}
              color={"var(--text-ds-neutral-400)"}
            />
            <p
              style="color: var(--text-ds-neutral-400);"
              class="text-ds-font-size-12"
            >
              No requests yet. Run a request in this collection to see it here.
            </p>
          </div>
        </div>
      {:else if searchHasNoResults}
        <div
          style="flex:1; overflow:auto;"
          class="d-flex align-items-center justify-content-center"
        >
          <div class="d-flex flex-column align-items-center gap-4">
            <HistoryRegular
              size={"32px"}
              color={"var(--text-ds-neutral-400)"}
            />
            <p
              style="color: var(--text-ds-neutral-400);"
              class="text-ds-font-size-12"
            >
              No results found.
            </p>
          </div>
        </div>
      {:else}
        <div style="flex:1; overflow:auto;">
          <HistoryTable
            historyItems={filteredItems}
            {searchTerm}
            onRowClick={() => {}}
          />
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .mock-history-explorer-layout {
    background-color: var(--bg-ds-surface-900);
  }

  .history-table-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background-color: var(--bg-ds-surface-900);
    color: var(--text-ds-neutral-50);
    overflow: auto;
  }

  .history-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .table-header {
    height: 36px;
    padding: 10px 16px 0 16px;
    text-align: left;
    align-items: center;
    color: var(--text-ds-neutral-400);
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    border-bottom: 1px solid var(--border-ds-surface-100);
    cursor: default;
  }

  .table-header.sortable {
    cursor: pointer;
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .history-row {
    border-bottom: 1px solid var(--border-ds-surface-600);
    height: 36px;
    font-size: 12px;
    font-weight: 500;
  }

  .history-row:hover {
    background-color: var(--bg-ds-surface-600);
  }

  .history-row td {
    padding-inline: 16px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .history-row .icon {
    padding: 0px;
    padding-left: 8px;
  }

  .history-row.expanded {
    background-color: var(--bg-ds-surface-700);
  }

  .method-badge {
    display: inline-block;
    font-weight: 600;
    margin-right: 8px;
  }

  .endpoint {
    opacity: 0.9;
  }

  /* Expanded content styles */
  .expanded-content-row td {
    padding: 0;
    border-bottom: 1px solid var(--border-ds-surface-700);
  }

  .expanded-content {
    padding: 8px;
    background-color: var(--bg-ds-surface-800);
    display: flex;
    flex-direction: column;
  }

  .expanded-content-grid {
    display: flex;
    flex-direction: row;
  }

  .empty-state {
    padding-left: 16px;
    color: var(--text-ds-neutral-200);
    font-size: 12px;
  }

  .empty-table {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
  }

  .empty-icon {
    margin-bottom: 16px;
    color: var(--text-ds-neutral-400);
  }

  .empty-text {
    color: var(--text-ds-neutral-400);
    font-size: 12px;
  }

  .table-footer {
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    color: var(--text-ds-neutral-400);
    font-size: 12px;
    border-top: 1px solid var(--border-ds-surface-700);
  }
</style>
