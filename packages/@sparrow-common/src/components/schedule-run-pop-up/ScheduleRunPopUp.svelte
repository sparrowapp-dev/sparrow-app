<script lang="ts">
  import { Button } from "@sparrow/library/ui";
  import {
    Input,
    Select,
    TimePicker,
    DatePicker,
  } from "@sparrow/library/forms";
  // import { DateInput } from "date-picker-svelte";
  import { CalendarRegular } from "@sparrow/library/icons";

  export let isScheduleRunPopupOpen = true;
  export let testFlowName;

  // Form data
  let scheduleName = "";
  let selectedEnvironment = "";
  let isError = false;

  // Run Configuration
  let selectedCycle = "Once"; // Once, Daily, Hourly, Weekly
  let selectedDate = new Date();
  let selectedTime = "";
  let showDatePicker = false;
  let showTimePicker = false;

  // Set default schedule name when component loads or testflow name changes
  $: if (testFlowName) {
    scheduleName = `${testFlowName} - Schedule Run`;
  }

  // Set default time
  $: if (!selectedTime) {
    selectedTime = "16:00";
  }

  // Mock environment data
  let environments = [
    {
      id: "env-1",
      name: "Development",
      description: "Development Environment",
      color: "success",
    },
    {
      id: "env-2",
      name: "Staging",
      description: "Staging Environment",
      color: "warning",
    },
    {
      id: "env-3",
      name: "Production",
      description: "Production Environment",
      color: "danger",
    },
  ];

  // Run Cycle options
  const cycleOptions = [
    { id: "once", name: "Once", value: "Once" },
    { id: "daily", name: "Daily", value: "Daily" },
    { id: "hourly", name: "Hourly", value: "Hourly" },
    { id: "weekly", name: "Weekly", value: "Weekly" },
  ];

  const handleEnvironmentSelect = (envId: string) => {
    selectedEnvironment = envId;
  };

  const handleCycleSelect = (cycle: string) => {
    selectedCycle = cycle;
  };

  const handleTimeChange = (event: CustomEvent) => {
    selectedTime = event.detail;
  };

  const formatScheduleText = () => {
    if (!formattedDate || !selectedTime) return "";

    const date = parseDateString(formattedDate);
    const [hours, minutes] = selectedTime.split(":");
    date.setHours(parseInt(hours), parseInt(minutes));

    const options = {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    return `Run ${selectedCycle.toLowerCase()} on ${date.toLocaleDateString("en-US", options)}`;
  };
  // Format date string for use with custom DatePicker
  function formatDateString(date: Date): string {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // Parse date string from custom DatePicker
  function parseDateString(dateString: string): Date {
    if (!dateString) return new Date();
    const [day, month, year] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  // Formatted date string for the DatePicker
  let formattedDate = formatDateString(selectedDate);

  // Keep selectedDate in sync with formattedDate
  $: if (formattedDate) {
    selectedDate = parseDateString(formattedDate);
  }
</script>

<div>
  <div class="schedule-run-form">
    <!-- Schedule Name Input -->
    <div class="form-group mb-3">
      <label
        class="form-label text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium mb-2"
        style="color: var(--text-ds-neutral-100);"
      >
        Schedule Name <span style="color: var(--text-ds-danger-300);">*</span>
      </label>
      <Input
        bind:value={scheduleName}
        placeholder="Enter schedule name"
        variant="primary"
        size="medium"
        width="100%"
        {isError}
        id="schedule-name-input"
      />
      {#if isError && !scheduleName.trim()}
        <p
          class="error-text text-ds-font-size-12 mt-1"
          style="color: var(--text-ds-danger-300);"
        >
          Schedule name is required
        </p>
      {/if}
    </div>

    <!-- Environment Select -->
    <div class="form-group mb-4">
      <label
        class="form-label text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium mb-2"
        style="color: var(--text-ds-neutral-100);"
      >
        Select Environment
      </label>
      <p
        class="helper-text text-ds-font-size-12 mb-2"
        style="color: var(--text-ds-neutral-400);"
      >
        Select an environment if your test flow uses environment variables, to
        ensure the run executes without errors.
      </p>
      <Select
        id="environment-select"
        data={environments}
        titleId={selectedEnvironment}
        onclick={handleEnvironmentSelect}
        variant="primary"
        size="medium"
        minHeaderWidth="100%"
        placeholderText="Select environment"
        menuItem="v2"
        showDescription={true}
      />
    </div>

    <!-- Run Configuration -->
    <div class="form-group mb-4">
      <label
        class="form-label text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium mb-2"
        style="color: var(--text-ds-neutral-100);"
      >
        Run Configuration
      </label>

      <!-- Run Cycle -->
      <div class="mb-3">
        <label
          class="form-label text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium mb-2"
          style="color: var(--text-ds-neutral-100);"
        >
          Run Cycle <span style="color: var(--text-ds-danger-300);">*</span>
        </label>
        <div class="cycle-buttons d-flex mb-3">
          {#each cycleOptions as cycle}
            <button
              type="button"
              class="cycle-btn {selectedCycle === cycle.value ? 'active' : ''}"
              on:click={() => handleCycleSelect(cycle.value)}
            >
              {cycle.name}
            </button>
          {/each}
        </div>
      </div>

      <!-- Date and Time -->
      {#if selectedCycle === "Once"}
        <div class="once-row">
          <div class="once-item">
            <label class="form-label">
              Date <span style="color: var(--text-ds-danger-300);">*</span>
            </label>
            <div class="custom-datepicker">
              <DatePicker
                bind:value={formattedDate}
                placeholder="Select date"
                disabled={false}
              />
            </div>
          </div>
          <div class="once-item">
            <label class="form-label">
              Time <span style="color: var(--text-ds-danger-300);">*</span>
            </label>
            <div class="custom-timepicker">
              <TimePicker
                bind:value={selectedTime}
                placeholder="Select time"
                on:change={handleTimeChange}
              />
            </div>
          </div>
        </div>
      {:else}
        <div class="d-flex gap-3 mb-3">
          <div class="flex-1">
            <label class="form-label">
              Date <span style="color: var(--text-ds-danger-300);">*</span>
            </label>
            <div class="custom-datepicker">
              <div class="date-input-wrapper">
                <!-- <DateInput
                  bind:value={selectedDate}
                  format="yyyy-MM-dd"
                  placeholder="Select date"
                  closeOnSelection={true}
                  min={new Date()}
                /> -->
                <div class="date-input-icon">
                  <CalendarRegular
                    size="16px"
                    color="var(--text-ds-neutral-400)"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="flex-1">
            <label class="form-label">
              Time <span style="color: var(--text-ds-danger-300);">*</span>
            </label>
            <div class="custom-timepicker">
              <TimePicker
                bind:value={selectedTime}
                placeholder="Select time"
                on:change={handleTimeChange}
              />
            </div>
          </div>
        </div>
      {/if}

      <!-- Schedule Preview -->
      {#if selectedDate && selectedTime}
        <div
          class="schedule-preview p-2 mb-3"
          style="background-color: var(--bg-ds-tertiary-500); border-radius: 4px; border: 1px solid var(--border-ds-default);"
        >
          <p
            class="text-ds-font-size-12 mb-0"
            style="color: var(--text-ds-neutral-200);"
          >
            {formatScheduleText()}
          </p>
        </div>
      {/if}
    </div>
  </div>

  <!-- Action Buttons -->
  <div
    class="d-flex align-items-center justify-content-end gap-3 mt-1 mb-0 rounded"
  >
    <Button
      title="Cancel"
      type="secondary"
      onClick={() => {
        isScheduleRunPopupOpen = false;
      }}
    />
    <Button
      title="Schedule Run"
      type="primary"
      onClick={() => {
        console.log("Schedule Data:", {
          scheduleName,
          selectedEnvironment,
          selectedCycle,
          selectedDate,
          selectedTime,
        });
        isScheduleRunPopupOpen = false;
      }}
      disable={!scheduleName.trim() || !selectedDate || !selectedTime}
    />
  </div>
</div>

<style lang="scss">
  .once-row {
    display: flex;
    gap: 16px;
    width: 100%;
    margin-bottom: 16px;
  }

  .once-item {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  .custom-timepicker {
    width: 100%;
  }

  .schedule-run-form {
    padding: 0;
    width: 100%;
  }

  .form-group {
    width: 100%;
    margin-bottom: 16px;
  }

  .form-label {
    display: block;
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.3;
    color: var(--text-ds-neutral-100);
  }

  .helper-text {
    margin-bottom: 8px;
    line-height: 1.4;
    font-size: 12px;
    color: var(--text-ds-neutral-400);
  }

  .error-text {
    margin-top: 4px;
    margin-bottom: 0;
    font-size: 12px;
    color: var(--text-ds-danger-300);
  }

  .cycle-buttons {
    display: flex;
    width: 100%;
    gap: 8px;
    background-color: var(--bg-ds-surface-400);
    border-radius: 4px;
    padding: 4px;
  }

  .cycle-btn {
    flex: 1 1 0;
    min-width: 0;
    padding: 8px 0;
    border: none;
    background-color: var(--bg-ds-surface-400);
    color: var(--text-ds-neutral-100);
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.2s ease;
    text-align: center;

    &:hover {
      background-color: var(--bg-ds-tertiary);
      border-color: var(--border-ds-focus);
    }

    &.active {
      background-color: var(--bg-ds-surface-700);
      color: var(--text-ds-white);
    }
  }
  .schedule-preview {
    border-radius: 4px;
    padding: 12px;
    margin-top: 16px;
    background-color: rgba(29, 33, 43, 0.5);
    border: 1px solid var(--border-ds-default);
  }
</style>
