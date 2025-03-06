<script lang="ts">
  import { SearchIcon } from "@sparrow/library/assets";
  import { PencilIcon } from "@sparrow/library/icons";
  import { createEventDispatcher } from "svelte";

  /**
   * input type
   */
  export let type: "text" | "password" | "search" = "text";
  /**
   * placeholder - dummy text
   */
  export let placeholder = "placeholder";
  export let placeholderColor = "gray";
  /**
   * height
   */
  export let height = "30px";
  /**
   * width
   */
  export let width = "auto";

  /**
   * identifies input is disabled or not
   */
  export let disabled = false;
  /**
   * input class
   */
  let componentClass = "";
  export { componentClass as class };

  /**
   * input style
   */
  let componentStyle = "";
  export { componentStyle as style };
  /**
   * input value
   */
  export let value = "";

  /**
   * border color
   */
  export let defaultBorderColor = "transparent";
  export let hoveredBorderColor = "red";
  export let focusedBorderColor = "green";

  export let isEditIconRequired = true;

  export let maxlength = 500;

  export let searchIconColor = "var(--defaultcolor)";
  export let iconSize = "14px";
  export let isPencilIconRequired = true;

  /**
   * Unique id for input
   */
  export let id = "";

  /**
   * Auto-focus input when mounted
   */
  export let autofocus = false;

  /**
   * input states
   */
  let isHovered = false;
  let isFocused = false;
  const dispatch = createEventDispatcher();

  const extractBorderHighlight = (
    _isHovered: boolean,
    _isFocused: boolean,
    _defaultBorderColor: string,
    _hoveredBorderColor: string,
    _focusedBorderColor: string,
  ) => {
    if (_isFocused) {
      return _focusedBorderColor;
    } else if (_isHovered) {
      if (disabled) return _defaultBorderColor;
      return _hoveredBorderColor;
    } else {
      if (disabled) return _defaultBorderColor;
      return _defaultBorderColor;
    }
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
  };

  // Focus action for use with use:action directive
  function focusOnMount(node: HTMLElement) {
    if (autofocus && !disabled) {
      node.focus();
    }
  }
</script>

<div
  class="position-relative"
  style="height:{height}; width: {width}; !important"
  on:mouseenter={() => {
    isHovered = true;
  }}
  on:mouseleave={() => {
    isHovered = false;
  }}
>
  <input
    {id}
    on:focus={() => {
      isFocused = true;
    }}
    on:blur={() => {
      isFocused = false;
      dispatch("blur", event?.target?.value);
    }}
    {value}
    on:input={(event) => {
      value = event?.target?.value;
      dispatch("input", event?.target?.value);
    }}
    on:keydown={onKeyPress}
    {type}
    {maxlength}
    class=" w-100 {componentClass}"
    {placeholder}
    style=" {componentStyle} height: 100%; {type === 'search'
      ? `padding-left:${height} !important;`
      : ''} {type === 'text' && isEditIconRequired && isHovered
      ? 'padding-right:35px !important;'
      : ''} border-color:{extractBorderHighlight(
      isHovered,
      isFocused,
      defaultBorderColor,
      hoveredBorderColor,
      focusedBorderColor,
    )}; --placeholder-color: {placeholderColor};"
    {disabled}
    use:focusOnMount
  />
  {#if type === "search"}
    <span
      class="position-absolute d-flex align-items-center justify-content-center m-0 p-0"
      style="top: 0; left: 0; bottom: 0; width: {height}; "
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
  {#if type === "text" && isHovered && isEditIconRequired && !disabled && isPencilIconRequired}
    <span class="position-absolute" style="top:2px; right: 10px">
      <PencilIcon height={iconSize} width={iconSize} color={"white"} />
    </span>
  {/if}
</div>

<style>
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
</style>