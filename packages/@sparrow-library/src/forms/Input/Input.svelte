<script lang="ts">
  import { PencilIcon } from "@sparrow/library/icons";
  import { createEventDispatcher } from "svelte";

  type Variant = "primary";
  type Size = "medium" | "small";
  type InputType = "text" | "password";

  let componentClass: string = "";
  export { componentClass as class };

  let componentStyle: string = "";
  export { componentStyle as style };

  export let type: InputType = "text";
  export let startIcon: any;
  export let endIcon: any;
  export let placeholder: string = "placeholder";
  export let size: Size = "medium";
  export let width: string = "auto";
  export let disabled: boolean = false;
  export let value: string = "";
  export let isEditIconRequired: boolean = true;
  export let maxlength: number = 300;
  export let iconSize: string = "14px";
  export let id: string = "";
  export let isError: boolean = false;
  export let blankInput: boolean = false;
  export let variant: Variant = "primary";

  let isHovered: boolean = false;
  let isFocused: boolean = false;
  let isTyping: boolean = false;
  let hasInput: boolean = false;

  const dispatch = createEventDispatcher<{ input: string; blur: string }>();

  const variants: Record<Variant, any> = {
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
      placeholder: {
        color: "var(--icon-ds-neutral-400)",
      },
    },
  };

  let colors = isError ? variants[variant].error : variants[variant].normal;
  let bgColors = variants[variant].bgColors;

  $: hasInput = value.length > 0;
  $: borderColor =
    isError && isFocused
      ? variants[variant].error.focusedBorderColor
      : isError
        ? variants[variant].error.defaultBorderColor
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
                  : colors.defaultBorderColor || "none";

  $: backgroundColor = disabled
    ? bgColors.disabledBgColor
    : bgColors.defaultBgColor;

  const onKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(id) as HTMLInputElement | null;
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
    style={` ${componentStyle}; ${
      type === "text" && isEditIconRequired && isHovered
        ? "padding-right:35px !important;"
        : ""
    } --placeholder-color: ${variants[variant].placeholder.color}; background-color: ${backgroundColor}; height:${
      size === "medium" ? "20px" : "18px"
    };`}
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
      style={`top: ${size === "medium" ? "4px" : "2px"}; right: 10px;`}
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
