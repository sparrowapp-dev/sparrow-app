<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";

  /**
   * input type
   */
  export let variant: "primary" | "stroke" | "inline" | "secondary" = "primary";
  export let type: "text" | "password" = "text";

  export let isError = false;
  /**
   * placeholder - dummy text
   */
  export let placeholder = "placeholder";

  /**
   * height
   */

  let height = "28px";
  export let size: "small" | "medium" | "large" = "medium";

  /**
   * width
   */
  export let width = "100%";

  /**
   * identifies input is disabled or not
   */
  export let disabled = false;
  export let value = "";
  export let maxlength = 500;
  export let id = "";
  export let startIcon;
  export let startIconProps = {};
  let enterPressed = false;

  const dispatch = createEventDispatcher();

  /**
   * blur input on Enter key press
   * @param event - keyboard event
   */
  const onKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(id) as HTMLInputElement;
      inputField.blur();
    }
    if (event.key === "Enter" && value.length > 0) {
      enterPressed = true;
    }
    if (event.key !== "Enter" && value.length > 0) {
      enterPressed = false;
    }
  };

  $: {
    if (value === "") {
      enterPressed = false;
    }
  }
  const handleClick = () => {
    if (value && value?.length > 0) {
      enterPressed = true;
    }
  };

  onMount(() => {
    window.addEventListener("click", handleClick);
  });

  const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    value = target?.value;
    dispatch("input", target?.value);
  };

  const handleBlur = (event: Event) => {
    const target = event.target as HTMLInputElement;
    value = target?.value;
    dispatch("blur", target?.value);
  };

  let textStyle = "";

  if (size === "small") {
    textStyle =
      "text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium";
  } else if (size === "medium") {
    textStyle =
      "text-ds-font-size-14 text-ds-line-height-150 text-ds-font-weight-medium";
  } else if (size === "large") {
    textStyle =
      "text-ds-font-size-20 text-ds-line-height-120 text-ds-font-weight-semi-bold";
  } else {
    textStyle =
      "text-ds-font-size-14 text-ds-line-height-150 text-ds-font-weight-medium";
  }
</script>

