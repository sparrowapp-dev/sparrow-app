<script lang="ts">
  export let number: number;
  export let size = "15px";
  // export let textColor = "var(--text-primary-350)";
  // export let backgroundColor = "bg-secondary-500";
</script>

<div
  class="label d-flex align-items-center justify-content-center "
  style="height: {size}; width: {size}; background-color:#4D4D4D !important; z-index:5;"
>
<p class="mb-0 fw-bold sparrow-fs-10" style="color:#87b9f7;" >{number}</p>
</div>

<style>
  .label {
    border-radius: 50%;
    display: inline-block;
  }
</style>
