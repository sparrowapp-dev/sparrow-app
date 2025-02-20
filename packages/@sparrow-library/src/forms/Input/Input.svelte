<script lang="ts">
  import { PencilIcon } from "@sparrow/library/icons";
  import { createEventDispatcher } from "svelte";
  let componentClass = "";
  export { componentClass as class };
  let componentStyle = "";
  export { componentStyle as style };
  export let type: "text" | "password" = "text";
  export let startIcon;
  export let endIcon;
  export let placeholder = "placeholder";
  export let placeholderColor = "var(--icon-ds-neutral-400)";
  export let size: "medium" | "small" = "medium";
  export let width = "auto";
  export let disabled = false;
  export let value = "";
  export let isEditIconRequired = true;
  export let maxlength = 300;
  export let iconSize = "14px";
  export let id = "";
  export let isError: boolean = false;
  export let blankInput: boolean = false;
  export let variant: "primary" = "primary";

  let isHovered = false;
  let isFocused = false;
  let isTyping = false;
  let hasInput = false;
  const dispatch = createEventDispatcher();

  // Define color variants
  const variants = {
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

  // Select colors based on variant and error state
  let colors = isError ? variants[variant].error : variants[variant].normal;
  let bgColors = variants[variant].bgColors;

  $: hasInput = value.length > 0;
  $: borderColor = isError
    ? isFocused
      ? variants[variant].error.focusedBorderColor
      : variants[variant].error.defaultBorderColor
    : blankInput
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

  const onKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(id) as HTMLInputElement;
      inputField?.blur();
    }
  };

  const handleInputChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    value = target.value;
    isTyping = true;
    isError = false;
    dispatch("input", value);
  };
</script>

<div
  class="position-relative {componentClass} d-flex justify-content-normal align-items-center"
  style={`height: ${size === "medium" ? "36px" : "28px"}; width: ${width}; background-color: ${backgroundColor}; border: ${borderColor}; border-radius: 4px; padding:2px 8px;`}
  on:mouseenter={() => (isHovered = true)}
  on:mouseleave={() => {
    isHovered = false;
    isTyping = false;
  }}
>
  {#if startIcon}
    <svelte:component
      this={startIcon}
      height={`${iconSize}px`}
      width={`${iconSize}px`}
      useParentColor={true}
    />
  {/if}
  <input
    {value}
    {id}
    {type}
    {placeholder}
    {maxlength}
    {disabled}
    class="w-100 input-{size}"
    style="{componentStyle} {type === 'text' && isEditIconRequired && isHovered
      ? 'padding-right:35px !important;'
      : ''} --placeholder-color: {placeholderColor}; background-color: ${backgroundColor}; height:{size ===
    'medium'
      ? '20px'
      : '18px'};"
    on:focus={() => (isFocused = true)}
    on:blur={(event) => {
      isFocused = false;
      dispatch("blur", event.target?.value);
    }}
    on:input={handleInputChange}
    on:keydown={onKeyPress}
  />
  {#if type === "text" && isHovered && isEditIconRequired && !disabled}
    <span
      class="position-absolute"
      style="top: {size === 'medium' ? '4px' : '2px'}; right: 10px;"
    >
      <PencilIcon height={iconSize} width={iconSize} color="white" />
    </span>
  {/if}
  {#if endIcon}
    <svelte:component
      this={endIcon}
      height={`${iconSize}px`}
      width={`${iconSize}px`}
      useParentColor={true}
    />
  {/if}
</div>

<style>
  input {
    caret-color: var(--border-ds-primary-300);
    border: 1px solid transparent;
    min-width: 240px;
    max-width: 540px;
    font-family: "Inter", sans-serif;
  }
  input::placeholder {
    color: var(--placeholder-color);
  }
  .input-small {
    font-size: 12px;
    font-weight: 500;
  }
  .input-medium {
    font-size: 14px;
    font-weight: 400;
  }
</style>
