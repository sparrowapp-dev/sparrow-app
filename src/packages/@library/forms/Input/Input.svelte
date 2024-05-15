<script lang="ts">
  import Edit from "$lib/assets/edit.svelte";
  import { SearchIcon } from "$lib/assets/icons";
  import { PencilIcon } from "@library/icons";
  import { createEventDispatcher } from "svelte";

  export let type: "text" | "password" | "search" = "text";
  export let placeholder = "placeholder";
  export let height = "30px";
  export let width = "auto";

  /**
   * input class
   */
  export let disabled = false;
  let componentClass = "";
  export { componentClass as class };

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
    <span class="position-absolute" style="top:2px; left: 10px">
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
