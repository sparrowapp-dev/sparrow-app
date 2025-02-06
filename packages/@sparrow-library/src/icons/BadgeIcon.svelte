<script lang="ts">
  export let badgeColor: "red" | "blue" | "gray" = "red";
  export let badgeSize: "small" | "medium" = "medium";
  export let badgeContainerHeight: string = "18px";
  export let inputNumberSize: string = "12px";
  export let badgeValue: boolean = false;
  export let inputValue: number = 1;
  export let maxValue: number = 999;

  // Dynamic width based on input value
  $: badgeContainerWidth = inputValue >= 100 ? "28px" : "18px";

  // Dynamic border radius: 50% for 1-2 digits, 13px for 3+ digits
  $: badgeBorderRadius = inputValue >= 100 ? "13px" : "50%";
</script>

<div class="d-flex p-1">
  {#if badgeValue && inputValue <= maxValue}
    <span
      class="circle-bot {badgeColor}-color text-center"
      style={`width: ${badgeContainerWidth}; height: ${badgeContainerHeight}; font-size: ${inputNumberSize}; border-radius: ${badgeBorderRadius};`}
    >
      {inputValue}
    </span>
  {:else}
    <span
      class="unsaved-indicator"
      style="background-color: {badgeColor === 'blue'
        ? 'var(--bg-ds-primary-400)'
        : badgeColor === 'gray'
          ? 'var(--bg-ds-neutral-100)'
          : 'var(--text-ds-danger-400)'}; height: {badgeSize === 'small'
        ? '4px'
        : '6px'}"
    />
  {/if}
</div>

<style>
  .circle-bot {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 400;
    text-align: center;
    max-width: 40px;
  }
  .red-color {
    color: var(--white-color);
    background-color: var(--text-ds-danger-500);
  }
  .blue-color {
    color: var(--text-ds-primary-300);
    background-color: var(--bg-ds-surface-100);
  }
  .gray-color {
    color: var(--text-ds-neutral-100);
    background-color: var(--bg-ds-surface-100);
  }
  .unsaved-indicator {
    aspect-ratio: 1;
    border-radius: 50%;
    display: inline-block;
  }
</style>
