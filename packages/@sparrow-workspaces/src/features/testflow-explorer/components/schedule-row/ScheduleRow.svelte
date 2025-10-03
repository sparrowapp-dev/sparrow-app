<script lang="ts">
  import { Tooltip } from "@sparrow/library/ui";
  import { Tag } from "@sparrow/library/ui";
  import { ErrorWithText } from "@sparrow/library/icons";

  export let schedule;

  console.log("Schedule:", schedule);
  export let onPerformTestflowScheduleOperations;
  export let getTooltipMessage;
  export let handleToggleStatus;
  export let getNextRunTooltip;
  export let handleScheduleAction;
  export let getTagType;
</script>

<tr
  class="custom-row"
  on:click={() => onPerformTestflowScheduleOperations("open", schedule.id)}
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
        title={"Run did not complete due to an execution error."}
        placement="bottom-center"
        size="small"
      >
        <ErrorWithText />
      </Tooltip>
    {/if}
  </td>
  <td>
    <div class="d-flex align-items-center gap-2" style="padding-left: 6px;">
      <button
        class="btn btn-sm action-btn"
        on:click={(e) => {
          e.stopPropagation();
          handleScheduleAction(schedule.id, "more");
        }}
      >
        ⋮
      </button>
    </div>
  </td>
</tr>

<style>
  .custom-row td {
    background-color: var(--bg-ds-neutral-900) !important;
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
