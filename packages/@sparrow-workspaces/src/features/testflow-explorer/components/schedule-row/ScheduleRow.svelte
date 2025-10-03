<script lang="ts">
  import { Options, Tooltip, Button, Modal } from "@sparrow/library/ui";
  import { Tag } from "@sparrow/library/ui";
  import { ErrorWithText, MoreHorizontalRegular } from "@sparrow/library/icons";

  export let schedule;

  console.log("Schedule:", schedule);
  export let onPerformTestflowScheduleOperations;
  export let getTooltipMessage;
  export let handleToggleStatus;
  export let getNextRunTooltip;
  export let handleScheduleAction;
  export let getTagType;
  function getFailTooltip(schedule) {
    const runHistory = schedule.originalData?.schedularRunHistory;
    if (Array.isArray(runHistory) && runHistory.length > 0) {
      // Sort to get the latest run
      const sortedHistory = [...runHistory].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      const lastRun = sortedHistory[0];
      const total =
        (lastRun.successRequests || 0) + (lastRun.failedRequests || 0);
      return `• ${lastRun.successRequests}/${total} APIs passed.<br>• Avg. Response Time: ${lastRun.totalTime || "N/A"}`;
    }
    return "No results yet";
  }
  export let onOpenTestflowScheduleTab;
  export let isTestflowEditable = true;
  export let onOpenTestflowScheduleConfigurationsTab;

  let showMenu: boolean = false;
  let activeWrapper: HTMLElement;
  function rightClickContextMenu(e: Event) {
    setTimeout(() => {
      showMenu = !showMenu;
    }, 100);
  }

  function handleSelectClick(event: MouseEvent) {
    const selectElement = document.getElementById(
      `show-more-schedule-${schedule?.id}`,
    );
    if (selectElement && !selectElement.contains(event.target as Node)) {
      showMenu = false;
    }
  }

  function formatRequestCount(success: number, failed: number) {
    const total = Number(success) + Number(failed);
    return `${total} ${total === 1 ? "request" : "requests"}`;
  }

  let isDeletePopup = false;
  let deleteLoader = false;
</script>

<svelte:window
  on:click={handleSelectClick}
  on:contextmenu|preventDefault={handleSelectClick}
/>

<Modal
  title={"Delete Schedule?"}
  type={"danger"}
  width={"35%"}
  zIndex={10}
  isOpen={isDeletePopup}
  handleModalState={() => (isDeletePopup = false)}
>
  <div
    class="text-lightGray mb-1 text-ds-font-size-14 text-ds-font-weight-medium"
  >
    <p>
      Are you sure you want to delete
      <span
        class="text-ds-font-weight-semi-bold"
        style="color: var(--text-ds-neutral-50);">"{schedule?.name}"</span
      >
      scheduled run? This will remove all future runs and delete all associated results
      permanently. This action cannot be undone.
    </p>
  </div>

  <div
    class="d-flex align-items-center justify-content-end gap-3 mt-1 mb-0 rounded w-100 text-ds-font-size-16"
  >
    <Button
      disable={deleteLoader}
      title={"Cancel"}
      type={"secondary"}
      loader={false}
      onClick={() => {
        isDeletePopup = false;
      }}
    />

    <Button
      disable={deleteLoader}
      title={"Delete"}
      type={"danger"}
      loader={deleteLoader}
      onClick={async () => {
        deleteLoader = true;
        await onPerformTestflowScheduleOperations("delete", schedule?.id);

        deleteLoader = false;
        isDeletePopup = false;
      }}
    />
  </div></Modal
>

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
          onPerformTestflowScheduleOperations("run", schedule?.id);
        },
        displayText: "Run Now",
        disabled: false,
        hidden: false,
      },
      {
        onClick: () => {
          onOpenTestflowScheduleConfigurationsTab(schedule);
        },
        displayText: "Edit",
        disabled: false,
        hidden: false,
      },
      {
        onClick: () => {
          isDeletePopup = true;
        },
        displayText: "Delete",
        disabled: false,
        hidden: false,
      },
    ]}
  />
{/if}

<tr
  class="custom-row"
  on:click={() => onOpenTestflowScheduleTab(schedule?.originalData)}
