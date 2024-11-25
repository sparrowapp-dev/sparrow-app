<script lang="ts">
  import { CrossIcon as Crossicon } from "@sparrow/library/assets";
  export let onClose;
  export let heading = " ";
  let isGuidePopup = false;
</script>

<div
  class="p-container d-flex flex-column bg-tertiary-750"
  style="position:relative; border-radius:4px; "
>
  <button
    class="d-flex align-items-center justify-content-center b-0 border-0"
    style="height:24px; width:24px; position:absolute; right:4px; top:4px; background-color:transparent;"
    on:click={onClose}
  >
    <Crossicon height={"12px"} width={"12px"} />
  </button>
  <p class="fw-bold text-fs-14 mb-2">{heading}</p>
  <div>
    <slot />
  </div>
</div>

<style>
  .p-container {
    padding: 16px 16px;
  }
</style>
