<script lang="ts">
  import { Button, RadioButton } from "@sparrow/library/ui";
  import {
    Input,
    Select,
    TimePicker,
    DatePicker,
  } from "@sparrow/library/forms";
  import { StepProgressBar } from "@sparrow/library/ui";
  import { NumberInput } from "@sparrow/common/components";
  import { InviteUserPicker } from "../component";
  export let isScheduleRunPopupOpen = true;
  export let testFlowName;
  export let workspaceUsers = [];
  export let environments = [];
  export let handleScheduleTestFlowRun;
  export let creatorEmail;

  // Form data
  let scheduleName = "";
  let selectedEnvironment = "";
  let isError = false;
  let isScheduling = false;

  // Run Configuration
  let selectedCycle = "Once"; // Once, Daily, Hourly, Weekly
  let selectedDate = new Date();
  let selectedTime = "";

  // Hourly specific variables
  const hourOptions = ["1h", "6h", "12h", "24h"];
  const hourValues = [1, 6, 12, 24];
  let selectedHours = 1;
  let hourlyProgressStep = 1; // Default to 2h (index 1)

  // Weekly specific variables
  let selectedWeekDays: string[] = [];

  // Week days data
  const weekDays = [
    { label: "Mon", value: "monday", dayNumber: 1 },
    { label: "Tue", value: "tuesday", dayNumber: 2 },
    { label: "Wed", value: "wednesday", dayNumber: 3 },
    { label: "Thu", value: "thursday", dayNumber: 4 },
    { label: "Fri", value: "friday", dayNumber: 5 },
    { label: "Sat", value: "saturday", dayNumber: 6 },
    { label: "Sun", value: "sunday", dayNumber: 0 },
  ];

  // Set default schedule name when component loads or testflow name changes
  $: if (testFlowName) {
    scheduleName = `${testFlowName} - Schedule Run`;
  }

  // Set default time
  $: if (!selectedTime) {
    selectedTime = "12:00";
  }

  $: formattedEnvironments = environments.map((env) => ({
    id: env.id,
    name: env.name,
  }));

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

  function formatTimeDisplay(timeStr: string): string {
    if (!timeStr) return "";

    // Parse the 24-hour time format
    const [hourStr, minuteStr] = timeStr.split(":");
    const hour = parseInt(hourStr);
    const minute = minuteStr;

    // Convert to 12-hour format
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;

    // Return formatted time
    return `${hour12}:${minute} ${period}`;
  }

  const formatScheduleText = (
    dateStr: string,
    timeStr: string,
    cycle: string,
  ) => {
    if (!dateStr || !timeStr) return "";
    const date = parseDateString(dateStr);
    const [hours, minutes] = timeStr.split(":");
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    return `${cycle.toLowerCase()} on ${date.toLocaleDateString("en-US", options)}`;
  };

  // reactive declaration that uses the values explicitly so Svelte tracks them
  $: schedulePreviewText = formatScheduleText(
    formattedDate,
    selectedTime,
    selectedCycle,
  );

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

  function handleHourlyNumberChange(event) {
    // Get the new value from the number input
    selectedHours = parseInt(event.detail) || 1;

    // Still update the closest step for labels highlighting
    const valueIndex = hourValues.indexOf(selectedHours);
    if (valueIndex !== -1) {
      hourlyProgressStep = valueIndex;
    } else {
      // If not an exact match, find closest step for button highlighting
      let closestIndex = 0;
      let minDifference = Math.abs(hourValues[0] - selectedHours);

      for (let i = 1; i < hourValues.length; i++) {
        const difference = Math.abs(hourValues[i] - selectedHours);
        if (difference < minDifference) {
          minDifference = difference;
          closestIndex = i;
        }
      }
      hourlyProgressStep = closestIndex;
    }
  }

  function handleHourlyProgressChange(event) {
    const { value } = event.detail;
    selectedHours = value;
  }

  // Formatted date string for the DatePicker
  let formattedDate = formatDateString(selectedDate);

  // Keep selectedDate in sync with formattedDate
  $: if (formattedDate) {
    selectedDate = parseDateString(formattedDate);
  }

  // Weekly helper functions
  function formatWeekDays(days: string[]): string {
    if (days.length === 0) return "";
    if (days.length === 7) return "day";
    if (days.length === 1)
      return (
        days.find((d) => weekDays.find((wd) => wd.value === d)?.label) ||
        days[0]
      );

    const dayLabels = days
      .map((d) => weekDays.find((wd) => wd.value === d)?.label)
      .filter(Boolean);
    const lastDay = dayLabels[dayLabels.length - 1];
    const otherDays = dayLabels.slice(0, -1);
    return `${otherDays.join(", ")} and ${lastDay}`;
  }

  // Handle day selection for weekly
  function handleWeekDaySelect(dayValue: string) {
    if (selectedWeekDays.includes(dayValue)) {
      selectedWeekDays = selectedWeekDays.filter((d) => d !== dayValue);
    } else {
      selectedWeekDays = [...selectedWeekDays, dayValue];
    }
  }

  // Notification variables
  let notificationEmails: string[] = [];

  // Use the workspace users directly for notification suggestions
  $: notificationSuggestions = workspaceUsers.map((user) => ({
    email: user.email,
    name: user.name,
  }));

  function handleNotificationEmailsChange(emails: string[]) {
    notificationEmails = emails;
  }

  // Notification settings
  let notificationPreference: "failure" | "every_time" = "failure";

  // Handle notification preference change
  function handleNotificationPrefChange(event: { target?: { value: string } }) {
    notificationPreference = event.target.value as "failure" | "every_time";
  }

  // Add function to format date for API
  function formatDateForAPI(date, time) {
    if (!date || !time) return new Date().toISOString();

    // Parse the date string (DD-MM-YYYY format)
    const [day, month, year] = date.split("-").map(Number);

    // Parse the time string (HH:MM format)
    const [hours, minutes] = time.split(":").map(Number);

    // Create a new Date object
    const dateObj = new Date(year, month - 1, day, hours, minutes);

    // Return ISO string
    return dateObj.toISOString();
  }

  // Add schedule run handler
  async function handleScheduleRun() {
    isScheduling = true;
    // Create runConfiguration object based on cycle type
    let runConfiguration = {
      runCycle: selectedCycle.toLowerCase(),
    };

    switch (selectedCycle.toLowerCase()) {
      case "once":
        // For once, we only need executeAt
        runConfiguration.executeAt = formatDateForAPI(
          formattedDate,
          selectedTime,
        );
        break;
      case "daily":
        // For daily, we need time
        runConfiguration.time = selectedTime;
        break;
      case "weekly":
        // For weekly, we need days
        runConfiguration.days = selectedWeekDays
          .map((dayValue) => {
            const day = weekDays.find((d) => d.value === dayValue);
            return day ? day.dayNumber : undefined;
          })
          .filter((day) => day !== undefined);
        runConfiguration.time = selectedTime;
        break;
        break;
      case "hourly":
        // For hourly, we need the interval hours
        runConfiguration.intervalHours = selectedHours;
        break;
    }

    // Call the handler with the properly formatted data
    const result = await handleScheduleTestFlowRun(
      scheduleName,
      selectedEnvironment,
      runConfiguration,
      {
        emails: notificationEmails,
        receiveNotifications: notificationPreference,
      },
    );

    if (result?.isSuccessful) {
      isScheduleRunPopupOpen = false;
    }
    isScheduling = false;
  }
