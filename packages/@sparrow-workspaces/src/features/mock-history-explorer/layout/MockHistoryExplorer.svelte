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
  import type { RequestMethodEnum } from "@sparrow/common/types/workspace/http-request-mock-tab";
  import { HttpStatusCodes } from "../../rest-explorer-mock/utils";

  interface ApiHistoryItem {
    id: string;
    timestamp: string;
    name: string;
    url: string;
    method: RequestMethodEnum;
    responseStatus: string;
    duration: number;
    requestHeaders: KeyValuePair[];
    requestBody?: any;
    responseHeaders?: KeyValuePair[];
    responseBody?: any;
    selectedRequestBodyType?: string;
    selectedResponseBodyType?: string;
  }

  interface KeyValuePair {
    key: string;
    value: string;
    checked?: boolean;
  }

  export let tab: Observable<Tab>;
  export let collection;

  let searchTerm = "";
  let sortDirection: "asc" | "desc" = "desc";

  const COLUMNS = [
    { key: "timestamp", label: "Time", sortable: true, width: "15%" },
    { key: "name", label: "Name", sortable: false, width: "15%" },
    { key: "url", label: "API Endpoint", sortable: false, width: "30%" },
    {
      key: "responseStatus",
      label: "Status Code",
      sortable: false,
      width: "30%",
    },
    { key: "duration", label: "Duration", sortable: false, width: "10%" },
  ];

  const statusMessagesMap = new Map(
    HttpStatusCodes.map((status) => [status.id, status.name]),
  );

  function getStatusMessage(responseStatus: string): string {
    if (!responseStatus) return "No Response";
    return statusMessagesMap.get(responseStatus) || `${responseStatus} Unknown`;
  }

  function formatRelativeTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "Just Now";
    } else if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60);
      return `${mins} min${mins > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hr${hours > 1 ? "s" : ""} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }
  }

  const formatDuration = (ms: number): string => `${ms}ms`;

  function getSortedItems(
    items: ApiHistoryItem[],
    direction: "asc" | "desc",
  ): ApiHistoryItem[] {
    return [...items].sort((a, b) => {
      const comparison =
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      return direction === "asc" ? comparison : -comparison;
    });
  }

  function getFilteredItems(
    items: ApiHistoryItem[],
    term: string,
  ): ApiHistoryItem[] {
    if (!term) return items;

    const lowerTerm = term.toLowerCase();
    return items.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(lowerTerm);
      const urlMatch = item.url.toLowerCase().includes(lowerTerm);
      const methodMatch = item.method.toLowerCase().includes(lowerTerm);
      const statusMatch = getStatusMessage(item.responseStatus)
        .toLowerCase()
        .includes(lowerTerm);
      const durationMatch = formatDuration(item.duration)
        .toLowerCase()
        .includes(lowerTerm);
      const timeMatch = formatRelativeTime(item.timestamp)
        .toLowerCase()
        .includes(lowerTerm);
      const methodUrlMatch = `${item.method} ${item.url}`
        .toLowerCase()
        .includes(lowerTerm);

      return (
        nameMatch ||
        urlMatch ||
        methodMatch ||
        statusMatch ||
        durationMatch ||
        timeMatch ||
        methodUrlMatch
      );
    });
  }

  function handleSort() {
    sortDirection = sortDirection === "asc" ? "desc" : "asc";
  }

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

  $: sortedItems = getSortedItems($historyItems, sortDirection);
  $: filteredItems = getFilteredItems(sortedItems, searchTerm);
  $: searchHasNoResults = searchTerm && filteredItems.length === 0;
  $: hasHistoryData =
    collection?.mockRequestHistory && collection.mockRequestHistory.length > 0;

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
</script>

{#if $tab.tabId && collection}
  <div
    class="d-flex mock-history-explorer-layout h-100"
    style="background-color: var(--bg-ds-surface-900);"
  >
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
            {sortDirection}
            {COLUMNS}
            {formatRelativeTime}
            {formatDuration}
            {getStatusMessage}
            onSort={handleSort}
            onRowClick={() => {}}
          />
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
</style>
