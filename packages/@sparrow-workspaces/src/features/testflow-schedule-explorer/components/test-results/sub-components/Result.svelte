<script lang="ts">
  import { Button, Options, Tag, Modal } from "@sparrow/library/ui";
  import { MoreHorizontalRegular, ThreeDotIcon } from "@sparrow/library/icons";

  export let r;
  export let schedule;
  export let formatDate: (date: string) => string;
  export let getRunType: (flowName: string) => string;

  export let onDeleteTestflowScheduleHistory;
  export let onScheduleRunview;
  export let isTestflowScheduleEditable;
  export let deleteLoader;
  let isDeleteModalOpen:boolean=false;

  function handleDeleteCancel() {
    isDeleteModalOpen = false;
  }

  function handleDeleteConfirm() {
    onDeleteTestflowScheduleHistory(r?.id);
    isDeleteModalOpen = false;
  }

  let showMenu: boolean = false;

  function rightClickContextMenu(e: Event) {
    setTimeout(() => {
      showMenu = !showMenu;
    }, 100);
  }

  function handleSelectClick(event: MouseEvent) {
    const selectElement = document.getElementById(
      `show-more-schedule-result-${r.id}`,
    );
    if (selectElement && !selectElement.contains(event.target as Node)) {
      showMenu = false;
    }
  }

  let activeWrapper: HTMLElement;

  function formatRequestCount(success: number, failed: number) {
    const total = Number(success) + Number(failed);
    return `${total} ${total === 1 ? "request" : "requests"}`;
  }
</script>

<svelte:window
  on:click={handleSelectClick}
  on:contextmenu|preventDefault={handleSelectClick}
/>

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

  <td bind:this={activeWrapper}>
    <span class="threedot-icon-container d-flex">
      {#if isTestflowScheduleEditable}
        <Button
          tabindex={-1}
          id={`show-more-schedule-result-${r.id}`}
          size="extra-small"
          customWidth={"24px"}
          type="teritiary-regular"
          startIcon={MoreHorizontalRegular}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            rightClickContextMenu(e);
          }}
        />
      {/if}
    </span>
  </td>
</tr>

<!-- Delete Confirmation Modal -->
<Modal
  title="Delete Test Result?"
  type="danger"
  width="35%"
  zIndex={1000}
  isOpen={isDeleteModalOpen}
  handleModalState={handleDeleteCancel}
>
  <div class="text-lightGray mb-1">
    <p
      class="text-ds-font-size-14 text-ds-line-height-130 text-ds-font-weight-medium"
    >
      Are you sure you want to delete this test result from
      <span
        class="text-ds-font-weight-semi-bold"
        style="color: var(--text-ds-neutral-50);"
      >
        "{r ? formatDate(r.createdAt) : ""}"
      </span>? This action cannot be undone.
    </p>
  </div>

  <div
    class="d-flex align-items-center justify-content-end gap-3 rounded"
    style="font-size: 16px; margin-bottom:2px;"
  >
    <Button
      disable={deleteLoader}
      title="Cancel"
      textStyleProp="font-size: var(--base-text)"
      type="secondary"
      loader={false}
      onClick={handleDeleteCancel}
    />

    <Button
      disable={deleteLoader}
      title="Delete"
      textStyleProp="font-size: var(--base-text)"
      loaderSize={18}
      type="danger"
      loader={deleteLoader}
      onClick={handleDeleteConfirm}
    />
  </div>
</Modal>

{#if showMenu}
  <Options
    xAxis={activeWrapper.getBoundingClientRect().right - 150}
    yAxis={[
      activeWrapper.getBoundingClientRect().top - 5,
      activeWrapper.getBoundingClientRect().bottom + 5,
    ]}
    zIndex={700}
    width="104px"
    menuItems={[
      {
        onClick: () => {
          isDeleteModalOpen=true
          showMenu = false; 
        },
        displayText: "Delete",
        disabled: false,
        hidden: false,
      },
    ]}
  />
{/if}

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
