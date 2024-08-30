<script lang="ts">
  export let number: number;
  export let size = "15px";
  export let textColor = "var(--text-primary-500)";
  export let backgroundColor = "var(--bg-secondary-750)";
  $: isThreeDigits = number >= 100;
</script>

<div
  class="label d-flex align-items-center justify-content-center"
  style="background-color:{backgroundColor}; color:{textColor}; height:{size}; min-width:{size};
  padding: 0 3px; border-radius: {isThreeDigits ? '10px' : '50%'};
  line-height: {size};" 
>
  <p class="mb-0 fw-bold sparrow-fs-10">{number}</p>
</div>

<style>
  .label {
    display: inline-block;
    white-space: nowrap; 
    font-size: 14px;
    text-align: center; 
  }
</style>
