<script lang="ts">
  export let number: number;
  export let size = "12px";
</script>

<div class="label" style="height: {size}; width: {size};">
  <p class="mb-0 text-labelColor sparrow-fs-8">{number}</p>
</div>

<style>
  .label {
    border-radius: 50%;
    display: inline-block;
    background-color: #232323;
  }
</style>