<div class="position-relative">
  <!-- Render startIcon if provided -->

  {#if startIcon}
    <div class="input-icon">
      <svelte:component this={startIcon} {...startIconProps} />
    </div>
  {/if}
  <input
    {id}
    {value}
    on:input={handleInput}
    on:blur={handleBlur}
    on:keydown={onKeyPress}
    {type}
    {maxlength}
    class={`${variant} ${size} ${textStyle} ${value ? "has-text" : ""} ${enterPressed ? "entered" : ""}  ${isError ? "isError" : ""} ${startIcon ? "has-icon" : ""}`}
    style="width: {width};"
    {placeholder}
    {disabled}
  />
</div>

<style lang="scss">
  .input-wrapper {
    position: relative;
    display: inline-block;
  }

  .input-icon {
    position: absolute;
    top: 50%;
    left: 8px;
    transform: translateY(-50%);
    color: var(--text-ds-neutral-400);
    pointer-events: none; /* Prevent interaction with the icon */
    z-index: 2;
  }

  /* Add padding to inputs with icons */
  .has-icon {
    padding-left: 36px !important; /* Make space for the icon */
  }
  .stroke {
    color: var(--text-ds-neutral-50);
    background-color: transparent;
    border: 1px solid var(--border-ds-neutral-600);
    border-radius: 4px;
    gap: 8px;
    caret-color: var(--border-ds-primary-300);
    line-height: 150%;
    // padding: 2px 8px;
    // font-size: 12px !important;
    // font-weight: 500;
  }
  .stroke.isError {
    border: 2px solid var(--border-ds-danger-300) !important;
    border-radius: 4px;
  }
  .stroke::placeholder {
    color: var(--text-ds-neutral-400) !important;
  }
  .stroke:focus {
    outline: none;
    background-color: var(--bg-ds-surface-400);
    border: 2px solid var(--border-ds-primary-300);
  }
  // during typing
  .stroke.has-text {
    border: 1px solid var(--border-ds-primary-300);
    border-radius: 4px;
  }
  // when it have text but not foucsed
  .stroke.has-text:not(:focus) {
    border: 1px solid var(--border-ds-neutral-600);
    border-radius: 4px;
  }
  // when it have text  and focused
  .stroke.entered:focus {
    background-color: var(--bg-ds-surface-400);
    border: 2px solid var(--border-ds-primary-300);
    border-radius: 4px;
  }
  // when it have text and not focused
  .stroke:not(:focus):hover {
    border: 1px solid var(--border-ds-neutral-300);
    border-radius: 4px;
  }

  .primary {
    color: var(--text-ds-neutral-50);
    background-color: var(--bg-ds-surface-400);
    border: 1px solid transparent;
    border-radius: 4px;
    gap: 8px;
    caret-color: var(--border-ds-primary-300);
    line-height: 150%;
    // padding: 2px 8px;
    // font-size: 12px !important;
    // font-weight: 500;
  }
  .primary.isError {
    border: 2px solid var(--border-ds-danger-300) !important;
    border-radius: 4px;
  }
  .primary::placeholder {
    color: var(--text-ds-neutral-400) !important;
  }
  .primary:focus {
    outline: none;
    background-color: var(--bg-ds-surface-400);
    border: 2px solid var(--border-ds-primary-300);
  }
  // during typing
  .primary.has-text {
    border: 1px solid var(--border-ds-primary-300);
    border-radius: 4px;
  }
  // when it have text but not foucsed
  .primary.has-text:not(:focus) {
    border: 1px solid var(--border-ds-neutral-600);
    border-radius: 4px;
  }
  // when it have text  and focused
  .primary.entered:focus {
    background-color: var(--bg-ds-surface-400);
    border: 2px solid var(--border-ds-primary-300);
    border-radius: 4px;
  }
  // when it have text and not focused
  .primary:not(:focus):hover {
    border: 1px solid var(--border-ds-neutral-300);
    border-radius: 4px;
  }

  /** secondary */
  .secondary {
    color: var(--text-ds-neutral-50);
    background-color: var(--bg-ds-surface-600);
    border: 1px solid transparent;
    border-radius: 4px;
    gap: 8px;
    caret-color: var(--border-ds-primary-300);
    line-height: 150%;
  }

  .secondary.isError {
    border: 2px solid var(--border-ds-danger-300) !important;
    border-radius: 4px;
  }
  .secondary::placeholder {
    color: var(--text-ds-neutral-400) !important;
  }
  .secondary:focus {
    outline: none;
    background-color: var(--bg-ds-surface-400);
    border: 2px solid var(--border-ds-primary-300);
  }
  // during typing
  .secondary.has-text {
    border: 1px solid var(--border-ds-primary-300);
    border-radius: 4px;
  }
  // when it have text but not foucsed
  .secondary.has-text:not(:focus) {
    border: 1px solid transparent;
    border-radius: 4px;
  }
  // when it have text  and focused
  .secondary.entered:focus {
    background-color: var(--bg-ds-surface-400);
    border: 2px solid var(--border-ds-primary-300);
    border-radius: 4px;
  }
  // when it have text and not focused
  .secondary:not(:focus):hover {
    border: 1px solid var(--border-ds-neutral-300);
    border-radius: 4px;
  }

  /** inline */

  .inline {
    color: var(--text-ds-neutral-50);
    background-color: transparent;
    border: 1px solid transparent;
    border-radius: 4px;
    padding: 2px 8px;
    gap: 8px;
    caret-color: var(--border-ds-primary-300);
    // font-size: 12px !important;
    // font-weight: 500;
    line-height: 150%;
  }
  .inline.isError {
    border: 2px solid var(--border-ds-danger-300) !important;
    border-radius: 4px;
  }
  .inline::placeholder {
    color: var(--text-ds-neutral-400) !important;
  }
  .inline:focus {
    outline: none;
    // background-color: var(--bg-ds-surface-400);
    border: 2px solid var(--border-ds-primary-300);
  }
  // during typing
  .inline.has-text {
    border: 1px solid var(--border-ds-primary-300);
    border-radius: 4px;
  }
  // when it have text but not foucsed
  .inline.has-text:not(:focus) {
    border: 1px solid var(--border-ds-neutral-600);
    border-radius: 4px;
  }
  // when it have text  and focused
  .inline.entered:focus {
    // background-color: var(--bg-ds-surface-400);
    border: 1px solid var(--border-ds-primary-300);
    border-radius: 4px;
  }
  // when it have text and not focused
  .inline:not(:focus):hover {
    border: 1px solid var(--border-ds-neutral-300);
    border-radius: 4px;
  }

  // Default State
  .inline.has-text:not(:focus):not(:hover) {
    border-color: transparent;
  }

  .small {
    height: 28px;

    padding: 8px 4px;
  }
  .medium {
    height: 36px;

    padding: 8px;
  }
  .large {
    height: 40px;
    padding: 8px;
  }

  .input-wrapper {
    position: relative;
    width: 100%;
  }

  .input-icon {
    position: absolute;
    top: 50%;
    left: 8px;
    transform: translateY(-50%);
    color: var(--text-ds-neutral-400);
    pointer-events: none; /* Prevent interaction with the icon */
  }

  .input {
    padding-left: 36px; /* Add padding to avoid overlap with the icon */
  }
</style>
