<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";

  /**
   * input type
   */
  export let variant: "primary" | "stroke" | "inline" = "primary";
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
  let width = "100%";

  /**
   * identifies input is disabled or not
   */
  export let disabled = false;
  export let value = "";
  export let maxlength = 500;
  export let id = "";
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
    if (value.length > 0) {
      enterPressed = true;
    }
  };

  onMount(() => {
    window.addEventListener("click", handleClick);
  });
</script>

<div class="position-relative" style="width: {width}; !important">
  <input
    {id}
    {value}
    on:input={(event) => {
      value = event?.target?.value;
      dispatch("input", event?.target?.value);
    }}
    on:keydown={onKeyPress}
    {type}
    {maxlength}
    class={`${variant} ${size} ${value ? "has-text" : ""} ${enterPressed ? "entered" : ""}  ${isError ? "isError" : ""}  w-100 h-100`}
    {placeholder}
    {disabled}
  />
</div>

<style lang="scss">
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
    font-size: 12px;
    font-weight: 500;
    padding: 8px 4px;
  }
  .medium {
    font-size: 16px;
    font-weight: 500;
    padding: 8px;
  }
  .large {
    font-size: 20px;
    font-weight: 600;
    padding: 8px;
  }
</style>
