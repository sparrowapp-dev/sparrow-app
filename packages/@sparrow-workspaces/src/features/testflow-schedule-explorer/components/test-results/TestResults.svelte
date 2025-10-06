<script lang="ts">
  import { ArrowSortRegular } from "@sparrow/library/icons";
  import Result from "./sub-components/Result.svelte";
  import Pagination from "../../../../../../@sparrow-library/src/ui/pagination/Pagination.svelte";
  import EmptyTestResult from "./sub-components/EmptyTestResult.svelte";
  export let schedule;

  let openMenuFor: string | null = null;
  let activeWrapper: HTMLElement | null = null;
  let currentPage = 1;
  let itemsPerPage = 10;
  let sortDirection: "asc" | "desc" = "desc";

  $: totalItems = schedule?.schedularRunHistory?.length || 0;

  function parseRunTime(time: string | number): number {
    if (!time) return 0;
    if (typeof time === "number") return time;
    const val = parseFloat(time);
    if (isNaN(val)) return 0;
    if (time.toLowerCase().includes("ms")) {
      return val;
    } else if (time.toLowerCase().includes("s")) {
      return val * 1000;
    } else {
      return val;
    }
  }

  $: sortedHistory = schedule?.schedularRunHistory
    ? [...schedule.schedularRunHistory].sort((a, b) => {
      const timeA = parseRunTime(a.totalTime);
      const timeB = parseRunTime(b.totalTime);
      return sortDirection === "asc" ? timeA - timeB : timeB - timeA;
      })
    : [];

  $: paginatedHistory = sortedHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  function toggleSort() {
    sortDirection = sortDirection === "asc" ? "desc" : "asc";
    currentPage = 1;
  }

  export let onDeleteTestflowScheduleHistory;
  export let onScheduleRunview;
  export let isTestflowScheduleEditable;

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    const datePart = date.toLocaleDateString("en-US", options);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;
    return `${datePart} at ${hours}:${minutes} ${ampm}`;
  }

  function getRunType(flowName: string) {
    const parts = flowName.split("-");
    return parts.length > 1 ? parts[parts.length - 1].trim() : "";
  }
</script>

{#if schedule?.schedularRunHistory && schedule.schedularRunHistory.length > 0}
  <div class="d-flex flex-column h-100 content-wrapper">
    <div class="table-area" style="flex:1; overflow:auto;">
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Run Time</th>
              <th on:click={toggleSort} class="sortable">
                <span class:active-sort={sortDirection === "asc"}>
                  <ArrowSortRegular size="20px" />
                </span>
              </th>
              <th>Status</th>
              <th>Total Requests</th>
              <th>Result</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {#each paginatedHistory as r}
              <Result
                {onScheduleRunview}
                {onDeleteTestflowScheduleHistory}
                {r}
                {schedule}
                {formatDate}
                {getRunType}
                {isTestflowScheduleEditable}
              />
            {/each}
          </tbody>
        </table>
      </div>
    </div>
    <div class="pagination-wrapper">
      <Pagination
        {currentPage}
        {itemsPerPage}
        {totalItems}
        onPageChange={(page) => (currentPage = page)}
        onItemsPerPageChange={(newLimit) => (itemsPerPage = newLimit)}
      />
    </div>
  </div>
{:else}
  <EmptyTestResult />
{/if}

<style lang="scss">
  .content-wrapper {
    display: flex;
    flex-direction: column;
    // position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
  }

  .table-area {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .pagination-wrapper {
    flex-shrink: 0;
    width: 100%;
    background: var(--bg-ds-surface-900, #111);
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 10;
  }

  .table-container {
    flex: 1;
    width: 100%;
    overflow-y: auto;
    overflow-x: auto;
    min-height: 0;
    position: relative;
  }
  .custom-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    border-bottom: 1px solid var(--border-ds-surface-200);
    thead {
      position: sticky;
      top: 0;
      background: var(--bg-ds-surface-900, #111);
      z-index: 5;
      color: var(--text-secondary-200);
    }
    th,
    td {
      padding: 8px 12px;
      text-align: center;
    }
    th:first-child,
    td:first-child {
      text-align: left;
    }
    .icon-col {
      width: 40px;
      text-align: center;
    }
    tr {
      border-bottom: 1px solid var(--border-ds-surface-200);
    }
  }

  .custom-table th.sortable span {
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 24px;
    width: 24px;
    user-select: none;
    vertical-align: middle;
    line-height: 0;
    color: var(--text-secondary-200);
    transition: color 0.2s ease;
  }

  .custom-table th.sortable span.active-sort {
    color: var(--accent-primary);
  }

  .custom-table th.sortable:hover {
    color: var(--text-primary-300);
  }

  .options-focus-wrapper {
    outline: none;
  }

  .pagination-bar {
    margin-top: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    border-top: 1px solid var(--border-ds-surface-200);
    font-size: 12px;
    color: var(--text-secondary-200);

    position: fixed;
    bottom: 0;
    z-index: 10;

    .info {
      flex: 1;
    }

    .per-page {
      margin: 0 12px;
    }

    .controls {
      display: flex;
      gap: 4px;

      button {
        min-width: 28px;
        height: 28px;
        border: 1px solid var(--border-ds-surface-200);
        background: transparent;
        color: var(--text-secondary-200);
        border-radius: 4px;
        cursor: pointer;

        &:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        &.active {
          background: var(--accent-primary);
          color: white;
          font-weight: bold;
        }
      }
    }
  }
</style>
