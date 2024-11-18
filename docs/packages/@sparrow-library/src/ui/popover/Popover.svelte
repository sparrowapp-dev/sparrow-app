<script lang="ts">
  import { CrossIcon as Crossicon } from "@sparrow/library/assets";
  export let onClose;
  export let text = " ";
  export let heading = " ";
  let isGuidePopup = false;
</script>

<div
  class="container d-flex flex-column"
  style="position:relative; background-color:#1C1D2B; border-radius:4px; "
>
  <button
    class="cross-btn b-0 border-0"
    style="position:absolute; right:10px; top:2px; background-color:transparent "
    on:click={onClose}
  >
    <Crossicon />
  </button>
  <div class="heading">{heading}</div>
  <p class="description">
    <slot />
  </p>
</div>

<style>
  .container {
    margin-bottom: 10px;
  }
  .heading {
    padding-top: 10px;
    padding-left: 10px;
    font-weight: 700;
  }
  .description {
    padding-top: 5px;
    padding-left: 10px;
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;
  }
</style>
