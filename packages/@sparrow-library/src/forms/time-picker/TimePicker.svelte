<script lang="ts">
  import { createEventDispatcher, onMount, tick } from "svelte";
  import { Button } from "@sparrow/library/ui";
  import { ClockRegular } from "@sparrow/library/icons";

  export let value = "16:00";
  export let placeholder = "Select time";
  export let disabled = false;

  const dispatch = createEventDispatcher();

  let showTimePicker = false;
  let selectedHour = "16";
  let selectedMinute = "00";
  let timePickerRef: HTMLDivElement;
  let timePickerContainer: HTMLDivElement;
  let timeInputRef: HTMLInputElement;
  let hoursScrollArea: HTMLDivElement;
  let minutesScrollArea: HTMLDivElement;
  let showAbove = false;
  let isInvalid = false;
  let internalValue = value; // Track internal value for validation

  // Generate hours and minutes arrays
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );

  // Initialize selected time from value prop
  $: if (value !== internalValue && !isInvalid) {
    internalValue = value;
    if (value && value !== "") {
      const [hour, minute] = value.split(":");
      selectedHour = hour || "16";
      selectedMinute = minute || "00";
    }
  }

  // Parse time from string in format "HH:MM"
  function parseTime(timeStr: string): { hour: string; minute: string } | null {
    // Validate format using regex (HH:MM)
    const regex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
    const match = timeStr.match(regex);

    if (!match) return null;

    return {
      hour: match[1],
      minute: match[2],
    };
  }

  // Handle manual input
  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    internalValue = target.value;

    // If empty, clear the time
    if (!internalValue.trim()) {
      isInvalid = false;
      value = "";
      dispatch("change", "");
      return;
    }

    // Try to parse the time
    const time = parseTime(internalValue);
    if (time) {
      // Valid time - update state
      isInvalid = false;
      value = internalValue;
      selectedHour = time.hour;
      selectedMinute = time.minute;
      dispatch("change", internalValue);
    } else {
      // Invalid time - show error but keep the text
      isInvalid = true;
    }
  }

  // Handle blur event to format time
  function handleBlur() {
    if (!internalValue.trim()) {
      isInvalid = false;
      value = "";
      dispatch("change", "");
      return;
    }

    // If invalid, try to repair common patterns
    if (isInvalid) {
      let hour: string | null = null;
      let minute: string | null = null;

      // Try H:MM format
      const singleDigitRegex = /^(\d):([0-5][0-9])$/;
      let match = internalValue.match(singleDigitRegex);
      if (match) {
        hour = match[1].padStart(2, "0");
        minute = match[2];
      }

      // Try HH.MM format
      const dotRegex = /^([0-1][0-9]|2[0-3])\.([0-5][0-9])$/;
      match = internalValue.match(dotRegex);
      if (!hour && match) {
        hour = match[1];
        minute = match[2];
      }

      // Try HHMM format (no separator)
      const noSepRegex = /^([0-1][0-9]|2[0-3])([0-5][0-9])$/;
      match = internalValue.match(noSepRegex);
      if (!hour && match) {
        hour = match[1];
        minute = match[2];
      }

      if (hour && minute) {
        selectedHour = hour;
        selectedMinute = minute;
        value = `${hour}:${minute}`;
        internalValue = value;
        isInvalid = false;
        dispatch("change", value);
      } else {
        // Format could not be repaired
        internalValue = value || ""; // Revert to last valid value
      }
    }
  }

  const handleTimeSelect = (hour: string, minute: string) => {
    selectedHour = hour;
    selectedMinute = minute;
    const timeString = `${hour}:${minute}`;
    value = timeString;
    internalValue = timeString;
    isInvalid = false;
    dispatch("change", timeString);
  };

  const handleNow = () => {
    const now = new Date();
    const hour = now.getHours().toString().padStart(2, "0");
    const minute = now.getMinutes().toString().padStart(2, "0");
    handleTimeSelect(hour, minute);
    scrollToSelected();
  };

  const handleClear = () => {
    selectedHour = "00";
    selectedMinute = "00";
    value = "";
    internalValue = "";
    isInvalid = false;
    dispatch("change", "");
    scrollToSelected();
    showTimePicker = false;
  };

  const toggleTimePicker = () => {
    if (disabled) return;

    if (!showTimePicker) {
      const inputRect = timeInputRef.getBoundingClientRect();
      const estimatedPickerHeight = 250;
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - inputRect.bottom;

      showAbove = spaceBelow < estimatedPickerHeight + 10;
      showTimePicker = true;
      setTimeout(() => {
        checkPosition();
        scrollToSelected();
      }, 10);
    } else {
      showTimePicker = false;
    }
  };

  const checkPosition = () => {
    if (!timeInputRef || !timePickerRef) return;

    const inputRect = timeInputRef.getBoundingClientRect();
    const pickerHeight = timePickerRef.offsetHeight;
    const windowHeight = window.innerHeight;
    const spaceBelow = windowHeight - inputRect.bottom;

    showAbove = spaceBelow < pickerHeight + 10;
  };

  $: if (showTimePicker) {
    window.addEventListener("resize", checkPosition);
  } else {
    window.removeEventListener("resize", checkPosition);
  }

  const scrollToSelected = async () => {
    await tick();

    if (hoursScrollArea && minutesScrollArea) {
      const hourIndex = hours.indexOf(selectedHour);
      const minuteIndex = minutes.indexOf(selectedMinute);

      const itemHeight = 28;
      const containerHeight = 200;
      const scrollOffset = containerHeight / 2 - itemHeight / 2;

      const hourScrollTop = Math.max(0, hourIndex * itemHeight - scrollOffset);
      const minuteScrollTop = Math.max(
        0,
        minuteIndex * itemHeight - scrollOffset,
      );

      hoursScrollArea.scrollTop = hourScrollTop;
      minutesScrollArea.scrollTop = minuteScrollTop;
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      timePickerRef &&
      !timePickerRef.contains(event.target as Node) &&
      timeInputRef &&
      !timeInputRef.contains(event.target as Node)
    ) {
      showTimePicker = false;
    }
  };

  $: if (showTimePicker) {
    document.addEventListener("mousedown", handleClickOutside);
  } else {
    document.removeEventListener("mousedown", handleClickOutside);
  }

  onMount(() => {
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", checkPosition);
    };
  });
