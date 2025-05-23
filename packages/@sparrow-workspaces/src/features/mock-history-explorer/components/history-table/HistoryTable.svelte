<script lang="ts">
  import {
    ArrowSortRegular,
    ChevronDoubleLeftRegular,
    ChevronDoubleRightRegular,
    ChevronDownRegular,
    ChevronLeftRegular,
    ChevronRightRegular,
  } from "@sparrow/library/icons";
  import { Button, Tooltip } from "@sparrow/library/ui";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import type { Writable } from "svelte/store";
  import { HttpStatusCodes } from "../../../../features/rest-explorer-mock/utils/http-status-codes";
  import type { RequestMethodEnum } from "@sparrow/common/types/workspace/http-request-mock-tab";
  import { Select } from "@sparrow/library/forms";
  import HistoryTableExpanded from "./sub-component/history-table-expanded/HistoryTableExpanded.svelte";

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

  export let historyItems: ApiHistoryItem[] = [];
  export let searchTerm: string = "";
  export let onRowClick: (item: ApiHistoryItem) => void = () => {};
  export let sortDirection: "asc" | "desc" = "desc";

  const expandedItems: Writable<Set<string>> = writable(new Set());
  const expandedSections: Writable<Record<string, Record<string, boolean>>> =
    writable({});

  let currentPage = 1;
  let itemsPerPage = 10;

  const ITEMS_PER_PAGE_OPTIONS = [
    { name: "10 per page", id: "10" },
    { name: "20 per page", id: "20" },
    { name: "30 per page", id: "30" },
    { name: "40 per page", id: "40" },
  ];

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

  const METHOD_COLORS = {
    GET: "var(--text-ds-success-300)",
    POST: "var(--text-ds-warning-300)",
    PUT: "var(--text-ds-secondary-300)",
    DELETE: "var(--text-ds-danger-300)",
    PATCH: "var(--bg-ds-accent-300)",
  } as const;

  const MULTIPART_CONTENT_TYPES = new Set([
    "multipart/form-data",
    "application/x-www-form-urlencoded",
  ]);

  const statusMessagesMap = new Map(
    HttpStatusCodes.map((status) => [status.id, status.name]),
  );

  $: sortedItems = getSortedItems(historyItems, sortDirection);
  $: filteredItems = getFilteredItems(sortedItems, searchTerm);
  $: totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  $: {
    if (currentPage > totalPages && totalPages > 0) {
      currentPage = 1;
    }
  }
  $: paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerTerm) ||
        item.url.toLowerCase().includes(lowerTerm) ||
        item.method.toLowerCase().includes(lowerTerm) ||
        getStatusMessage(item.responseStatus).toLowerCase().includes(lowerTerm),
    );
  }

  function handleSort() {
    sortDirection = sortDirection === "asc" ? "desc" : "asc";
  }

  function toggleRowExpand(item: ApiHistoryItem, event: MouseEvent) {
    event.stopPropagation();

    expandedItems.update((items) => {
      const newItems = new Set(items);
      if (newItems.has(item.id)) {
        newItems.delete(item.id);
      } else {
        newItems.clear();
        newItems.add(item.id);
        expandedSections.update((sections) => ({
          ...sections,
          [item.id]: {
            requestHeaders: true,
            requestBody: true,
            responseHeaders: true,
            responseBody: true,
          },
        }));
      }
      return newItems;
    });

    onRowClick(item);
  }

  function toggleSection(itemId: string, section: string, event: MouseEvent) {
    event.stopPropagation();

    expandedSections.update((sections) => ({
      ...sections,
      [itemId]: {
        ...sections[itemId],
        [section]: !sections[itemId]?.[section],
      },
    }));
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

  const getStatusColor = (statusCode: string): string =>
    statusCode ? "var(--text-ds-neutral-50)" : "var(--text-ds-danger-300)";

  const getStatusMessage = (responseStatus: string): string => {
    if (!responseStatus) return "No Response";
    return statusMessagesMap.get(responseStatus) || `${responseStatus} Unknown`;
  };

  const getMethodColor = (method: string): string =>
    METHOD_COLORS[method as keyof typeof METHOD_COLORS] ||
    "var(--text-ds-neutral-50)";

  const isMultipartContent = (contentType: string): boolean =>
    MULTIPART_CONTENT_TYPES.has((contentType ?? "").toLowerCase());

  const goToFirstPage = () => (currentPage = 1);
  const goToPreviousPage = () => currentPage > 1 && currentPage--;
  const goToNextPage = () => currentPage < totalPages && currentPage++;
  const goToLastPage = () => (currentPage = totalPages);

  const handleItemsPerPageChange = (selectedId: string) => {
    itemsPerPage = parseInt(selectedId);
    currentPage = 1;
  };
</script>

<div class="history-table-container">
  <div class="table-header-container">
    <table class="header-table">
      <thead>
        <tr>
          <th class="table-header" style="width: 44px;"></th>
          {#each COLUMNS as column}
            <th
              class="table-header {column.sortable ? 'sortable' : ''}"
              style="width: {column.width};"
              on:click={() => column.sortable && handleSort()}
            >
              <div class="header-content">
                <span>{column.label}</span>
                {#if column.sortable}
                  <span>
                    <Button
                      startIcon={ArrowSortRegular}
                      size={"extra-small"}
                      type={"teritiary-regular"}
                    />
                  </span>
                {/if}
              </div>
            </th>
          {/each}
        </tr>
      </thead>
    </table>
  </div>
  <div class="table-body-container">
    <table class="body-table">
      <tbody>
        {#each paginatedItems as item, index (item.id)}
          {@const isExpanded = $expandedItems.has(item.id)}
          {@const expandedSectionsState = $expandedSections[item.id] || {
            requestHeaders: true,
            requestBody: true,
            responseHeaders: true,
            responseBody: true,
          }}
          {@const isFirst = index === 0}
          {@const isLast = index === paginatedItems.length - 1}

          <tr
            class="history-row {isExpanded ? 'expanded' : ''} {isFirst
              ? 'first-row'
              : ''} {isLast ? 'last-row' : ''}"
          >
            <td class="icon" style="width: 44px;">
              <Tooltip
                title={isExpanded ? "Hide Details" : "View Details"}
                placement={"top-center"}
              >
                <Button
                  startIcon={isExpanded
                    ? ChevronDownRegular
                    : ChevronRightRegular}
                  size={"small"}
                  type={"teritiary-regular"}
                  onClick={(e) => toggleRowExpand(item, e)}
                />
              </Tooltip>
            </td>
            <td style="width: 15%;">{formatRelativeTime(item.timestamp)}</td>
            <td style="width: 15%;">{item.name}</td>
            <td style="width: 30%;">
              <span
                class="method-badge"
                style="color: {getMethodColor(item.method)}"
              >
                {item.method}
              </span>
              <span class="endpoint">{item.url}</span>
            </td>
            <td
              style="color: {getStatusColor(item.responseStatus)}; width: 30%;"
            >
              {getStatusMessage(item.responseStatus)}
            </td>
            <td style="width: 10%;">{formatDuration(item.duration)}</td>
          </tr>

          {#if isExpanded}
            <tr class="expanded-content-row">
              <td colspan={COLUMNS.length + 1}>
                <div class="expanded-content">
                  <div class="expanded-content-grid">
                    <div class="section-container section-left">
                      <HistoryTableExpanded
                        bodyContent={item.requestHeaders?.slice(0, -1)}
                        contentType="headers"
                        isRequestBody={true}
                        isExpanded={expandedSectionsState.requestHeaders}
                        onToggleExpand={(e) =>
                          toggleSection(item.id, "requestHeaders", e)}
                        customTitle="Request Headers"
                        showCount={item.requestHeaders?.slice(0, -1)?.length}
                      />
                    </div>

                    <div class="section-container section-right">
                      <HistoryTableExpanded
                        bodyContent={isMultipartContent(
                          item.selectedRequestBodyType,
                        )
                          ? ""
                          : item.requestBody?.raw}
                        contentType={item.selectedRequestBodyType}
                        isRequestBody={true}
                        isExpanded={expandedSectionsState.requestBody}
                        onToggleExpand={(e) =>
                          toggleSection(item.id, "requestBody", e)}
                      />
                    </div>
                  </div>

                  <div class="section-divider" />

                  <div class="expanded-content-grid">
                    <div class="section-container section-left">
                      <HistoryTableExpanded
                        bodyContent={item.responseHeaders?.slice(0, -1)}
                        contentType="headers"
                        isRequestBody={false}
                        isExpanded={expandedSectionsState.responseHeaders}
                        onToggleExpand={(e) =>
                          toggleSection(item.id, "responseHeaders", e)}
                        customTitle="Response Headers"
                        showCount={item.responseHeaders?.slice(0, -1)?.length}
                      />
                    </div>

                    <div class="section-container section-right">
                      <HistoryTableExpanded
                        bodyContent={item.responseBody}
                        contentType={item.selectedResponseBodyType}
                        isRequestBody={false}
                        isExpanded={expandedSectionsState.responseBody}
                        onToggleExpand={(e) =>
                          toggleSection(item.id, "responseBody", e)}
                      />
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  </div>

  <div class="table-footer">
    <div class="footer-left">
      <div class="pagination-info">
        Showing {Math.min(
          (currentPage - 1) * itemsPerPage + 1,
          filteredItems.length,
        )}-{Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length}
      </div>
      <div>
        <Select
          id="itemsPerPage"
          data={ITEMS_PER_PAGE_OPTIONS}
          titleId={itemsPerPage.toString()}
          zIndex={701}
          disabled={false}
          minHeaderWidth={"133px"}
          bodyTheme={"violet"}
          menuItem={"v2"}
          headerFontSize={"12px"}
          isDropIconFilled={false}
          maxBodyHeight={"196px"}
          variant={"secondary"}
          borderType={"none"}
          borderActiveType={"none"}
          borderHighlight={"hover-active"}
          headerHighlight={"hover-active"}
          headerHeight={"26px"}
          borderRounded={"4px"}
          onclick={handleItemsPerPageChange}
        />
      </div>
    </div>

    <div class="pagination-controls">
      <Button
        startIcon={ChevronDoubleLeftRegular}
        size={"small"}
        type={"teritiary-regular"}
        disable={currentPage === 1}
        onClick={goToFirstPage}
      />
      <Button
        startIcon={ChevronLeftRegular}
        size={"small"}
        type={"teritiary-regular"}
        disable={currentPage === 1}
        onClick={goToPreviousPage}
      />
      <Button
        startIcon={ChevronRightRegular}
        size={"small"}
        type={"teritiary-regular"}
        disable={currentPage === totalPages || totalPages === 0}
        onClick={goToNextPage}
      />
      <Button
        startIcon={ChevronDoubleRightRegular}
        size={"small"}
        type={"teritiary-regular"}
        disable={currentPage === totalPages || totalPages === 0}
        onClick={goToLastPage}
      />
    </div>
  </div>
</div>

<style>
  .history-table-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background-color: var(--bg-ds-surface-900);
    color: var(--text-ds-neutral-50);
  }

  .table-header-container {
    flex-shrink: 0;
    background-color: var(--bg-ds-surface-900);
    border-bottom: 1px solid var(--border-ds-surface-100);
  }

  .header-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .table-body-container {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .body-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .table-header {
    height: 40px;
    padding: 10px 16px 0 16px;
    text-align: left;
    align-items: center;
    color: var(--text-ds-neutral-400);
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
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
    border: none;
  }

  .history-row td {
    padding-inline: 16px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .history-row:hover td:first-child {
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
  }

  .history-row:hover td:last-child {
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
  }

  .history-row.expanded td:first-child {
    border-bottom-left-radius: 0;
  }

  .history-row.expanded td:last-child {
    border-bottom-right-radius: 0;
  }

  .history-row .icon {
    padding-left: 8px;
  }

  .history-row.expanded {
    background-color: var(--bg-ds-surface-700);
    border: none;
  }

  .method-badge {
    display: inline-block;
    font-weight: 600;
    margin-right: 8px;
  }

  .endpoint {
    opacity: 0.9;
  }

  .expanded-content-row td {
    padding: 0;
  }

  .expanded-content {
    padding: 8px;
    background-color: var(--bg-ds-surface-800);
    display: flex;
    flex-direction: column;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }

  .expanded-content-grid {
    display: flex;
    flex-direction: row;
  }

  .section-container {
    display: flex;
    flex-direction: column;
  }

  .section-left {
    width: 40%;
    border-right: 1px solid var(--border-ds-surface-100);
  }

  .section-right {
    width: 60%;
    padding-left: 8px;
  }

  .section-divider {
    height: 1px;
    background-color: var(--border-ds-surface-100);
    margin: 8px 0;
  }

  .table-footer {
    flex-shrink: 0;
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--text-ds-neutral-400);
    font-size: 12px;
    border-top: 1px solid var(--border-ds-surface-700);
    background-color: var(--bg-ds-surface-900);
  }

  .footer-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .pagination-controls {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .pagination-info {
    white-space: nowrap;
  }
</style>
