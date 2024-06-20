<script lang="ts">
  export let number: number;
  export let size = "15px";
  export let textColor = "var(--text-primary-500)";
  export let backgroundColor = "var(--bg-secondary-750)";
</script>

<div
  class="label d-flex align-items-center justify-content-center "
  style="height: {size}; width: {size}; background-color:{backgroundColor};"
>
  <p class="mb-0 fw-bold sparrow-fs-10" style="color:{textColor};">{number}</p>
</div>

<style>
  .label {
    border-radius: 50%;
    display: inline-block;
  }
</style>