</script>

<div class="time-picker-container" bind:this={timePickerContainer}>
  <div class="time-input-wrapper">
    <input
      bind:this={timeInputRef}
      type="text"
      value={internalValue}
      class="time-input"
      class:invalid={isInvalid}
      class:disabled
      {disabled}
      {placeholder}
      on:click={() => !disabled && !showTimePicker && toggleTimePicker()}
      on:input={handleInput}
      on:blur={handleBlur}
      title={isInvalid
        ? "Please enter a valid time in HH:MM 24-hour format"
        : ""}
    />
    <div
      class="time-input-icon"
      on:click={() => !disabled && toggleTimePicker()}
    >
      <ClockRegular />
    </div>
    {#if isInvalid}
      <div class="time-input-error">Please enter a valid time (HH:MM)</div>
    {/if}
  </div>

  {#if showTimePicker}
    <div
      bind:this={timePickerRef}
      class="time-picker-modal {showAbove ? 'time-picker-above' : ''}"
    >
      <div class="time-selection-grid">
        <div class="time-column hours-column">
          <div class="time-scroll-area" bind:this={hoursScrollArea}>
            <div class="time-options">
              {#each hours as hour, index}
                <button
                  type="button"
                  on:click={() => handleTimeSelect(hour, selectedMinute)}
                  class="time-option"
                  class:selected={selectedHour === hour}
                  data-hour={hour}
                  style="height: 28px; border-radius:4px;"
                >
                  {hour}
                </button>
              {/each}
            </div>
          </div>
        </div>

        <div class="time-column minutes-column">
          <div class="time-scroll-area" bind:this={minutesScrollArea}>
            <div class="time-options">
              {#each minutes as minute, index}
                <button
                  type="button"
                  on:click={() => handleTimeSelect(selectedHour, minute)}
                  class="time-option"
                  class:selected={selectedMinute === minute}
                  data-minute={minute}
                  style="height: 28px; border-radius:4px;"
                >
                  {minute}
                </button>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <div class="time-actions">
        <Button
          title="Now"
          type="outline-primary"
          size="small"
          onClick={handleNow}
          customWidth="auto"
          buttonClassProp="flex-1"
        />
        <Button
          title="Clear"
          type="outline-secondary"
          size="small"
          onClick={handleClear}
          customWidth="auto"
          buttonClassProp="flex-1"
        />
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .time-picker-container {
    position: relative;
    display: inline-block;
    min-width: fit-content;
    width: 100%;
  }

  .time-input-wrapper {
    position: relative;
    display: inline-block;
    width: 100%;
  }

  .time-input {
    background-color: #1d212b;
    color: var(--text-ds-neutral-100);
    padding: 8px 40px 8px 12px;
    border: 1px solid var(--border-ds-default);
    border-radius: 4px;
    cursor: text; /* Changed to text for manual input */
    font-size: 14px;
    font-weight: 500;
    width: 100%;
    box-sizing: border-box;
    caret-color: var(--border-ds-primary-300);

    &:focus {
      outline: none;
      border: 2px solid var(--border-ds-primary-300);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &::placeholder {
      color: var(--text-ds-neutral-400);
    }

    &.invalid {
      border-color: var(--text-ds-danger-300);
      box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.1);
    }
  }

  .time-input-icon {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-ds-neutral-400);
    font-size: 16px;
    cursor: pointer; /* Make icon clickable */
    padding: 4px;
    z-index: 1;
  }

  .time-input-error {
    position: absolute;
    left: 0;
    top: 100%;
    margin-top: 4px;
    font-size: 12px;
    color: var(--text-ds-danger-300);
    background-color: rgba(220, 38, 38, 0.05);
    padding: 2px 8px;
    border-radius: 4px;
    z-index: 5;
    max-width: calc(100% - 16px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .time-picker-modal {
    position: absolute;
    top: 110%;
    left: 0;
    z-index: 9999;
    background-color: #1d212b;
    border: 1px solid var(--border-ds-default);
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
    padding: 0;
    margin-top: 8px;
    width: 180px;
    min-width: 180px;
    max-width: 180px;
    overflow: hidden;
    transition: transform 0.2s ease;
  }

  .time-picker-above {
    top: auto;
    bottom: 110%;
    margin-top: 0;
    margin-bottom: 8px;
    box-shadow: 0 -10px 25px rgba(0, 0, 0, 0.4);
  }

  .time-selection-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    background-color: #1d212b;
    max-height: 250px;
  }

  .time-column {
    display: flex;
    flex-direction: column;
    min-height: 0;

    &.minutes-column {
      border-right: none;
    }
  }

  .time-scroll-area {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;
    max-height: 200px;
    padding: 0;

    /* Hide scrollbars completely */
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      width: 0;
      height: 0;
      display: none;
    }

    &::-webkit-scrollbar-track {
      display: none;
    }

    &::-webkit-scrollbar-thumb {
      display: none;
    }

    &::-webkit-scrollbar-corner {
      display: none;
    }
  }

  .time-options {
    display: flex;
    flex-direction: column;
    padding: 4px;
    margin: 0;
    gap: 2px;
  }

  .time-option {
    padding: 6px 12px;
    text-align: center;
    border: none;
    background-color: transparent;
    color: var(--text-ds-neutral-300);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s ease;
    flex-shrink: 0;
    min-height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background-color: #2d3748;
      color: var(--text-ds-neutral-100);
    }

    &.selected {
      background-color: var(--bg-ds-primary-400);
      color: white;
      font-weight: 600;
    }

    &:last-child {
      border-bottom: none;
    }
  }

  .time-actions {
    display: flex;
    background-color: transparent;
    border-top: 1px solid #2d3142;
    flex-shrink: 0;
    padding: 8px;
    gap: 8px;
  }

  :global(.time-actions .flex-1) {
    flex: 1 !important;
  }
</style>
