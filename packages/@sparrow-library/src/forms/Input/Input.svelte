<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";

  /**
   * variant type
   */
  export let variant: "normal" | "strokeTextField" | "inlineTextField" =
    "strokeTextField";

  /**
   * input type
   */
  export let type: "text" | "password" = "text";

  /**
   * width
   */
  let width = "100%";

  /**
   * height
   */
  let height = "28px";

  /**
   * id for the input tag and its parent
   */
  export let id = "";

  /**
   * placeholder - dummy text
   */
  export let placeholder = "placeholder";

  /**
   * size of the input
   */
  export let size: "small" | "medium" | "large" = "medium";

  /**
   * Props for custom style and class
   */
  let componentClass = "";
  let componentStyle = "";
  export { componentClass as class };
  export { componentStyle as style };
  // $: console.log(componentStyle);

  /**
   * identifies input is disabled or not
   */
  export let disabled = false;

  /**
   * input text value
   */
  export let value = "";

  /**
   * max length allowed
   */
  export let maxlength = 500;

  export let isError = false;
  let enterPressed = false;

  // Reactive statement to update height based on variant and size
  $: {
    if (variant === "normal") {
      // height = size === "small" ? "24px" : size === "medium" ? "32px" : "40px";
    } else if (variant === "strokeTextField") {
      height = size === "small" ? "28px" : size === "medium" ? "36px" : "44px";
    } else if (variant === "inlineTextField") {
      height = size === "small" ? "24px" : size === "medium" ? "40px" : "40px";
    }
  }

  const dispatch = createEventDispatcher();

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

  const onMouseEnter = () => {};

  const onMouseLeave = () => {};

  const onFocus = (event) => {
    dispatch("focused", event?.target?.value);
  };

  const onBlur = (event) => {
    dispatch("blur", event?.target?.value);
  };

  const onInput = (event) => {
    value = event?.target?.value;
    dispatch("input", event?.target?.value);
  };

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
</script>

<div
  class="position-relative"
  style="height:{height}; width: {width}; !important"
>
  <input
    {id}
    {type}
    {value}
    {disabled}
    {maxlength}
    {placeholder}
    on:mouseenter={onMouseEnter}
    on:mouseleave={onMouseLeave}
    on:focus={onFocus}
    on:blur={onBlur}
    on:input={onInput}
    on:keydown={onKeyPress}
    class={`input-field ${variant} ${size} ${value ? "has-text" : ""} ${enterPressed ? "entered" : ""}  ${isError ? "isError" : ""}  w-100 h-100 ${componentClass}`}
    style="{componentStyle};"
  />
</div>

<style lang="scss">
  .SearchIconClass {
    display: flex;
  }

  ///////////////////////////////////////////////////////////////////////////////
  ///                        Base Style for Input Tag
  ///////////////////////////////////////////////////////////////////////////////
  input {
    caret-color: var(--border-primary-300);
    border: 1px solid transparent;
  }

  input::placeholder {
    color: var(--placeholder-color);
  }

  .input-field {
    color: var(--text-ds-neutral-50);
    background-color: transparent;
    border-radius: 4px;
    gap: 8px;
    caret-color: var(--border-ds-primary-300);
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

  ///////////////////////////////////////////////////////////////////////////////
  ///                        StrokeTextField Variants Specific Style
  ///////////////////////////////////////////////////////////////////////////////
  .strokeTextField {
    border: 1px solid var(--border-ds-neutral-600);
    font-size: 12px !important;
    font-weight: 500;
    padding: 2px 8px;
  }

  ///////////////////////////////////////////////////////////////////////////////
  ///                        InlineTextField Variants Specific Style
  ///////////////////////////////////////////////////////////////////////////////
  .inlineTextField {
    background-color: transparent !important; // Always bg will be transparent
    font-family: "Inter", sans-serif;
    outline: none;
  }
  .inlineTextField.small {
    font-size: 12px;
    font-weight: 500;
    padding: 8px 4px;
  }
  .inlineTextField.medium {
    font-size: 16px;
    font-weight: 500;
    padding: 8px;
  }
  .inlineTextField.large {
    font-size: 20px;
    font-weight: 600;
    padding: 8px;
  }

  // Default State
  .input-field.inlineTextField.has-text:not(:focus):not(:hover) {
    border-color: transparent;
  }
</style>
