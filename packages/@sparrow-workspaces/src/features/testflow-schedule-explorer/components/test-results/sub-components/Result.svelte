<script lang="ts">
  import { Tag } from "@sparrow/library/ui";
  import { ThreeDotIcon } from "@sparrow/library/icons";

  export let r;
  export let schedule;
  export let formatDate: (date: string) => string;
  export let getRunType: (flowName: string) => string;
  export let toggleMenu: (
    e: MouseEvent,
    rowId: string,
    wrapper: HTMLElement,
  ) => void;
  export let openMenuFor: string | null;
  export let onDeleteTestflowScheduleHistory;
  export let onScheduleRunview;

  let collectionTabWrapper: HTMLElement;

  function formatRequestCount(success: number, failed: number) {
    const total = Number(success) + Number(failed);
    return `${total} ${total === 1 ? "request" : "requests"}`;
  }
</script>

<tr
  on:click={() => {
    onScheduleRunview(r);
  }}
>
  <td>
    <div class="time-cell">
      <span>{formatDate(r.createdAt)}</span>
      <span class="sub-text">{getRunType(schedule.name)}</span>
    </div>
  </td>

  <td></td>

  <td>
    <div style="display: flex; justify-content: center;">
      <Tag
        text={r.status === "pass" ? "Completed" : "Error"}
        type={r.status === "pass" ? "green" : "orange"}
        endIcon={null}
      />
    </div>
  </td>

  {#if r.status === "pass"}
    <td>{formatRequestCount(r.successRequests, r.failedRequests)}</td>
    <td>
      <div class="result-cell">
        <Tag text={`${r.successRequests} passed`} type="green" endIcon={null} />
        <Tag text={`${r.failedRequests} failed`} type="orange" endIcon={null} />
        <span class="duration">{r.totalTime}</span>
      </div>
    </td>
  {:else}
    <td></td>
    <td></td>
  {/if}

  <td>
    <button
      class="menu-btn"
      bind:this={collectionTabWrapper}
      on:click={(e) => toggleMenu(e, r.createdAt, collectionTabWrapper, r?.id)}
    >
      <ThreeDotIcon width="16px" height="16px" />
    </button>
  </td>
</tr>

<style lang="scss">
  tr {
    border-bottom: 1px solid var(--border-ds-surface-200);
  }
  tr:last-child {
    border-bottom: none;
  }
  tr:hover {
    background-color: var(--bg-ds-surface-400);
    cursor: pointer;
  }

  td {
    padding: 8px 12px;
    text-align: center;
  }
  td:first-child {
    text-align: left;
  }

  .time-cell {
    display: flex;
    flex-direction: column;
    .sub-text {
      font-size: 12px;
      color: var(--text-secondary-200);
    }
  }

  .menu-btn {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    transform: rotate(90deg);
  }

  .result-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    .duration {
      font-size: 12px;
      min-width: 60px;
      text-align: right;
    }
  }
</style>
