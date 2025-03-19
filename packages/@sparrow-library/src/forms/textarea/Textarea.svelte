<script lang="ts">
  import { createEventDispatcher } from "svelte";

  /**
   * Placeholder text
   */
  export let placeholder: string = "placeholder";
  export let placeholderColor: string = "gray";

  /**
   * Height & Width
   */
  export let height: string = "96px";
  export let width: string = "auto";

  /**
   * Identifies if input is disabled
   */
  export let disabled: boolean = false;
  export let blankTextarea: boolean = false;

  /**
   * Input class
   */
  export let componentClass: string = "";
  export { componentClass as class };

  /**
   * Input style
   */
  export let componentStyle: string = "";
  export { componentStyle as style };

  /**
   * Input value
   */
  export let value: string = "";

  /**
   * Maximum length for textarea
   */
  export let maxlength: number = 500;

  /**
   * Unique textarea ID
   */
  export let id: string = "";

  /**
   * Input states
   */
  export let isError: boolean = false;
  export let variant: "primary" = "primary";

  let isHovered: boolean = false;
  let isFocused: boolean = false;
  let isTyping: boolean = false;
  let hasInput: boolean = false;

  $: hasInput = value.length > 0;

  /**
   * Type for border and background colors
   */
  type VariantState = {
    defaultBorderColor: string;
    typingBorderColor: string;
    hoveredBorderColor: string;
    focusedBorderColor: string;
    typedBorderColor: string;
  };

  type VariantColors = {
    normal: VariantState;
    error: VariantState;
    bgColors: {
      defaultBgColor: string;
      disabledBgColor: string;
    };
  };

  /**
   * Variants Object
   */
  const variants: Record<"primary", VariantColors> = {
    primary: {
      normal: {
        defaultBorderColor: "transparent",
        typingBorderColor: "1px solid var(--border-ds-primary-300)",
        hoveredBorderColor: "1px solid var(--border-ds-neutral-300)",
        focusedBorderColor: "2px solid var(--border-ds-primary-300)",
        typedBorderColor: "",
      },
      error: {
        defaultBorderColor: "1px solid var(--border-ds-danger-300)",
        typingBorderColor: "1px solid var(--border-ds-primary-300)",
        hoveredBorderColor: "1px solid var(--border-ds-danger-300)",
        focusedBorderColor: "2px solid var(--border-ds-danger-300)",
        typedBorderColor: "",
      },
      bgColors: {
        defaultBgColor: "var(--bg-ds-surface-400)",
        disabledBgColor: "var(--bg-ds-surface-600)",
      },
    },
  };

  let colors: VariantState = isError
    ? variants[variant].error
    : variants[variant].normal;
  let bgColors = variants[variant].bgColors;

  $: borderColor = isError
    ? isFocused
      ? variants[variant].error.focusedBorderColor
      : variants[variant].error.defaultBorderColor
    : blankTextarea
      ? "transparent"
      : isTyping
        ? colors.typingBorderColor
        : isFocused
          ? colors.focusedBorderColor
          : isHovered
            ? colors.hoveredBorderColor
            : hasInput
              ? colors.typedBorderColor
              : colors.defaultBorderColor;

  $: backgroundColor = disabled
    ? bgColors.disabledBgColor
    : bgColors.defaultBgColor;

  /**
   * Event Dispatcher
   */
  const dispatch = createEventDispatcher<{ input: string; blur: string }>();

  /**
   * Handle Input Change
   */
  const handleInputChange = (event: Event) => {
    const target = event.target as HTMLTextAreaElement;
    isTyping = true;
    value = target.value;
    dispatch("input", value);
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
    style="height: 100%; {componentStyle};
           word-wrap: break-word;
           overflow-wrap: break-word;
           outline: {borderColor};
           --placeholder-color: {placeholderColor};
           background-color: {backgroundColor};"
    {disabled}
    {maxlength}
    on:mouseenter={() => (isHovered = true)}
    on:mouseleave={() => {
      isHovered = false;
      isTyping = false;
    }}
    on:focus={() => (isFocused = true)}
    on:blur={(event) => {
      isFocused = false;
      dispatch("blur", event?.target?.value);
    }}
    on:input={handleInputChange}
    tabindex={0}
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
