<script lang="ts">
  import { Button, RadioButton, StepProgressBar } from "@sparrow/library/ui";
  import {
    Input,
    Select,
    TimePicker,
    DatePicker,
  } from "@sparrow/library/forms";
  import { NumberInput } from "@sparrow/common/components";
  import { EmailReceipentsPicker } from "@sparrow/common/components";
  import { onMount } from "svelte";
  import { environmentType } from "@sparrow/common/enums";

  export let schedule = null;
  export let environments = [];
  export let workspaceUsers = [];
  export let onUpdateSchedule = (updatedSchedule) => {};
  export let onSaveSchedule;

  let updateDebounceTimer = null;
  const UPDATE_DEBOUNCE_TIME = 300;

  // Function to update schedule in real-time
  function updateScheduleRealtime() {
    clearTimeout(updateDebounceTimer);
    updateDebounceTimer = setTimeout(() => {
      // Only update if values have changed
      if (!isFormDirty) return;

      // Create runConfiguration object based on cycle type
      let runConfiguration = {
        runCycle: selectedCycle,
      };

      switch (selectedCycle) {
        case "once":
          if (formattedDate && selectedTime) {
            runConfiguration.executeAt = formatDateForAPI(
              formattedDate,
              selectedTime,
            );
          }
          break;
        case "daily":
          if (selectedTime) {
            runConfiguration.time = selectedTime;
          }
          break;
        case "weekly":
          // Convert day values to day numbers
          if (days.length > 0) {
            runConfiguration.days = days
              .map((dayValue) => {
                const day = weekDays.find((d) => d.value === dayValue);
                return day ? day.dayNumber : undefined;
              })
              .filter((day) => day !== undefined);
          }
          if (selectedTime) {
            runConfiguration.time = selectedTime;
          }
          break;
        case "hourly":
          runConfiguration.intervalHours = intervalHours;
          break;
      }

      const updatedSchedule = {
        name: scheduleName,
        environmentId: selectedEnvironment || undefined,
        runConfiguration,
        notification: {
          emails: notificationEmails,
          receiveNotifications,
        },
      };

      // Call the update function from parent
      onUpdateSchedule(updatedSchedule);
    }, UPDATE_DEBOUNCE_TIME);
  }

  // Form state
  let scheduleName = "";
  let selectedEnvironment = "";
  let isError = false;
  let isUpdating = false;
  let isFormDirty = false;

  // Run Configuration
  let selectedCycle = "once"; // once, daily, hourly, weekly
  let executeAt = "";
  let selectedDate = new Date();
  let selectedTime = "";

  // Hourly specific variables
  const hourOptions = ["1h", "6h", "12h", "24h"];
  const hourValues = [1, 6, 12, 24];
  let intervalHours = 1;
  let hourlyProgressStep = 0;

  // Weekly specific variables
  let days = [];

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

  // Notification variables
  let notificationEmails = [];
  let receiveNotifications = "failure";

  // Store initial values to track changes
  let initialFormData = null;

  // Format environments for Select component
  $: formattedEnvironments = environments.map((env) => ({
    id: env.id,
    name: env.name,
    description: "",
  }));

  // Use the workspace users directly for notification suggestions
  $: notificationSuggestions = workspaceUsers.map((user) => ({
    email: user.email,
    name: user.name || "",
  }));

  // Run Cycle options
  const cycleOptions = [
    { id: "once", name: "Once", value: "once" },
    { id: "daily", name: "Daily", value: "daily" },
    { id: "hourly", name: "Hourly", value: "hourly" },
    { id: "weekly", name: "Weekly", value: "weekly" },
  ];

  // Format date string for use with DatePicker
  function formatDateString(date) {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // Parse date string from DatePicker
  function parseDateString(dateString) {
    if (!dateString) return new Date();
    const [day, month, year] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  // Formatted date string for the DatePicker
  let formattedDate = "";

  // Initialize form with schedule data
  onMount(() => {
    if (schedule) {
      scheduleName = schedule.name || "";
      selectedEnvironment = schedule.environmentId || "";
      selectedCycle = schedule.runConfiguration?.runCycle || "once";

      if (selectedCycle === "once" && schedule.runConfiguration?.executeAt) {
        const executeAtDate = new Date(schedule.runConfiguration.executeAt);
        selectedDate = executeAtDate;
        formattedDate = formatDateString(executeAtDate);

        const hours = executeAtDate.getHours().toString().padStart(2, "0");
        const minutes = executeAtDate.getMinutes().toString().padStart(2, "0");
        selectedTime = `${hours}:${minutes}`;
      } else {
        selectedTime = schedule.runConfiguration?.time || "";
      }

      intervalHours = schedule.runConfiguration?.intervalHours || 1;
      days = schedule.runConfiguration?.days || [];

      // Convert numeric days to weekday values for UI
      if (days.length > 0 && typeof days[0] === "number") {
        days = days
          .map((dayNum) => {
            const weekday = weekDays.find((wd) => wd.dayNumber === dayNum);
            return weekday ? weekday.value : null;
          })
          .filter(Boolean);
      }

      notificationEmails = schedule.notification?.emails;
      receiveNotifications =
        schedule.notification?.receiveNotifications || "failure";

      // Store initial form data for comparison
      initialFormData = {
        scheduleName,
        selectedEnvironment,
        selectedCycle,
        formattedDate,
        selectedTime,
        intervalHours,
        days: [...days],
        notificationEmails: [...notificationEmails],
        receiveNotifications,
      };
    }
  });

  function formatTimeDisplay(timeStr) {
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

  const formatScheduleText = (dateStr, timeStr, cycle) => {
    if (!dateStr || !timeStr) return "";
    const date = parseDateString(dateStr);
    const [hours, minutes] = timeStr.split(":");
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    const options = {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    return `${cycle.toLowerCase()} on ${date.toLocaleDateString("en-US", options)}`;
  };

  // Reactive schedule preview text
  $: schedulePreviewText = formatScheduleText(
    formattedDate,
    selectedTime,
    selectedCycle,
  );

  // Check form dirty state when any value changes
  function checkFormDirty() {
    if (!initialFormData) return false;

    isFormDirty =
      scheduleName !== initialFormData.scheduleName ||
      selectedEnvironment !== initialFormData.selectedEnvironment ||
      selectedCycle !== initialFormData.selectedCycle ||
      formattedDate !== initialFormData.formattedDate ||
      selectedTime !== initialFormData.selectedTime ||
      intervalHours !== initialFormData.intervalHours ||
      JSON.stringify(days) !== JSON.stringify(initialFormData.days) ||
      JSON.stringify(notificationEmails) !==
        JSON.stringify(initialFormData.notificationEmails) ||
      receiveNotifications !== initialFormData.receiveNotifications;
  }

  const handleEnvironmentSelect = (envId) => {
    selectedEnvironment = envId;
    checkFormDirty();
    updateScheduleRealtime();
  };

  // Handler for cycle selection
  const handleCycleSelect = (cycle) => {
    selectedCycle = cycle;
    checkFormDirty();
    updateScheduleRealtime();
  };

  // Handle schedule name change
  const handleScheduleNameChange = (e) => {
    scheduleName = e.detail;
    checkFormDirty();
    updateScheduleRealtime();
  };

  // Handle date change
  const handleDateChange = (e) => {
    formattedDate = e.detail;
    checkFormDirty();
    updateScheduleRealtime();
  };

  // Handle time change
  const handleTimeChange = (event) => {
    selectedTime = event.detail;
    checkFormDirty();
    updateScheduleRealtime();
  };

  // Handle hourly interval change
  function handleHourlyNumberChange(event) {
    intervalHours = parseInt(event.detail) || 1;
    checkFormDirty();

    const valueIndex = hourValues.indexOf(intervalHours);
    if (valueIndex !== -1) {
      hourlyProgressStep = valueIndex;
    } else {
      // Find closest step for button highlighting
      let closestIndex = 0;
      let minDifference = Math.abs(hourValues[0] - intervalHours);

      for (let i = 1; i < hourValues.length; i++) {
        const difference = Math.abs(hourValues[i] - intervalHours);
        if (difference < minDifference) {
          minDifference = difference;
          closestIndex = i;
        }
      }
      hourlyProgressStep = closestIndex;
    }
    updateScheduleRealtime();
  }

  // Handle progress bar change
  function handleHourlyProgressChange(event) {
    const { value } = event.detail;
    intervalHours = value;
    checkFormDirty();
    updateScheduleRealtime();
  }

  // Format week days for display
  function formatWeekDays(selectedDays) {
    if (!selectedDays || selectedDays.length === 0) return "";
    if (selectedDays.length === 7) return "day";
    if (selectedDays.length === 1) {
      const day = weekDays.find((wd) => wd.value === selectedDays[0]);
      return day ? day.label : selectedDays[0];
    }

    const dayLabels = selectedDays
      .map((d) => weekDays.find((wd) => wd.value === d)?.label)
      .filter(Boolean);
    const lastDay = dayLabels[dayLabels.length - 1];
    const otherDays = dayLabels.slice(0, -1);
    return `${otherDays.join(", ")} and ${lastDay}`;
  }

  // Handle day selection for weekly schedule
  function handleWeekDaySelect(dayValue) {
    if (days.includes(dayValue)) {
      days = days.filter((d) => d !== dayValue);
    } else {
      days = [...days, dayValue];
    }
    checkFormDirty();
    updateScheduleRealtime();
  }

  // Handle notification emails change
  function handleNotificationEmailsChange(emails) {
    notificationEmails = emails;
    checkFormDirty();
    updateScheduleRealtime();
  }

  // Handle notification preference change
  function handleNotificationPrefChange(event) {
    receiveNotifications = event.target.value;
    checkFormDirty();
    updateScheduleRealtime();
  }

  // Format date for API
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

  // Save changes handler
  const handleSaveChanges = async () => {
    isUpdating = true;

    try {
      // Call onSaveSchedule instead of onUpdateSchedule
      const result = await onSaveSchedule();

      if (result && result.success) {
        // Update initialFormData to new values after successful save
        initialFormData = {
          scheduleName,
          selectedEnvironment,
          selectedCycle,
          formattedDate,
          selectedTime,
          intervalHours,
          days: [...days],
          notificationEmails: [...notificationEmails],
          receiveNotifications,
        };

        // Reset form dirty state
        isFormDirty = false;
      } else {
        console.error("Failed to save schedule:", result?.error);
        // Optionally show error notification here
      }
    } catch (error) {
      console.error("Error while saving schedule:", error);
      // Optionally show error notification here
    } finally {
      isUpdating = false;
    }
  };

  const handleCancel = () => {
    // Reset all form fields to initial values
    if (initialFormData) {
      scheduleName = initialFormData.scheduleName;
      selectedEnvironment = initialFormData.selectedEnvironment;
      selectedCycle = initialFormData.selectedCycle;
      formattedDate = initialFormData.formattedDate;
      selectedTime = initialFormData.selectedTime;
      intervalHours = initialFormData.intervalHours;
      days = [...initialFormData.days];
      notificationEmails = [...initialFormData.notificationEmails];
      receiveNotifications = initialFormData.receiveNotifications;

      // Reset dirty state
      isFormDirty = false;
    }
  };

  // Keep selectedDate in sync with formattedDate
  $: if (formattedDate) {
    selectedDate = parseDateString(formattedDate);
  }
</script>

<div class="configurations-container">
  <div class="configurations-scroll-area">
    <div class="schedule-config-content">
      <!-- Schedule Name Input -->
      <div class="form-group mb-3">
        <label
          class="form-label text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium mb-2"
          style="color: var(--text-ds-neutral-200);"
        >
          Schedule Name <span style="color: var(--text-ds-danger-300);">*</span>
        </label>
        <Input
          value={scheduleName}
          placeholder="Enter schedule name"
          variant="primary"
          size="medium"
          width="100%"
          {isError}
          id="schedule-name-input"
          on:input={handleScheduleNameChange}
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
                class="cycle-btn {selectedCycle === cycle.value
                  ? 'active'
                  : ''}"
                on:click={() => handleCycleSelect(cycle.value)}
              >
                {cycle.name}
              </button>
            {/each}
          </div>
        </div>

        <!-- Date and Time -->
        {#if selectedCycle === "once"}
          <div class="once-row">
            <div class="once-item">
              <label class="form-label">
                Date <span style="color: var(--text-ds-danger-300);">*</span>
              </label>
              <div class="custom-datepicker">
                <DatePicker
                  value={formattedDate}
                  placeholder="Select date"
                  disabled={false}
                  minDate={new Date()}
                  on:change={handleDateChange}
                />
              </div>
            </div>
            <div class="once-item">
              <label class="form-label">
                Time <span style="color: var(--text-ds-danger-300);">*</span>
              </label>
              <div class="custom-timepicker">
                <TimePicker
                  value={selectedTime}
                  placeholder="Select time"
                  on:change={handleTimeChange}
                />
              </div>
            </div>
          </div>
          <!-- Schedule Preview -->
          {#if selectedDate && selectedTime}
            <div class="schedule-preview mb-3">
              <p class="text-ds-font-size-12 mb-0">
                <span style="color: var(--text-ds-neutral-300);">Run</span>
                <span style="color: var(--text-ds-neutral-50);">
                  {schedulePreviewText}</span
                >
              </p>
            </div>
          {/if}
        {:else if selectedCycle === "daily"}
          <!-- Daily cycle - only show time picker -->
          <div class="once-row">
            <div class="once-item">
              <label class="form-label">
                Time <span style="color: var(--text-ds-danger-300);">*</span>
              </label>
              <div class="custom-timepicker">
                <TimePicker
                  value={selectedTime}
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
        {:else if selectedCycle === "hourly"}
          <div class="hourly-selector form-field">
            <div class="selector-container">
              <div class="interval-label">Every</div>

              <div class="progress-bar-wrapper">
                <StepProgressBar
                  steps={hourOptions}
                  currentValue={intervalHours}
                  minValue={1}
                  maxValue={24}
                  on:change={handleHourlyProgressChange}
                />
              </div>

              <div class="number-input-wrapper">
                <NumberInput
                  value={intervalHours}
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
          {#if intervalHours}
            <div class="schedule-preview mb-3">
              <p class="text-ds-font-size-12 mb-0">
                <span style="color: var(--text-ds-neutral-300);">Run</span>
                <span style="color: var(--text-ds-neutral-50);">
                  every {intervalHours} hour{intervalHours > 1 ? "s" : ""}</span
                >
              </p>
            </div>
          {/if}
        {:else if selectedCycle === "weekly"}
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
                    class="day-chip {days.includes(day.value)
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
                  value={selectedTime}
                  placeholder="Select time"
                  on:change={handleTimeChange}
                />
              </div>
            </div>
          </div>

          <!-- Weekly schedule preview -->
          {#if days.length > 0 && selectedTime}
            <div class="schedule-preview mb-3">
              <p class="text-ds-font-size-12 mb-0">
                <span style="color: var(--text-ds-neutral-300);">Run</span>
                <span style="color: var(--text-ds-neutral-50);">
                  every {formatWeekDays(days)} at {formatTimeDisplay(
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
            <EmailReceipentsPicker
              list={notificationSuggestions}
              id="schedule-notification-emails"
              currentWorkspaceUsers={[]}
              onChange={handleNotificationEmailsChange}
              defaultEmails={notificationEmails}
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
            group={receiveNotifications}
            labelText="On Failure Only"
            handleChange={handleNotificationPrefChange}
            buttonSize="medium"
          />

          <RadioButton
            id="notification-all"
            name="notification-preference"
            value="every_time"
            group={receiveNotifications}
            labelText="On Every Run (Success/Failure)"
            handleChange={handleNotificationPrefChange}
            buttonSize="medium"
          />
        </div>
      </div>
    </div>
  </div>
  <!-- Fixed footer with save button -->
  <div class="configurations-footer">
    <div class="footer-buttons">
      <Button
        title="Save Changes"
        onClick={handleSaveChanges}
        disable={!isFormDirty ||
          !scheduleName.trim() ||
          (selectedCycle === "once" && (!formattedDate || !selectedTime)) ||
          (selectedCycle === "daily" && !selectedTime) ||
          (selectedCycle === "hourly" && !intervalHours) ||
          (selectedCycle === "weekly" && (days.length === 0 || !selectedTime))}
        type="primary"
        loader={isUpdating}
      />
      {#if isFormDirty}
        <Button title="Cancel" onClick={handleCancel} type="secondary" />
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  .configurations-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    position: relative;
    background-color: var(--bg-ds-surface-900);
  }

  .configurations-scroll-area {
    flex: 1;
    overflow-y: auto;
    height: calc(100% - 64px); /* Account for footer height */
  }

  .schedule-config-content {
    padding: 16px 24px 24px 24px;
    min-height: 100%;
    width: 50%;
  }

  .configurations-footer {
    position: sticky; /* Changed from fixed to sticky */
    bottom: 0;
    height: 64px;
    background-color: var(--bg-ds-surface-900);
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 0 24px;
    border-top: 1px solid var(--bg-ds-surface-100);
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.15);
    z-index: 10;
    flex-shrink: 0; /* Prevent footer from shrinking */
    width: 100%; /* Match parent width, not viewport width */
  }
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
    width: 100%;

    :global(.time-picker-container) {
      width: 100%;
    }

    :global(.time-input) {
      width: 100%;
    }
  }

  .footer-buttons {
    display: flex;
    gap: 8px;
    align-items: start;
  }
</style>
