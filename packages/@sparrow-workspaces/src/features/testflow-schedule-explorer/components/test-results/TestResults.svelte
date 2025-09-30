<script lang="ts">
  import { Tag } from "@sparrow/library/ui";
  import { ArrowSortRegular } from "@sparrow/library/icons";
  import { ThreeDotIcon } from "@sparrow/library/icons";
  export let schedule;

  function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = { 
    month: "short", 
    day: "numeric", 
    year: "numeric" 
  };
  const datePart = date.toLocaleDateString("en-US", options);
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;

  return `${datePart} at ${hours}:${minutes} ${ampm}`;
}
</script>

<!-- {#each schedule?.schedularRunHistory as result}
<div>
  {result?.createdAt} - {result?.status} = success: {result?.successRequests}
  , failed: {result?.failedRequests}
</div>
{/each} -->

{#if schedule?.schedularRunHistory}
  <div class="content-wrapper">
    <div class="table-container">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Run Time</th>
            <th class="icon-col">
              <ArrowSortRegular size="20px" />
            </th>
            <th>Status</th>
            <th>Total Requests</th>
            <th>Result</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each schedule?.schedularRunHistory as r}
            <tr>
              <td>
                <div class="time-cell">
                  <span>{formatDate(r.createdAt)}</span>
                  <span class="sub-text">{r.type}</span>
                </div>
              </td>

              <!-- Empty cells for the icon column -->
              <td></td>

              <td>
                <div style="display: flex; justify-content: center;">
                  <Tag
                    text={r.status === "pass" ? "Completed" : "Error"}
                    type="green"
                    endIcon={null}
                  />
                </div>
              </td>

              <td>{Number(r.successRequests) + Number(r.failedRequests)}</td>

              <td>
                <div style="display: flex; justify-content: center; gap:8px;">
                  {#if r.result}
                    <Tag
                      text={`${r.successRequests} Passed`}
                      type="green"
                      endIcon={null}
                    />
                    <Tag
                      text={`${r.failedRequests} Failed`}
                      type="orange"
                      endIcon={null}
                    />
                  {/if}
                </div>
              </td>
              <td>
                <ThreeDotIcon width="16px" height="16px"/>
              </td>
            </tr>
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
    padding: 0;
    margin: 0;
  }

  .custom-table {
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
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

    tbody tr,
    thead tr {
      border-bottom: 1px solid var(--border-ds-surface-200);
    }

    tbody tr:last-child {
      border-bottom: none;
    }

    tbody tr:hover {
      background-color: var(--bg-ds-surface-400);
    }
  }

  .time-cell {
    display: flex;
    flex-direction: column;

    .sub-text {
      font-size: 12px;
      color: var(--text-secondary-200);
    }
  }
</style>
