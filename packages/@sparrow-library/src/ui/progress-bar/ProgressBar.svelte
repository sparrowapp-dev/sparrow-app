<script>
  // Required props
  export let percentage = 0;
  export let isExceeded = false;

  // Ensure percentage is within valid range
  $: clampedPercentage = Math.min(Math.max(percentage, 0), 100);
</script>

<div
  class="progress-bar-container"
  style="background-color: var(--bg-ds-surface-400); height: 8px; border-radius: 4px;"
>
  <div
    class="progress-bar-fill"
    style="
      width: {clampedPercentage}%; 
      height: 100%; 
      border-radius: 4px;
      background-color: {isExceeded
      ? 'var(--bg-ds-danger-400)'
      : 'var(--bg-ds-primary-500)'};
    "
  />
</div>

<style>
  .progress-bar-container {
    width: 100%;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .progress-bar-fill {
    transition:
      width 300ms ease,
      background-color 300ms ease;
  }
</style>
