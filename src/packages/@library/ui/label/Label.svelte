<script lang="ts">
  export let number: number;
  export let size = "15px";
  export let textColor = "var(--text-primary-500)";
  export let backgroundColor = "var(--bg-secondary-750)";
</script>

<div
  class="label d-flex align-items-center justify-content-center"
  style="height: {size}; min-width: {size}; background-color:{backgroundColor};
  border-radius: {number < 100 ? '50%' : '2px'};"
>
  <p class="mb-0 fw-bold sparrow-fs-10" style="color:{textColor};">{number}</p>
</div>

<style>
  .label {
    display: inline-block;
  }
</style>