</script>

<div>
  <div class="schedule-run-form">
    <!-- Schedule Name Input -->
    <div class="form-group mb-3">
      <label
        class="form-label text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium mb-2"
        style="color: var(--text-ds-neutral-200);"
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
        class="form-label text-ds-font-size-14 text-ds-line-height-130 text-ds-font-weight-medium mb-2"
        style="color: var(--text-ds-neutral-200);"
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
        data={formattedEnvironments}
        titleId={selectedEnvironment}
        onclick={handleEnvironmentSelect}
        size="medium"
        minHeaderWidth="100%"
        placeholderText="Select environment"
        menuItem="v2"
        showDescription={false}
        bodyTheme={"violet"}
        headerTheme={"violet2"}
        variant={"tertiary"}
      />
    </div>
    <div
      style="height: 1px; background-color: var(--bg-ds-surface-100); margin: 20px 0;"
    ></div>

    <!-- Run Configuration -->
    <div class="form-group mb-4">
      <label
        class="form-label text-ds-font-size-14 text-ds-line-height-130 text-ds-font-weight-medium mb-2"
        style="color: var(--text-ds-neutral-300);"
      >
        Run Configuration
      </label>

      <!-- Run Cycle -->
      <div class="mb-3">
        <label
          class="form-label text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium mb-2"
          style="color: var(--text-ds-neutral-200);"
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
                minDate={new Date()}
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
        <!-- Schedule Preview -->
        {#if selectedDate && selectedTime}
          <div class="schedule-preview mb-3" style="">
            <p class="text-ds-font-size-12 mb-0">
              <span style="color: var(--text-ds-neutral-300);">Run</span>
              <span style="color: var(--text-ds-neutral-50);">
                {schedulePreviewText}</span
              >
            </p>
          </div>
        {/if}
      {:else if selectedCycle === "Daily"}
        <!-- Daily cycle - only show time picker -->
        <div class="once-row">
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

        <!-- Daily schedule preview -->
        {#if selectedTime}
          <div class="schedule-preview mb-3">
            <p class="text-ds-font-size-12 mb-0">
              <span style="color: var(--text-ds-neutral-300);">Run</span>
              <span style="color: var(--text-ds-neutral-50);">
                everyday at {formatTimeDisplay(selectedTime)}</span
              >
            </p>
          </div>
        {/if}
      {:else if selectedCycle === "Hourly"}
        <div class="hourly-selector form-field">
          <div class="selector-container">
            <div class="interval-label">Every</div>

            <div class="progress-bar-wrapper">
              <StepProgressBar
                steps={hourOptions}
                currentValue={selectedHours}
                minValue={1}
                maxValue={24}
                on:change={handleHourlyProgressChange}
              />
            </div>

            <div class="number-input-wrapper">
              <NumberInput
                value={selectedHours}
                min={1}
                max={24}
                width="70px"
                on:change={handleHourlyNumberChange}
                showErrorMessage={false}
              />
            </div>

            <div class="interval-label">Hour(s)</div>
          </div>
        </div>

        <!-- Hourly schedule preview -->
        {#if selectedHours}
          <div class="schedule-preview mb-3">
            <p class="text-ds-font-size-12 mb-0">
              <span style="color: var(--text-ds-neutral-300);">Run</span>
              <span style="color: var(--text-ds-neutral-50);">
                every {selectedHours} hour{selectedHours > 1 ? "s" : ""}</span
              >
            </p>
          </div>
        {/if}
      {:else if selectedCycle === "Weekly"}
        <!-- Weekly Configuration -->
        <div class="weekly-selector">
          <!-- Day Selection -->
          <div class="form-group mb-3">
            <label class="form-label">
              Select Day(s) <span style="color: var(--text-ds-danger-300);"
                >*</span
              >
            </label>

            <!-- Custom Day Chips -->
            <div class="day-chips-container">
              {#each weekDays as day}
                <button
                  type="button"
                  class="day-chip {selectedWeekDays.includes(day.value)
                    ? 'selected'
                    : ''}"
                  on:click={() => handleWeekDaySelect(day.value)}
                >
                  {day.label}
                </button>
              {/each}
            </div>
          </div>

          <!-- Time Selection -->
          <div class="form-group mb-3">
            <label class="form-label">
              Time <span style="color: var(--text-ds-danger-300);">*</span>
            </label>
            <div class="weekly-time-picker">
              <TimePicker
                bind:value={selectedTime}
                placeholder="Select time"
                on:change={handleTimeChange}
              />
            </div>
          </div>
        </div>

        <!-- Weekly schedule preview -->
        {#if selectedWeekDays.length > 0 && selectedTime}
          <div class="schedule-preview mb-3">
            <p class="text-ds-font-size-12 mb-0">
              <span style="color: var(--text-ds-neutral-300);">Run</span>
              <span style="color: var(--text-ds-neutral-50);">
                every {formatWeekDays(selectedWeekDays)} at {formatTimeDisplay(
                  selectedTime,
                )}
              </span>
            </p>
          </div>
        {/if}
      {/if}
    </div>
    <div
      style="height: 1px; background-color: var(--bg-ds-surface-100); margin: 20px 0;"
    ></div>
    <!-- Notifications Section -->
    <div class="form-group mb-4">
      <label
        class="form-label text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium mb-2"
        style="color: var(--text-ds-neutral-300);"
      >
        Notifications
      </label>
      <!-- Email Recipients -->
      <div class="form-group mb-3">
        <label class="form-label"> Email Recipients </label>

        <div class="email-picker-container">
          <InviteUserPicker
            list={notificationSuggestions}
            id="schedule-notification-emails"
            currentWorkspaceUsers={[]}
            onChange={handleNotificationEmailsChange}
            defaultEmail={creatorEmail}
          />
        </div>
      </div>
    </div>

    <!-- Notification Preferences -->
    <div class="form-group mb-4">
      <label class="form-label text-ds-font-size-14 mb-2">
        Receive Notifications
      </label>
      <div class="radio-options-row">
        <RadioButton
          id="notification-failure"
          name="notification-preference"
          value="failure"
          group={notificationPreference}
          labelText="On Failure Only"
          handleChange={handleNotificationPrefChange}
          buttonSize="medium"
        />

        <RadioButton
          id="notification-all"
          name="notification-preference"
          value="every_time"
          group={notificationPreference}
          labelText="On Every Run (Success/Failure)"
          handleChange={handleNotificationPrefChange}
          buttonSize="medium"
        />
      </div>
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
      title={isScheduling ? "Scheduling.." : "Schedule Run"}
      type="primary"
      onClick={handleScheduleRun}
      disable={!scheduleName.trim() ||
        (selectedCycle === "Once" && (!selectedDate || !selectedTime)) ||
        (selectedCycle === "Daily" && !selectedTime) ||
        (selectedCycle === "Hourly" && !selectedHours) ||
        (selectedCycle === "Weekly" &&
          (selectedWeekDays.length === 0 || !selectedTime))}
      loader={isScheduling}
    />
  </div>
</div>

<style lang="scss">
  .radio-options-row {
    display: flex;
    gap: 24px;
    align-items: center;
    flex-direction: row;
    width: 100%;
    margin-top: 4px;
  }

  .hourly-selector {
    width: 100%;
    margin-bottom: 16px;
  }

  .selector-container {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    margin-top: -25px;
  }

  .interval-label {
    color: var(--text-ds-neutral-200);
    font-size: 14px;
    white-space: nowrap;
  }

  .progress-bar-wrapper {
    flex: 1;
    min-width: 0;
    margin-top: 37px;
  }

  .number-input-wrapper {
    width: 70px;
  }
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
    font-size: 14px;
    font-weight: 500;
    line-height: 1.3;
    color: var(--text-ds-neutral-200);
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
    margin-top: 16px;
  }

  .weekly-selector {
    width: 100%;
    margin-bottom: 16px;
  }

  .day-chips-container {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 8px;
    width: 100%;
  }

  .day-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 1;
    min-width: 0;
    text-align: center;
    outline: none;
    user-select: none;
    height: 40px;

    // IMPORTANT: Keep consistent border width to prevent layout shifts
    border: 2px solid transparent; // Always 2px border

    // Default state - light gray background, transparent border
    &:not(:hover):not(.selected):not(:disabled) {
      background-color: var(--bg-ds-surface-400);
      border-color: transparent; // Keep transparent
      color: var(--text-ds-neutral-200);
    }

    // Hover state - darker gray background, transparent border
    &:hover:not(.selected):not(:disabled) {
      background-color: var(--bg-ds-surface-500);
      border-color: transparent; // Keep transparent
      color: var(--text-ds-neutral-100);
    }

    // Selected state - transparent background, blue border
    &.selected {
      background-color: transparent !important;
      border-color: #3b82f6 !important; // Use explicit color
      color: var(--text-ds-neutral-100);
      font-weight: 600;

      &:hover {
        background-color: rgba(59, 130, 246, 0.05) !important;
        border-color: #3b82f6 !important;
      }
    }

    // Ensure hover doesn't override selected state
    &:hover:not(.selected):not(:disabled) {
      background-color: var(--bg-ds-surface-500);
      border-color: transparent;
      color: var(--text-ds-neutral-100);
    }

    // Disabled state - gray with reduced opacity
    &:disabled {
      background-color: var(--bg-ds-surface-300);
      border-color: transparent;
      color: var(--text-ds-neutral-400);
      cursor: not-allowed;
      opacity: 0.5;
    }

    &:active:not(:disabled) {
      transform: translateY(1px);
    }
  }
  .weekly-time-picker {
    width: 100%; // Full width instead of max-width: 200px

    // Override TimePicker styles to take full width
    :global(.time-picker-container) {
      width: 100%;
    }

    :global(.time-input) {
      width: 100%;
    }
  }
</style>
