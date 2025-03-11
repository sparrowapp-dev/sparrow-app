<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";

  /**
   * input type
   */
  export let variant: "normal" | "strokeTextField" = "strokeTextField";
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

  switch (size) {
    case "small":
      height = "28px";
      break;
    case "medium":
      height = "36px";
      break;
    default:
      height = "28px";
      break;
  }
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

<div
  class="position-relative"
  style="height:{height}; width: {width}; !important"
>
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
    class={`input-field ${variant} ${value ? "has-text" : ""} ${enterPressed ? "entered" : ""}  ${isError ? "isError" : ""}  w-100 h-100`}
    {placeholder}
    {disabled}
  />
</div>

<style lang="scss">
  .SearchIconClass {
    display: flex;
  }
  input {
    caret-color: var(--border-primary-300);
    border: 1px solid transparent;
  }
  input::placeholder {
    color: var(--placeholder-color);
  }
  /* Base style */

  .input-field {
    color: var(--text-ds-neutral-50);
    background-color: transparent;
    border: 1px solid var(--border-ds-neutral-600);
    border-radius: 4px;
    padding: 2px 8px;
    gap: 8px;
    caret-color: var(--border-ds-primary-300);
    font-size: 12px !important;
    font-weight: 500;
    line-height: 150%;
  }
  .input-field.isError {
    border: 2px solid var(--border-ds-danger-300) !important;
    border-radius: 4px;
  }
  .input-field::placeholder {
    color: var(--text-ds-neutral-400) !important;
  }
  .input-field:focus {
    outline: none;
    background-color: var(--bg-ds-surface-400);
    border: 2px solid var(--border-ds-primary-300);
  }
  // during typing
  .input-field.has-text {
    border: 1px solid var(--border-ds-primary-300);
    border-radius: 4px;
  }
  // when it have text but not foucsed
  .input-field.has-text:not(:focus) {
    border: 1px solid var(--border-ds-neutral-600);
    border-radius: 4px;
  }
  // when it have text  and focused
  .input-field.entered:focus {
    background-color: var(--bg-ds-surface-400);
    border: 2px solid var(--border-ds-primary-300);
    border-radius: 4px;
  }
  // when it have text and not focused
  .input-field:not(:focus):hover {
    border: 1px solid var(--border-ds-neutral-300);
    border-radius: 4px;
  }
</style>
