<script lang="ts">
  import { PencilIcon } from "@sparrow/library/icons";
  import { createEventDispatcher } from "svelte";
  import { Button } from "../../ui";
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
  export let id = "";
  export let isError: boolean = false;
  export let blankInput: boolean = false;
  export let variant: "primary" = "primary";
  export let headerLabel: boolean = false;
  export let supportLabel: boolean = false;
  export let helpLabel: boolean = false;
  export let helpLabelValue: boolean = false;
  export let helpIcon;
  export let headerLabelText: string = "Label";
  export let supportLabelText: string = "supportText";
  export let errorMessage: string = "ErrorMessage";
  export let helpLabelText: string = "help";
  export let inputLadelId: string = "";
  export let inputValueRequired: boolean = false;

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

{#if headerLabel}
  <div class="">
    <div style="width: {width}; padding-bottom: 2px;">
      <label for={inputLadelId} class="label-header-text"
        >{headerLabelText}</label
      >
      {#if inputValueRequired}
        <span style="color:var(--text-ds-danger-400)">*</span>
      {/if}
    </div>
    {#if supportLabel}
      <div class="pb-2">
        <p style="margin: 0px;" class="support-label-text">
          {supportLabelText}
        </p>
      </div>
    {/if}
  </div>
{/if}
<div
  class="position-relative {componentClass} d-flex justify-content-normal align-items-center mb-1"
  style={`height: ${size === "medium" ? "36px" : "28px"}; width: ${width}; background-color: ${backgroundColor}; border: ${borderColor}; border-radius: 4px; padding:2px 8px;`}
  on:mouseenter={() => (isHovered = true)}
  on:mouseleave={() => {
    isHovered = false;
    isTyping = false;
  }}
>
  {#if startIcon}
    <Button
      type="teritiary-regular"
      size={"small"}
      iconSize={20}
      {startIcon}
      disable={disabled}
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
    <Button
      type="teritiary-regular"
      size={"small"}
      iconSize={20}
      startIcon={endIcon}
      disable={disabled}
    />
  {/if}
</div>
<div>
  {#if helpLabel}
    <div
      class="d-flex justify-content-normal align-items-center"
      style={helpIcon !== ""
        ? "margin-left: 2px;"
        : "gap: 4px; margin-left: 2px;"}
    >
      <div>
        <svelte:component
          this={helpIcon}
          height={`16px`}
          width={`16px`}
          useParentColor={true}
          color={isError
            ? "var(--icon-ds-danger-300)"
            : "var(--icon-ds-neutral-400)"}
        />
      </div>
      {#if isError}
        <p style="margin:0px;" class="help-label-error">
          {errorMessage}
        </p>
      {:else if helpLabelValue}
        <p style="margin:0px;" class="help-label-text">{helpLabelText}</p>
      {/if}
    </div>
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
  .label-header-text.support-label-text.help-label-text.help-label-error {
    font-family: "Inter", sans-serif;
    font-weight: 400;
  }
  .label-header-text {
    font-size: 14px;
    color: var(--text-ds-neutral-200);
  }
  .support-label-text {
    font-size: 12px;
    color: var(--text-ds-neutral-400);
  }
  .help-label-text {
    font-size: 12px;
    color: var(--text-ds-neutral-400);
  }
  .help-label-error {
    font-size: 12px;
    color: var(--text-ds-danger-300);
  }
</style>
