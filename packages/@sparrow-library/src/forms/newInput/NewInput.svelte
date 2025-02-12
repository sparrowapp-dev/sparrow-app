<script lang="ts">
  import { SearchIcon } from "@sparrow/library/assets";
  import { PencilIcon } from "@sparrow/library/icons";
  import { createEventDispatcher } from "svelte";

  export let type: "text" | "password" | "search" = "text";
  export let placeholder = "placeholder";
  export let placeholderColor = "gray";
  export let height = "36px";
  export let width = "auto";
  export let disabled = false;
  export let inputType: "small" | "medium" = "medium";

  let componentClass = "";
  export { componentClass as class };
  let componentStyle = "";
  export { componentStyle as style };
  export let value = "";
  export let defaultBorderColor = "";
  export let typingBorderColor = "1px solid var(--border-ds-primary-300)";
  export let hoveredBorderColor = "1px solid var(--border-ds-neutral-300)";
  export let focusedBorderColor = "2px solid var(--border-ds-primary-300)";
  export let typedBorderColor = "1px solid var(--border-ds-neutral-300)";
  export let defaultBgColor = "var(--bg-ds-surface-400)";
  export let disabledBgColor = "var(--bg-ds-surface-600)";
  export let isEditIconRequired = true;
  export let maxlength = 500;
  export let searchIconColor = "var(--defaultcolor)";
  export let iconSize = "14px";
  export let id = "";

  let isHovered = false;
  let isFocused = false;
  let isTyping = false;
  let hasInput = false;
  const dispatch = createEventDispatcher();

  $: hasInput = value.length > 0;
  $: borderColor = isTyping
    ? typingBorderColor
    : isFocused
      ? focusedBorderColor
      : isHovered
        ? hoveredBorderColor
        : hasInput
          ? typedBorderColor
          : defaultBorderColor;
  $: backgroundColor = disabled ? disabledBgColor : defaultBgColor;

  const onKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(id) as HTMLInputElement;
      inputField?.blur();
    }
  };

  const handleInputChange = (event: InputEvent) => {
    if (typingBorderColor !== "transparent") {
      isTyping = true;
      value = event.target.value;
      dispatch("input", value);
      setTimeout(() => {
        if (value === event.target.value) {
          isTyping = false;
        }
      }, 2000);
    }
  };
</script>

<div>
  <div>
    <input
      on:mouseenter={() => (isHovered = true)}
      on:mouseleave={() => (isHovered = false)}
      {id}
      {type}
      {maxlength}
      {placeholder}
      class="w-100 {componentClass}"
      style={`
        ${componentStyle};
        height: ${inputType === "small" ? "28px" : height};
        width: ${inputType === "small" ? "398px" : width};
        gap: ${inputType === "small" ? "var(--gap-4)" : "inherit"};
        border-radius: 4px;
        border-width: ${inputType === "small" ? "1px" : "inherit"};
        padding: ${inputType === "small" ? "2px 8px" : "inherit"};
        ${type === "search" ? `padding-left: ${height} !important;` : ""}
        ${type === "text" && isEditIconRequired && isHovered ? "padding-right: 35px !important;" : ""}
        border: ${borderColor};
        --placeholder-color: ${placeholderColor};
        background-color: ${backgroundColor};
      `}
      {disabled}
      on:focus={() => (isFocused = true)}
      on:blur={(event) => {
        isFocused = false;
        dispatch("blur", event.target?.value);
      }}
      on:input={handleInputChange}
      on:keydown={onKeyPress}
    />
    {#if type === "search"}
      <span
        class="position-absolute d-flex align-items-center justify-content-center m-0 p-0"
        style="top: 0; left: 0; bottom: 0; width: {height};"
      >
        <span class="SearchIconClass" style="margin-top:1px;">
          <SearchIcon
            height={iconSize}
            width={iconSize}
            color={searchIconColor}
          />
        </span>
      </span>
    {/if}
    {#if type === "text" && isHovered && isEditIconRequired && !disabled}
      <span class="position-absolute" style="top:2px; right: 10px">
        <PencilIcon height={iconSize} width={iconSize} color="white" />
      </span>
    {/if}
  </div>
</div>

<style>
  input {
    caret-color: var(--border-ds-primary-300);
    border: 1px solid transparent;
    min-width: 240px;
    max-width: 540px;
  }
  input::placeholder {
    color: var(--placeholder-color);
  }
</style>
