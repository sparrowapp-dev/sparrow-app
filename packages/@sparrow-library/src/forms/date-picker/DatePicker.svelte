<script lang="ts">
  import { onMount } from "svelte";
  import { Button } from "@sparrow/library/ui";
  import {
    CalendarRegular,
    ArrowLeftRegular,
    ArrowRightRegular,
  } from "@sparrow/library/icons";

  export let value: string = "";
  export let placeholder: string = "Select date";
  export let disabled: boolean = false;
  // New props for min/max dates
  export let minDate: Date | string = null;
  export let maxDate: Date | string = null;

  let showCalendar = false;
  let currentMonth = new Date();
  let selectedDay: number = currentMonth.getDate();
  let selectedMonth: number = currentMonth.getMonth();
  let selectedYear: number = currentMonth.getFullYear();
  let calendarRef: HTMLDivElement;
  let inputRef: HTMLInputElement;
  let showAbove = false;
  let isInvalid = false;
  let internalValue = value; // Track internal value for validation

  // Process min/max dates
  let minDateObj: Date | null = null;
  let maxDateObj: Date | null = null;

  // Process minDate/maxDate when they change
  $: {
    if (minDate) {
      minDateObj =
        minDate instanceof Date ? minDate : parseDate(minDate as string);
    }

    if (maxDate) {
      maxDateObj =
        maxDate instanceof Date ? maxDate : parseDate(maxDate as string);
    }
  }

  // Function to check if a date is disabled (outside min/max range)
  function isDateDisabled(date: Date): boolean {
    if (!date) return false;

    // Reset time components for consistent comparison
    const dateToCheck = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    // Check minDate constraint
    if (minDateObj) {
      const minToCompare = new Date(
        minDateObj.getFullYear(),
        minDateObj.getMonth(),
        minDateObj.getDate(),
      );
      if (dateToCheck < minToCompare) return true;
    }

    // Check maxDate constraint
    if (maxDateObj) {
      const maxToCompare = new Date(
        maxDateObj.getFullYear(),
        maxDateObj.getMonth(),
        maxDateObj.getDate(),
      );
      if (dateToCheck > maxToCompare) return true;
    }

    return false;
  }

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  function pad(n: number) {
    return n.toString().padStart(2, "0");
  }

  function formatDate(day: number, month: number, year: number) {
    return `${pad(day)}-${pad(month + 1)}-${year}`;
  }

  // Parse date from string in format "DD-MM-YYYY"
  function parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;

    // Validate format using regex (DD-MM-YYYY)
    const regex = /^(\d{2})-(\d{2})-(\d{4})$/;
    const match = dateStr.match(regex);

    if (!match) return null;

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // Months are 0-indexed
    const year = parseInt(match[3], 10);

    // Create date and validate it's a real date (e.g., not 31-02-2025)
    const date = new Date(year, month, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day ||
      year < 1900 ||
      year > 2100
    ) {
      return null;
    }

    return date;
  }

  // Handle manual input - updated to check min/max
  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    internalValue = target.value;

    // If empty, clear the date
    if (!internalValue.trim()) {
      isInvalid = false;
      value = "";
      return;
    }

    // Try to parse the date
    const date = parseDate(internalValue);
    if (date) {
      // Check min/max constraints
      if (isDateDisabled(date)) {
        isInvalid = true;
        return;
      }

      // Valid date - update state
      isInvalid = false;
      value = internalValue;
      selectedDay = date.getDate();
      selectedMonth = date.getMonth();
      selectedYear = date.getFullYear();
      currentMonth = new Date(selectedYear, selectedMonth, 1);
    } else {
      // Invalid date - show error but keep the text
      isInvalid = true;
    }
  }

  // Handle blur event to format date - updated for min/max
  function handleBlur() {
    if (!internalValue.trim()) {
      isInvalid = false;
      value = "";
      return;
    }

    // If invalid, try to repair common patterns
    if (isInvalid) {
      // Try some common date formats (MM/DD/YYYY, YYYY-MM-DD, etc.)
      let date: Date | null = null;

      // Try MM/DD/YYYY
      const slashRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
      let match = internalValue.match(slashRegex);
      if (match) {
        date = new Date(
          parseInt(match[3]),
          parseInt(match[1]) - 1,
          parseInt(match[2]),
        );
      }

      // Try YYYY-MM-DD
      const dashRegex = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
      match = internalValue.match(dashRegex);
      if (!date && match) {
        date = new Date(
          parseInt(match[1]),
          parseInt(match[2]) - 1,
          parseInt(match[3]),
        );
      }

      if (date && !isNaN(date.getTime())) {
        // Check if repaired date is within min/max range
        if (isDateDisabled(date)) {
          internalValue = value || ""; // Revert to last valid value
          return;
        }

        selectedDay = date.getDate();
        selectedMonth = date.getMonth();
        selectedYear = date.getFullYear();
        currentMonth = new Date(selectedYear, selectedMonth, 1);
        value = formatDate(selectedDay, selectedMonth, selectedYear);
        internalValue = value;
        isInvalid = false;
      } else {
        // Format could not be repaired
        internalValue = value || ""; // Revert to last valid value
      }
    }
  }

  // Watch for external value changes
  $: if (value !== internalValue && !isInvalid) {
    internalValue = value;

    // Parse value to update selected date in calendar
    const date = parseDate(value);
    if (date) {
      selectedDay = date.getDate();
      selectedMonth = date.getMonth();
      selectedYear = date.getFullYear();
      currentMonth = new Date(selectedYear, selectedMonth, 1);
    }
  }

  function getDaysInMonth(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Previous month days
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        isPrevMonth: true,
        isDisabled: true,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      days.push({
        day,
        isCurrentMonth: true,
        isPrevMonth: false,
        isDisabled: isDateDisabled(currentDate),
      });
    }

    // Next month days
    const totalCells = Math.ceil(days.length / 7) * 7;
    let nextMonthDay = 1;
    for (let i = days.length; i < totalCells; i++) {
      days.push({
        day: nextMonthDay++,
        isCurrentMonth: false,
        isPrevMonth: false,
        isDisabled: true,
      });
    }

    return days;
  }

  $: days = getDaysInMonth(currentMonth);

  function handleDateSelect(dayObj) {
    if (!dayObj.isCurrentMonth || dayObj.isDisabled) {
      return; // Don't select disabled or non-current month days
    }

    selectedDay = dayObj.day;
    selectedMonth = currentMonth.getMonth();
    selectedYear = currentMonth.getFullYear();
    value = formatDate(selectedDay, selectedMonth, selectedYear);
    internalValue = value;
    isInvalid = false;
    showCalendar = false;
  }

  function navigateMonth(direction: number) {
    currentMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + direction,
      1,
    );
  }

  function handleToday() {
    const today = new Date();

    // Check if today is within min/max range
    if (isDateDisabled(today)) {
      return;
    }

    currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    selectedDay = today.getDate();
    selectedMonth = today.getMonth();
    selectedYear = today.getFullYear();
    value = formatDate(selectedDay, selectedMonth, selectedYear);
    internalValue = value;
    isInvalid = false;
    showCalendar = false;
  }

  function handleClear() {
    value = "";
    internalValue = "";
    isInvalid = false;
    showCalendar = false;
  }

  const toggleCalendar = () => {
    if (disabled) return;

    if (!showCalendar) {
      // Pre-calculate days for current month before showing calendar
      if (!days || days.length === 0) {
        days = getDaysInMonth(currentMonth);
      }

      showCalendar = true;

      // Use requestAnimationFrame instead of setTimeout for smoother transitions
      requestAnimationFrame(() => {
        if (inputRef) {
          const inputRect = inputRef.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const spaceBelow = windowHeight - inputRect.bottom;
          const estimatedCalendarHeight = 350;

          showAbove = spaceBelow < estimatedCalendarHeight + 10;
        }
      });
    } else {
      showCalendar = false;
    }
  };

  const checkPosition = () => {
    if (!inputRef || !calendarRef) return;

    const inputRect = inputRef.getBoundingClientRect();
    const calendarHeight = calendarRef.offsetHeight;
    const windowHeight = window.innerHeight;
    const spaceBelow = windowHeight - inputRect.bottom;

    showAbove = spaceBelow < calendarHeight + 10;
  };

  $: if (showCalendar) {
    window.addEventListener("resize", checkPosition);
  } else {
    window.removeEventListener("resize", checkPosition);
  }

  // Click outside to close
  onMount(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        calendarRef &&
        !calendarRef.contains(event.target as Node) &&
        inputRef &&
        !inputRef.contains(event.target as Node)
      ) {
        showCalendar = false;
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", checkPosition);
    };
  });