>
  <td>
    <div class="d-flex flex-column">
      <span class="schedule-name">{schedule.name}</span>
      <span class="schedule-description text-muted">
        {schedule.description}
      </span>
    </div>
  </td>
  <td>
    <Tooltip
      title={getTooltipMessage(schedule)}
      placement="bottom-center"
      size="small"
    >
      <div class="d-flex align-items-center">
        <label class="toggle-switch" on:click={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={schedule.status === "Active"}
            disabled={schedule.status === "Expired"}
            on:click={(e) => e.stopPropagation()}
            on:change={(e) => {
              e.stopPropagation();
              handleToggleStatus(schedule.id, e.target.checked);
            }}
          />
          <span
            class="toggle-slider {schedule.status === 'Expired'
              ? 'disabled'
              : ''}"
          ></span>
        </label>
        <span class="status-text ms-2 {schedule.status.toLowerCase()}">
          {schedule.status}
        </span>
      </div>
    </Tooltip>
  </td>
  <td>{schedule.environment}</td>
  <td>
    <Tooltip
      title={getNextRunTooltip(schedule)}
      placement="bottom-center"
      size="small"
    >
      <span class="next-run-text">
        {schedule.nextRun}
      </span>
    </Tooltip>
  </td>
  <td>
    {#if schedule.lastResult !== "No results yet" && schedule.lastResult !== "error"}
      <Tag
        text={schedule.lastResult || "No results yet"}
        type={getTagType(schedule.lastResult)}
      />
    {/if}

    {#if schedule.lastResult === "No results yet"}
      <span class="text-muted">No results yet</span>
    {/if}

    {#if schedule.lastResult === "error"}
      <Tooltip
        title={getFailTooltip(schedule)}
        placement="bottom-left"
        size="small"
      >
        <Tag text="Partially Failed" type={getTagType("Partially Failed")} />
      </Tooltip>
    {/if}
  </td>
  <td bind:this={activeWrapper}>
    <div class="d-flex align-items-center gap-2" style="padding-left: 6px;">
      <span class="threedot-icon-container d-flex">
        {#if isTestflowEditable}
          <Button
            tabindex={-1}
            id={`show-more-schedule-${schedule.id}`}
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
    </div>
  </td>
</tr>

<style>
  .custom-row td {
    background-color: var(--bg-ds-neutral-900) !important;
  }

  .custom-row {
    width: 1079px;
    height: 54px;
    opacity: 1;
  }

  .scheduled-table {
    padding: 12px;
    border-bottom: none;
    font-size: 14px;
    background-color: var(--bg-ds-neutral-900);
  }

  .scheduled-table tbody tr:hover {
    background-color: var(--bg-ds-surface-600) !important;
  }

  .scheduled-table tbody tr:hover td {
    background-color: var(--bg-ds-surface-600) !important;
  }

  .schedule-name {
    font-weight: 500;
    color: var(--text-ds-neutral-100);
  }

  .schedule-description {
    font-size: 12px;
    color: var(--text-ds-neutral-400);
    margin-top: 2px;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }

  .status-badge.active {
    background-color: var(--bg-ds-success-100);
    color: var(--text-ds-success-700);
  }

  .status-badge.inactive {
    background-color: var(--bg-ds-neutral-100);
    color: var(--text-ds-neutral-700);
  }

  .status-badge.expired {
    background-color: var(--bg-ds-warning-100);
    color: var(--text-ds-warning-700);
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-right: 6px;
  }

  .result-badge {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  .result-badge.success {
    background-color: var(--bg-ds-success-100);
    color: var(--text-ds-success-700);
  }

  .result-badge.failed {
    background-color: var(--bg-ds-danger-100);
    color: var(--text-ds-danger-700);
  }

  .result-badge.partially.failed {
    background-color: var(--bg-ds-warning-100);
    color: var(--text-ds-warning-700);
  }

  .action-btn {
    background: none;
    color: var(--text-ds-neutral-300);
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--bg-ds-neutral-400);
    transition: 0.2s;
    border-radius: 20px;
  }

  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: 0.2s;
    border-radius: 50%;
  }

  input:checked + .toggle-slider {
    background-color: var(--bg-primary-400);
  }

  input:checked + .toggle-slider:before {
    transform: translateX(20px);
  }

  .status-text {
    font-size: 12px;
    font-weight: 500;
  }

  .status-text.active {
    color: var(--text-ds-neutral-200);
  }

  .status-text.inactive {
    color: var(--text-ds-neutral-200);
  }

  .status-text.expired {
    color: var(--text-ds-neutral-500);
  }
</style>
