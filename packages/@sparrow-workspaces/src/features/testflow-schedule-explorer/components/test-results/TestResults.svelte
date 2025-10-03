<script lang="ts">
  import { ArrowSortRegular } from "@sparrow/library/icons";
  import Result from "./sub-components/Result.svelte";

  export let schedule;
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

{#if schedule?.schedularRunHistory}
  <div class="content-wrapper">
    <div class="table-container">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Run Time</th>
            <th class="icon-col"><ArrowSortRegular size="20px" /></th>
            <th>Status</th>
            <th>Total Requests</th>
            <th>Result</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each schedule?.schedularRunHistory as r}
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
{/if}

<style lang="scss">
  .content-wrapper {
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 100%;
  }
  .table-container {
    width: 100%;
    flex: 1;
    overflow-x: auto;
    overflow-y: auto;
  }
  .custom-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    thead {
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

  .options-focus-wrapper {
    outline: none;
  }
</style>
