<script lang="ts">
  import {
    Options,
    Tooltip,
    Button,
    Modal,
    Spinner,
  } from "@sparrow/library/ui";
  import { Tag } from "@sparrow/library/ui";
  import {
    ErrorWithText,
    MoreHorizontalRegular,
    MoreVerticalRegular,
    WarningIconNew,
  } from "@sparrow/library/icons";
  import {
    loadingState,
    startLoading,
    stopLoading,
  } from "@sparrow/common/store";

  export let schedule;
  export let onPerformTestflowScheduleOperations;
  export let getTooltipMessage;
  export let handleToggleStatus;
  export let getNextRunTooltip;
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
  export let onOpenEnvironment;

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

  $: isDeletedEnvironment = schedule?.isDeletedEnvironment || false;

  // Handle environment click
  const handleEnvironmentClick = () => {
    if (
      !isDeletedEnvironment &&
      onOpenEnvironment &&
      schedule?.environmentData
    ) {
      onOpenEnvironment(schedule.environmentData);
    }
  };
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
        await onPerformTestflowScheduleOperations(
          "delete",
          schedule?.id,
          schedule?.name,
        );

        deleteLoader = false;
        isDeletePopup = false;
      }}
    />
  </div></Modal
>

{#if showMenu}
  <Options
    xAxis={activeWrapper.getBoundingClientRect().right - 165}
    yAxis={[
      activeWrapper.getBoundingClientRect().top - 5,
      activeWrapper.getBoundingClientRect().bottom + 5,
    ]}
    zIndex={700}
    width="104px"
    menuItems={[
      {
        onClick: () => {
          onPerformTestflowScheduleOperations(
            "run",
            schedule?.id,
            schedule?.name,
          );
        },
        displayText: "Run Now",
        disabled: false,
        hidden: false,
      },
      {
        onClick: () => {
          onOpenTestflowScheduleConfigurationsTab(schedule?.originalData);
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
      <!-- <Tooltip title={schedule.name} placement="bottom-left" size="small"> -->
      <span class="schedule-name text-fs-12 truncate">{schedule.name}</span>
      <!-- </Tooltip> -->
      <span class="schedule-description text-fs-12 text-muted">
        {schedule.description}
      </span>
    </div>
  </td>
  <td>
    {#if $loadingState.get("schedule-status-" + schedule?.id)}
      <Spinner size={"14px"} />
    {:else}
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
              disabled={schedule.status === "Expired" || !isTestflowEditable}
              on:click={(e) => e.stopPropagation()}
              on:change={async (e) => {
                e.stopPropagation();
                startLoading("schedule-status-" + schedule?.id);
                await handleToggleStatus(schedule.id, e.target.checked);
                stopLoading("schedule-status-" + schedule?.id);
              }}
            />
            <span
              class="toggle-slider {schedule.status === 'Expired'
                ? 'disabled'
                : ''}"
            ></span>
          </label>
          <span
            class="status-text text-fs-12 ms-2 {schedule.status.toLowerCase()}"
          >
            {schedule.status}
          </span>
        </div>
      </Tooltip>
    {/if}
  </td>
  <td>
    {#if isDeletedEnvironment}
      <Tooltip
        title="This environment has been removed and might impact test results."
        placement="bottom-left"
        size="small"
      >
        <span class="text-fs-12" style="color: var(--text-ds-neutral-500);"
          >{schedule.environment}</span
        ><WarningIconNew />
      </Tooltip>
    {:else if schedule.environment && schedule.environment.toLowerCase() !== "none"}
      <div class="environment-link">
        <Button
          title={schedule?.environment?.length > 30
            ? schedule?.environment?.slice(0, 30) + "..."
            : schedule?.environment || ""}
          type="link-primary"
          size={"extra-small"}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleEnvironmentClick();
          }}
        />
      </div>
    {:else}
      <span class="text-fs-12" style="color: var(--text-ds-neutral-300);">
        None
      </span>
    {/if}
  </td>
  <td>
    <Tooltip
      title={getNextRunTooltip(schedule)}
      placement="bottom-center"
      size="small"
    >
      <span class="next-run-text text-fs-12">
        {schedule.nextRun}
      </span>
    </Tooltip>
  </td>
  <td>
    {#if schedule.lastResult === "Pending"}
      <Spinner size={"16px"} />
    {:else if schedule.lastResult === "Success"}
      <Tag text="Success" type={getTagType("Success")} />
    {:else if schedule.lastResult === "Fail"}
      <Tooltip
        title={getFailTooltip(schedule)}
        placement="bottom-center"
        size="small"
      >
        <Tag text="Partially Failed" type={getTagType("Partially Failed")} />
      </Tooltip>
    {:else}
      <span class="text-muted text-fs-12">No results yet</span>
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
            startIcon={MoreVerticalRegular}
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

  .schedule-name.truncate {
    max-width: 220px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    vertical-align: middle;
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

  .environment-link {
    margin-left: -18px;
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
  td {
    border-bottom: 1px solid var(--border-ds-neutral-700);
    padding-left: 12px;
    padding-right: 12px;
  }
</style>