</script>

<div class="date-picker-container">
  <div class="date-input-wrapper">
    <input
      bind:this={inputRef}
      type="text"
      class="date-input"
      class:invalid={isInvalid}
      value={internalValue}
      {placeholder}
      {disabled}
      on:click={() => !disabled && !showCalendar && toggleCalendar()}
      on:input={handleInput}
      on:blur={handleBlur}
      title={isInvalid ? "Please enter a valid date in DD-MM-YYYY format" : ""}
    />
    <div class="date-input-icon" on:click={() => !disabled && toggleCalendar()}>
      <CalendarRegular />
    </div>
    {#if isInvalid}
      <div class="date-input-error">Please enter a valid date (DD-MM-YYYY)</div>
    {/if}
  </div>

  {#if showCalendar}
    <div
      class="calendar-modal {showAbove ? 'calendar-above' : ''}"
      bind:this={calendarRef}
    >
      <!-- Calendar Header -->
      <div class="calendar-header">
        <Button
          startIcon={ArrowLeftRegular}
          type="outline-secondary"
          size="small"
          onClick={() => navigateMonth(-1)}
          customWidth="32px"
        />
        <div class="calendar-header-center">
          <div class="calendar-header-month">
            {months[currentMonth.getMonth()]}
            {currentMonth.getFullYear()}
          </div>
        </div>
        <Button
          startIcon={ArrowRightRegular}
          type="outline-secondary"
          size="small"
          onClick={() => navigateMonth(1)}
          customWidth="32px"
        />
      </div>

      <!-- Days of Week -->
      <div class="calendar-days-row">
        {#each daysOfWeek as day}
          <div class="calendar-day-name">{day}</div>
        {/each}
      </div>

      <!-- Calendar Grid -->
      <div class="calendar-grid">
        {#each days as dayObj, idx}
          <button
            type="button"
            class="calendar-day
        {dayObj.isCurrentMonth ? '' : 'calendar-day-hidden'} 
        {dayObj.isCurrentMonth &&
            dayObj.day === selectedDay &&
            currentMonth.getMonth() === selectedMonth &&
            currentMonth.getFullYear() === selectedYear
              ? 'calendar-day-selected'
              : ''}
        {dayObj.isDisabled && dayObj.isCurrentMonth
              ? 'calendar-day-disabled'
              : ''}"
            on:click={() => handleDateSelect(dayObj)}
            disabled={!dayObj.isCurrentMonth || dayObj.isDisabled}
          >
            {dayObj.isCurrentMonth ? dayObj.day : ""}
          </button>
        {/each}
      </div>

      <!-- Calendar Footer -->
      <div class="calendar-footer">
        <Button
          title="Today"
          type="outline-primary"
          size="small"
          onClick={handleToday}
          customWidth="auto"
          buttonClassProp="calendar-footer-btn"
        />
        <Button
          title="Clear"
          type="outline-secondary"
          size="small"
          onClick={handleClear}
          customWidth="auto"
          buttonClassProp="calendar-footer-btn"
        />
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .calendar-day-hidden {
    visibility: hidden;
    pointer-events: none;
  }
  .date-picker-container {
    position: relative;
    width: 100%;
  }

  .date-input-wrapper {
    position: relative;
    width: 100%;
  }

  .date-input {
    background-color: #1d212b;
    color: var(--text-ds-neutral-100);
    padding: 8px 40px 8px 12px;
    border: 1px solid var(--border-ds-default);
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    width: 100%;
    box-sizing: border-box;
    outline: none;
    cursor: text; /* Changed to text for input */
    transition: border-color 0.2s;
    caret-color: var(--border-ds-primary-300);

    &:focus {
      outline: none;
      border: 2px solid var(--border-ds-primary-300);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }

    &:disabled {
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

  .date-input-icon {
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

  .date-input-error {
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

  /* Calendar modal styling with position variants */
  .calendar-modal {
    position: absolute;
    top: 110%;
    left: 0;
    z-index: 10;
    background-color: #1d212b;
    border: 1px solid var(--border-ds-default);
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
    width: 350px;
    min-width: 280px;
    padding: 0;
    margin-top: 8px;
    overflow: hidden;
    transition: transform 0.2s ease;
  }

  /* Style for calendar positioned above the input */
  .calendar-above {
    top: auto;
    bottom: 110%;
    margin-top: 0;
    margin-bottom: 8px;
    box-shadow: 0 -10px 25px rgba(0, 0, 0, 0.4);
  }

  .calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 16px 8px 16px;
    border-bottom: 1px solid #2d3142;
    background: transparent;
  }

  .calendar-header-center {
    flex: 1;
    text-align: center;
  }

  .calendar-header-month {
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 2px;
  }

  .calendar-days-row {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
    padding: 0 16px 4px 16px;
    justify-items: center;
  }

  .calendar-day-name {
    color: #a1a1aa;
    text-align: center;
    font-size: 14px;
    font-weight: 500;
    padding: 4px 0;
  }

  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
    padding: 0 16px 8px 16px;
    justify-items: center;
  }

  .calendar-day {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border-radius: 4px;
    color: #e5e7eb;
    border: none;
    font-size: 12px;
    font-weight: 500;
    padding: 0;
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s;
    outline: none;
  }

  .calendar-day:hover:not(:disabled) {
    background: #2d3142;
    color: #fff;
  }

  .calendar-day-selected {
    background: #2563eb;
    color: #fff;
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
  }

  .calendar-day-other {
    color: #6b7280;
    cursor: default;
  }

  .calendar-day-disabled {
    opacity: 0.4;
    cursor: not-allowed !important;
  }

  .calendar-footer {
    display: flex;
    gap: 12px;
    padding: 12px 16px 16px 16px;
    background: transparent;
    border-top: 1px solid #2d3142;
  }

  .calendar-footer-btn {
    flex: 1;
  }
</style>
