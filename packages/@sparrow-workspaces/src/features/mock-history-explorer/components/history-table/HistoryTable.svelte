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

  interface Column {
    key: string;
    label: string;
    sortable: boolean;
    width: string;
  }

  export let historyItems: ApiHistoryItem[] = [];
  export let searchTerm: string = "";
  export let sortDirection: "asc" | "desc" = "desc";
  export let COLUMNS: Column[] = [];
  export let formatRelativeTime: (timestamp: string) => string;
  export let formatDuration: (ms: number) => string;
  export let getStatusMessage: (responseStatus: string) => string;
  export let onSort: () => void;
  export let onRowClick: (item: ApiHistoryItem) => void = () => {};

  let expandedItems: Set<string> = new Set();
  let expandedSections: Record<string, Record<string, boolean>> = {};

  let currentPage = 1;
  let itemsPerPage = 10;

  const ITEMS_PER_PAGE_OPTIONS = [
    { name: "10 per page", id: "10" },
    { name: "20 per page", id: "20" },
    { name: "30 per page", id: "30" },
    { name: "40 per page", id: "40" },
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

  $: totalPages = Math.ceil(historyItems.length / itemsPerPage);
  $: {
    if (currentPage > totalPages && totalPages > 0) {
      currentPage = 1;
    }
  }
  $: paginatedItems = historyItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const toggleRowExpand = (item: ApiHistoryItem, event: MouseEvent) => {
    event.stopPropagation();

    // Direct manipulation of the Set - Svelte will detect the change
    if (expandedItems.has(item.id)) {
      expandedItems.delete(item.id);
    } else {
      expandedItems.clear();
      expandedItems.add(item.id);
      expandedSections = {
        ...expandedSections,
        [item.id]: {
          requestHeaders: true,
          requestBody: true,
          responseHeaders: true,
          responseBody: true,
        },
      };
    }
    // Trigger reactivity
    expandedItems = expandedItems;

    onRowClick(item);
  };

  const toggleSection = (
    itemId: string,
    section: string,
    event: MouseEvent,
  ) => {
    event.stopPropagation();

    expandedSections = {
      ...expandedSections,
      [itemId]: {
        ...expandedSections[itemId],
        [section]: !expandedSections[itemId]?.[section],
      },
    };
  };

  const getStatusColor = (statusCode: string): string =>
    statusCode ? "var(--text-ds-neutral-50)" : "var(--text-ds-danger-300)";

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

<div
  class="h-100 w-100 d-flex flex-column"
  style="color: var(--text-ds-neutral-50);"
>
  <div style="border-bottom: 1px solid var(--border-ds-surface-100);">
    <table style="width: 100%; table-layout: fixed;">
      <thead>
        <tr>
          <th
            class="table-header align-items-center text-fs-12"
            style="width: 44px;"
          ></th>
          {#each COLUMNS as column}
            <th
              class="table-header align-items-center text-fs-12"
              style="width: {column.width};"
            >
              <div class="d-flex align-items-center justify-content-between">
                <span>{column.label}</span>
                {#if column.sortable}
                  <span>
                    <Button
                      startIcon={ArrowSortRegular}
                      size={"extra-small"}
                      type={"teritiary-regular"}
                      onClick={() => {
                        column.sortable && onSort();
                      }}
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
  <div style="flex: 1; overflow-y: auto;">
    <table style="width: 100%; table-layout: fixed;">
      <tbody>
        {#each paginatedItems as item, index (item.id)}
          {@const isExpanded = expandedItems.has(item.id)}
          {@const expandedSectionsState = expandedSections[item.id] || {
            requestHeaders: true,
            requestBody: true,
            responseHeaders: true,
            responseBody: true,
          }}
          {@const isFirst = index === 0}
          {@const isLast = index === paginatedItems.length - 1}

          <tr
            class="history-row text-fs-12 text-ds-font-weight-semi-bold {isExpanded
              ? 'expanded'
              : ''} {isFirst ? 'first-row' : ''} {isLast ? 'last-row' : ''}"
          >
            <td class="ps-2" style="width: 44px;">
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
                class="d-inline-block text-fs-9 fw-semibold me-2"
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
            <tr>
              <td colspan={COLUMNS.length + 1}>
                <div class="expanded-content d-flex flex-column p-2">
                  <div class="d-flex flex-row">
                    <div
                      class="d-flex flex-column"
                      style="width: 40%;  border-right: 1px solid var(--border-ds-surface-100);"
                    >
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

                    <div class="d-flex flex-column ps-2" style="width: 60%;">
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

                  <div class="d-flex flex-row">
                    <div
                      class="d-flex flex-column"
                      style="width: 40%;  border-right: 1px solid var(--border-ds-surface-100);"
                    >
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

                    <div class="d-flex flex-column ps-2" style="width: 60%;">
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

  <div
    class="table-footer d-flex justify-content-between align-items-center text-ds-font-size-12"
  >
    <div class="d-flex align-items-center gap-3">
      <div>
        Showing {Math.min(
          (currentPage - 1) * itemsPerPage + 1,
          historyItems.length,
        )}-{Math.min(currentPage * itemsPerPage, historyItems.length)} of {historyItems.length}
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

    <div class="d-flex align-items-center gap-1">
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
  .table-header {
    height: 40px;
    padding: 10px 16px 0 16px;
    color: var(--text-ds-neutral-400);
    font-weight: 600;
  }

  .history-row {
    border-bottom: 1px solid var(--border-ds-surface-600);
    height: 36px;
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

  .history-row.expanded {
    background-color: var(--bg-ds-surface-700);
    border: none;
  }

  .expanded-content {
    background-color: var(--bg-ds-surface-800);
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }

  .section-divider {
    height: 1px;
    background-color: var(--border-ds-surface-100);
    margin: 8px 0;
  }

  .table-footer {
    padding: 12px 16px;
    color: var(--text-ds-neutral-400);
    border-top: 1px solid var(--border-ds-surface-700);
  }
</style>
