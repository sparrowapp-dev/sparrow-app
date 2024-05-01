<script lang="ts">
  export let number: number;
  export let size = "14px";
  export let textColor = "text-primary-200";
  export let backgroundColor = "bg-primary-500";
</script>

<div class="label {backgroundColor}" style="height: {size}; width: {size};">
  <p class="mb-0 {textColor} sparrow-fs-8">{number}</p>
</div>

<style>
  .label {
    border-radius: 50%;
    display: inline-block;
  }
</style>
