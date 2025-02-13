<script lang="ts">
  import { SearchIcon } from "@sparrow/library/assets";
  import { PencilIcon } from "@sparrow/library/icons";
  import { createEventDispatcher } from "svelte";
  let componentClass = "";
  export { componentClass as class };
  let componentStyle = "";
  export { componentStyle as style };

  export let type: "text" | "password" | "search" = "text";
  export let placeholder = "placeholder";
  export let placeholderColor = "gray";
  export let height = "36px";
  export let width = "auto";
  export let disabled = false;
  export let value = "";
  export let defaultBorderColor = "transparent";
  export let typingBorderColor = "1px solid var(--border-ds-primary-300)";
  export let hoveredBorderColor = "1px solid var(--border-ds-neutral-300)";
  export let focusedBorderColor = "2px solid var(--border-ds-primary-300)";
  export let typedBorderColor = "";
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

  const handleInputChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    value = target.value;
    dispatch("input", value);

    if (typingBorderColor !== "transparent") {
      isTyping = true;
    }
  };
</script>

<div
  class="position-relative {componentClass}"
  style={`height: ${height}; width: ${width}; background-color: ${backgroundColor}; border: ${borderColor}; border-radius:4px`}
  on:mouseenter={() => (isHovered = true)}
  on:mouseleave={() => {
    (isHovered = false), (isTyping = false);
  }}
>
  <input
    {value}
    {id}
    {type}
    {placeholder}
    {maxlength}
    {disabled}
    class="w-100"
    style="{componentStyle} height: 100%;
      {type === 'search' ? `padding-left: ${height} !important;` : ''}
      {type === 'text' && isEditIconRequired && isHovered
      ? 'padding-right:35px !important;'
      : ''}
      --placeholder-color: {placeholderColor}; background-color: ${backgroundColor};"
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
      class="position-absolute d-flex align-items-center justify-content-center"
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
    <span
      class="position-absolute"
      style="top: {height === '36px' ? '4px' : '2px'}; right: 10px;"
    >
      <PencilIcon height={iconSize} width={iconSize} color="white" />
    </span>
  {/if}
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
