<script lang="ts">
  import { Spinner } from "@sparrow/library/ui";

  /**
   * performs operation on button click
   */
  export let onClick: (e) => void = () => {};
  /**
   * button size
   * */
  export let buttonSize = "20px";
  /**
   * icon size
   */
  export let iconSize = "18px";
  /**
   * identifies button disabled or not
   */
  export let disable = false;
  /**
   * shows loading state of the button
   */
  export let loader = false;
  /**
   * shows curve behaviour of the button
   */
  export let borderRadius = "4px";

  //   background color
  export let defaultBackgroundColor = "transparent";
  export let hoveredBackgroundColor = "red";
  export let clickedBackgroundColor = "blue";

  //   icon color
  export let defaultIconColor = "white";
  export let hoveredIconColor = "yellow";
  export let clickedIconColor = "green";
  export let icon;

  let isHovered = false;
  let isClicked = false;
  let Icon = icon;

  const extractButtonBackground = (
    _isHovered: boolean,
    _isClicked: boolean,
  ) => {
    if (_isClicked && _isHovered) {
      return clickedBackgroundColor;
    } else if (_isHovered) {
      return hoveredBackgroundColor;
    } else {
      return defaultBackgroundColor;
    }
  };

  const extractIconColor = (_isHovered: boolean, _isClicked: boolean) => {
    if (_isClicked && _isHovered) {
      return clickedIconColor;
    } else if (_isHovered) {
      return hoveredIconColor;
    } else {
      return defaultIconColor;
    }
  };
</script>

<button
  disabled={disable}
  on:click={onClick}
  on:mouseenter={() => {
    isHovered = true;
  }}
  on:mouseleave={() => {
    isHovered = false;
  }}
  on:mousedown={() => {
    isClicked = true;
  }}
  on:mouseup={() => {
    isClicked = false;
  }}
  class="button-v2"
  style="
  height:{buttonSize}; width: {buttonSize};
  border-radius:{borderRadius}; background-color: {extractButtonBackground(
    isHovered,
    isClicked,
  )};"
>
  {#if loader}
    <span class="mx-2 d-flex justify-content-center align-items-center">
      <Spinner size={`${iconSize}`} />
    </span>
  {:else if !loader}
    <span class="d-flex align-items-center justify-content-center">
      <Icon
        height={iconSize}
        width={iconSize}
        color={extractIconColor(isHovered, isClicked)}
      />
    </span>
  {/if}
</button>

<style lang="scss">
  .button-v2 {
    border: 0px;
  }
</style>
