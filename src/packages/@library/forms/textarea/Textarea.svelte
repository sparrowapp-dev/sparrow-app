<script lang="ts">
  import { createEventDispatcher } from "svelte";
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

  export let maxlength = 500;

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
  <textarea
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
      dispatch("blur", event?.target?.value);
    }}
    {value}
    on:input={(event) => {
      value = event?.target?.value;
      dispatch("input", event?.target?.value);
    }}
    class="w-100 {componentClass}"
    {placeholder}
    style=" {componentStyle} height: 100%;  border-color:{extractBorderHighlight(
      isHovered,
      isFocused,
    )};"
    {disabled}
    {maxlength}
  />
</div>

<style>
  textarea {
    scrollbar-width: none;
    caret-color: var(--border-primary-300);
    border: 1px solid transparent;
  }
</style>
