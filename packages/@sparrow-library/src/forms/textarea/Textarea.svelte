<script lang="ts">
  import { createEventDispatcher } from "svelte";

  /**
   * Placeholder text
   */
  export let placeholder = "placeholder";
  export let placeholderColor = "gray";

  /**
   * Height & Width
   */
  export let height = "96px";
  export let width = "auto";

  /**
   * Identifies if input is disabled
   */
  export let disabled = false;

  /**
   * Input class
   */
  export let componentClass = "";
  export { componentClass as class };

  /**
   * Input style
   */
  export let componentStyle = "";
  export { componentStyle as style };

  /**
   * Input value
   */
  export let value = "";

  /**
   * Border colors
   */
  export let defaultBorderColor: string = "";
  export let typingBorderColor: string =
    "1px solid var(--border-ds-primary-300)";
  export let hoveredBorderColor: string =
    "1px solid var(--border-ds-neutral-300)";
  export let focusedBorderColor: string =
    "2px solid var(--border-ds-primary-300)";
  export let typedBorderColor: string =
    "1px solid var(--border-ds-neutral-300)";

  /**
   * Background colors
   */
  export let defaultBgColor = "var(--bg-ds-surface-400)";
  export let disabledBgColor = "var(--bg-ds-surface-600)";

  /**
   * Maximum length for textarea
   */
  export let maxlength = 500;

  /**
   * Unique textarea ID
   */
  export let id = "";

  /**
   * Input states
   */
  let isHovered = false;
  let isFocused = false;
  let isTyping = false;
  let hasInput = false;
  $: hasInput = value.length > 0;

  // Reactive border logic
  $: borderColor = isTyping
    ? typingBorderColor
    : isFocused
      ? focusedBorderColor
      : isHovered
        ? hoveredBorderColor
        : hasInput
          ? typedBorderColor
          : defaultBorderColor;

  // Background color logic
  $: backgroundColor = disabled ? disabledBgColor : defaultBgColor;

  const dispatch = createEventDispatcher();

  const handleInputChange = (event: InputEvent) => {
    if (typedBorderColor !== "transparent") {
      isTyping = true;
      value = event.target.value;
      dispatch("input", event.target.value);
    }
  };
</script>

<div
  class="position-relative"
  style="height:{height}; width: {width}; word-wrap: break-word;"
>
  <textarea
    bind:value
    {id}
    {placeholder}
    class="w-100 {componentClass}"
    style="height: 100%; {componentStyle}
             word-wrap: break-word;
             overflow-wrap: break-word;
             border: {borderColor};
             --placeholder-color: {placeholderColor};
             background-color: {backgroundColor};"
    {disabled}
    {maxlength}
    on:mouseenter={() => (isHovered = true)}
    on:mouseleave={() => {
      (isHovered = false), (isTyping = false);
    }}
    on:focus={() => (isFocused = true)}
    on:blur={(event) => {
      isFocused = false;
      dispatch("blur", event?.target?.value);
    }}
    on:input={handleInputChange}
  />
</div>

<style>
  textarea {
    scrollbar-width: none;
    caret-color: var(--border-primary-300);
    border: 1px solid transparent;
    min-width: 240px;
    max-width: 540px;
  }
  textarea::placeholder {
    color: var(--placeholder-color);
  }
</style>
