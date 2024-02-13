<script lang="ts">
  export let cardClassProp = "";
  export let cardStyleProp = "";
</script>

<div
  class={`${cardClassProp} workspace-card-container`}
  style={`${cardStyleProp} workspace-card`}
>
  <slot />
</div>

<style>
  @media only screen and (max-width: 1000px) {
    .workspace-card-container {
      max-width: 100% !important;
    }
  }
  .workspace-card {
    z-index: 0 !important;
  }
  .workspace-card:hover {
    background-color: var(--border-color) !important;
  }
</style>
