<script>
  import { Tag } from "@sparrow/library/ui";
  import { TestResults } from "@sparrow/common/enums";
  import { ArrowSortRegular } from "@sparrow/library/icons";

  let results = [
    {
      time: "Sep 19, 2025 at 10:00 PM",
      type: "Schedule Run",
      status: TestResults.COMPLETED,
      total: "3 Requests",
      result: { passed: 1, failed: 2, latency: "110 ms" },
    },
    {
      time: "Sep 19, 2025 at 8:00 PM",
      type: "Schedule Run",
      status: TestResults.COMPLETED,
      total: "3 Requests",
      result: { passed: 0, failed: 3, latency: "110 ms" },
    },
    {
      time: "Sep 19, 2025 at 6:00 PM",
      type: "Schedule Run",
      status: TestResults.COMPLETED,
      total: "3 Requests",
      result: { passed: 2, failed: 1, latency: "110 ms" },
    },
    {
      time: "Sep 19, 2025 at 12:00 PM",
      type: "Schedule Run",
      status: TestResults.ERROR,
    },
  ];
</script>

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
        </tr>
      </thead>
      <tbody>
        {#each results as r}
          <tr>
            <td>
              <div class="time-cell">
                <span>{r.time}</span>
                <span class="sub-text">{r.type}</span>
              </div>
            </td>

            <!-- Empty cells for the icon column -->
            <td></td>

            <td>
              <div style="display: flex; justify-content: center;">
                {#if r.status === TestResults.COMPLETED}
                  <Tag text={r.status} type="green" endIcon={null} />
                {:else if r.status === TestResults.ERROR}
                  <Tag text={r.status} type="orange" endIcon={null} />
                {/if}
              </div>
            </td>

            <td>{r.total ? `${r.total}` : ""}</td>

            <td>
              <div style="display: flex; justify-content: center; gap:8px;">
                {#if r.result}
                  <Tag
                    text={`${r.result.passed} Passed`}
                    type="green"
                    endIcon={null}
                  />
                  <Tag
                    text={`${r.result.failed} Failed`}
                    type="orange"
                    endIcon={null}
                  />
                  <span>{r.result.latency}</span>
                {/if}
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

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
      text-transform: uppercase;
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
