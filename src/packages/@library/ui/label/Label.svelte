<script lang="ts">
  export let number: number;
  export let size = "15px";
  export let textColor = "text-primary-200";
  export let backgroundColor = "bg-secondary-500";
</script>

<div
  class="label d-flex align-items-center justify-content-center {backgroundColor}"
  style="height: {size}; width: {size};"
>
  <p class="mb-0 {textColor} fw-bold sparrow-fs-10">{number}</p>
</div>

<style>
  .label {
    border-radius: 50%;
    display: inline-block;
  }
</style>
