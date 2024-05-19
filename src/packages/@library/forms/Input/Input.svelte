<script lang="ts">
  import { SearchIcon } from "$lib/assets/icons";
  import { PencilIcon } from "@library/icons";
  import { createEventDispatcher } from "svelte";

  /**
   * input type
   */
  export let type: "text" | "password" | "search" = "text";
  /**
   * placeholder - dummy text
   */
  export let placeholder = "placeholder";
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

  /**
   * input states
   */
  let isHovered = false;
  let isFocused = false;
  const dispatch = createEventDispatcher();

  const extractBorderHighlight = (_isHovered: boolean, _isFocused: boolean) => {
    if (_isFocused) {
      return focusedBorderColor;
    } else if (_isHovered) {
      if (disabled) return defaultBorderColor;
      return hoveredBorderColor;
    } else {
      if (disabled) return defaultBorderColor;
      return defaultBorderColor;
    }
  };
</script>

<div
  class="position-relative"
  style="height:{height}; width: {width}; !important"
>
  <input
    on:mouseenter={() => {
      isHovered = true;
    }}
    on:mouseleave={() => {
      isHovered = false;
    }}
    on:focus={() => {
      isFocused = true;
    }}
    on:blur={() => {
      isFocused = false;
    }}
    {value}
    on:input={(event) => {
      value = event?.target?.value;
      dispatch("input", event?.target?.value);
    }}
    {type}
    class="w-100 {componentClass}"
    {placeholder}
    style=" {componentStyle} height: 100%; {type === 'search'
      ? 'padding-left:35px !important;'
      : ''} {type === 'text' && isHovered
      ? 'padding-right:35px !important;'
      : ''} border-color:{extractBorderHighlight(isHovered, isFocused)};"
    {disabled}
  />
  {#if type === "search"}
    <span
      class="position-absolute"
      style="top: 50%; left: 10px; transform: translateY(-50%);"
    >
      <SearchIcon height={14} width={14} color={"var(--defaultcolor)"} />
    </span>
  {/if}
  {#if type === "text" && isHovered && !disabled}
    <span class="position-absolute" style="top:2px; right: 10px">
      <PencilIcon height={"14px"} width={"14px"} color={"white"} />
    </span>
  {/if}
</div>

<style>
  input {
    caret-color: var(--border-primary-300);
    border: 1px solid transparent;
  }
</style>
