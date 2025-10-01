<script lang="ts">
  import { Options } from "@sparrow/library/ui";
  import { ArrowSortRegular } from "@sparrow/library/icons";
  import Result from "./sub-components/Result.svelte";

  export let schedule;

  let openMenuFor: string | null = null;
  let activeWrapper: HTMLElement | null = null;

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

  function toggleMenu(e: MouseEvent, rowId: string, wrapper: HTMLElement) {
    e.stopPropagation();
    if (openMenuFor === rowId) {
      openMenuFor = null;
      activeWrapper = null;
    } else {
      openMenuFor = rowId;
      activeWrapper = wrapper;
      // Focus the wrapper immediately to enable blur detection
      setTimeout(() => {
        const focusWrapper = document.querySelector(
          ".options-focus-wrapper",
        ) as HTMLElement;
        if (focusWrapper) {
          focusWrapper.focus();
        }
      }, 0);
    }
  }

  function closeMenu() {
    openMenuFor = null;
    activeWrapper = null;
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
              {r}
              {schedule}
              {formatDate}
              {getRunType}
              {toggleMenu}
              {openMenuFor}
            />
          {/each}
        </tbody>
      </table>
    </div>
  </div>
{/if}

{#if openMenuFor && activeWrapper}
  <div
    tabindex="0"
    class="options-focus-wrapper"
    on:blur={closeMenu}
    on:click|stopPropagation
    style="position:absolute; left:0; top:0;"
  >
    {#key openMenuFor}
      <Options
        xAxis={activeWrapper.getBoundingClientRect().right - 104}
        yAxis={activeWrapper.getBoundingClientRect().bottom + 80 >
        window.innerHeight
          ? [
              activeWrapper.getBoundingClientRect().top - 50,
              activeWrapper.getBoundingClientRect().top - 14,
            ]
          : [
              activeWrapper.getBoundingClientRect().top - 12,
              activeWrapper.getBoundingClientRect().top + 24,
            ]}
        zIndex={700}
        width="104px"
        menuItems={[
          {
            onClick: () => {
              closeMenu();
            },
            displayText: "Delete",
            disabled: false,
            hidden: false,
          },
        ]}
      />
    {/key}
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
