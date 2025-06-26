<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { ChevronUpRegular, ChevronDownRegular } from "@sparrow/library/icons";
  import { Input } from "@sparrow/library/forms";

  export let variant: "primary" | "stroke" | "inline" | "secondary" = "primary";
  export let placeholder = "0";
  export let size: "small" | "medium" | "large" = "medium";
  export let width = "100%";
  export let disabled = false;
  export let value: number | string = 0;
  export let min: number | null;
  export let max: number | null = null; // Set default max to 100
  export let step: number = 1;
  export let id = "";
  export let isError = false;
  export let showErrorMessage: boolean = true;

  const dispatch = createEventDispatcher();
  let inputElement: HTMLInputElement;
  let hasNonNumericInput = false;
  let errorMessage = "";

  // Update the value ensuring it's within bounds
  function updateValue(newValue: number) {
    let validValue = newValue;

    if (min !== null && validValue < min) {
      validValue = min;
      errorMessage = `Value cannot be less than ${min}`;
      isError = true;
    } else if (max !== null && validValue > max) {
      validValue = max;
      errorMessage = `Value cannot exceed ${max}`;
      isError = true;
    } else {
      isError = false;
      errorMessage = "";
    }

    value = validValue;
    hasNonNumericInput = false;
    dispatch("change", validValue);
  }

  // Increment value
  function increment() {
    if (disabled) return;
    const currentValue =
      typeof value === "string" ? parseFloat(value) || 0 : value;
    updateValue(currentValue + step);
    if (inputElement) inputElement.focus();
  }

  // Decrement value
  function decrement() {
    if (disabled) return;
    const currentValue =
      typeof value === "string" ? parseFloat(value) || 0 : value;
    updateValue(currentValue - step);
    if (inputElement) inputElement.focus();
  }

  // Handle keyboard events
  const onKeyPress = (event: KeyboardEvent) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      increment();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      decrement();
    }
  };

  const handleInput = (event: CustomEvent) => {
    const inputValue = event.detail;
    const originalValue = inputValue.toString();

    // Check if input contains non-numeric characters (except for allowed ones)
    const containsInvalidChars = /[^0-9.-]/.test(originalValue);

    // Only allow numeric input with decimal point
    const numericValue = originalValue.replace(/[^0-9.-]/g, "");

    // Set error state if user entered invalid characters
    if (containsInvalidChars) {
      hasNonNumericInput = true;
      isError = true;
      errorMessage = "Please enter numbers only";
    } else {
      hasNonNumericInput = false;
      isError = false;
      errorMessage = "";
    }

    // Handle the case when user enters "-" at the beginning
    if (numericValue === "-") {
      value = numericValue;
      dispatch("input", numericValue);
      return;
    }

    const parsedValue = parseFloat(numericValue);

    if (isNaN(parsedValue)) {
      value = "";
    } else {
      // Check if the value exceeds max and prevent it
      if (max !== null && parsedValue > max) {
        // Don't allow typing values over max
        isError = true;
        errorMessage = `Value cannot exceed ${max}`;
        value = max.toString(); // Set to max value instead
      } else {
        value = numericValue;
      }
    }

    dispatch("input", value);
  };

  const handleBlur = (event: CustomEvent) => {
    const inputValue = event.detail;

    // If the input is empty or contains only invalid characters
    if (!inputValue || inputValue === "") {
      // Just show placeholder, don't set to 0
      value = "";
      isError = false;
      hasNonNumericInput = false;
      errorMessage = "";
      dispatch("blur", value);
      return;
    }

    let numericValue = parseFloat(inputValue);

    if (isNaN(numericValue)) {
      // Input has non-numeric content
      isError = true;
      hasNonNumericInput = true;
      errorMessage = "Please enter a valid number";
      // Don't update to 0, keep the current input for user to correct
      dispatch("blur", value);
      return;
    } else {
      // Check if value exceeds maximum on blur
      if (max !== null && numericValue > max) {
        numericValue = max;
        errorMessage = `Value cannot exceed ${max}`;
        isError = true;
      } else if (min !== null && numericValue < min) {
        numericValue = min;
        errorMessage = `Value cannot be less than ${min}`;
        isError = true;
      } else {
        isError = false;
        hasNonNumericInput = false;
        errorMessage = "";
      }
      updateValue(numericValue);
    }

    dispatch("blur", value);
  };

  function bindInputElement(node) {
    inputElement = node.querySelector("input");
    return {
      destroy() {
        inputElement = null;
      },
    };
  }
</script>

<div class="numeric-input-container">
  <div class="numeric-input-wrapper" use:bindInputElement>
    <Input
      {id}
      bind:value
      on:input={handleInput}
      on:blur={handleBlur}
      on:keydown={onKeyPress}
      type="text"
      {placeholder}
      {variant}
      {size}
      {width}
      {disabled}
      {isError}
    />

    <div class="controls-container">
      <button
        type="button"
        class="control-button up-button"
        on:click={increment}
        disabled={disabled || (max !== null && value >= max)}
      >
        <ChevronUpRegular
          height="12px"
          width="12px"
          color={disabled || (max !== null && value >= max)
            ? "var(--text-ds-neutral-600)"
            : "var(--text-ds-neutral-300)"}
        />
      </button>
      <button
        type="button"
        class="control-button down-button"
        on:click={decrement}
        disabled={disabled || (min !== null && value <= min)}
      >
        <ChevronDownRegular
          height="12px"
          width="12px"
          color={disabled || (min !== null && value <= min)
            ? "var(--text-ds-neutral-600)"
            : "var(--text-ds-neutral-300)"}
        />
      </button>
    </div>
  </div>

  {#if showErrorMessage && (hasNonNumericInput || isError)}
    <div class="error-message">
      {errorMessage}
    </div>
  {/if}
</div>

<style lang="scss">
  .numeric-input-container {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .numeric-input-wrapper {
    position: relative;
    display: inline-block;
    width: 100%;
  }

  .error-message {
    color: var(--text-ds-danger-300);
    font-size: 12px;
    margin-top: 4px;
    line-height: 1.2;
  }

  /* Controls container */
  .controls-container {
    position: absolute;
    right: 5px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    height: calc(100% - 10px);
    background: transparent;
    z-index: 2;
  }

  .control-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    padding: 0;
    height: 50%;
    width: 18px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover:not(:disabled) {
      background-color: var(--bg-ds-surface-600);
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  /* Override for input to make space for buttons */
  :global(.numeric-input-wrapper input) {
    padding-right: 25px !important;
    text-align: left;
  }
</style>
