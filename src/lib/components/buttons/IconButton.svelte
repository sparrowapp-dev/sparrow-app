<script lang="ts">
  export let classProp = "";
  export let onClick: (e) => void;
  export let disabled = false;
  export let width: number | undefined = undefined;
  export let height: number | undefined = undefined;
</script>

<button
  class={`${classProp}  sparrow-icon-btn `}
  style={`width: ${width ? width + "px" : "auto"}; height: ${
    height ? height + "px" : "auto"
  };`}
  on:click={(e) => onClick(e)}
  {disabled}
>
  <slot />
</button>

<style lang="scss">
  .sparrow-icon-btn {
    background-color: transparent;
    border: 0px;
  }
  .sparrow-icon-btn:hover {
    background-color: var(--blackColor);
  }
</style>
