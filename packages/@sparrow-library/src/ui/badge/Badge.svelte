<script lang="ts">
  export let badgeColor: "danger" | "primary" | "neutral" = "danger";
  export let badgeSize: "small" | "medium" = "medium";
  export const type: "dot" | "count" = "count";
  export let count: number = 1;
  export let maxCount: number = 999;

  // Dynamic width based on count value
  $: badgeContainerWidth =
    count > maxCount
      ? "40px"
      : count >= 100
        ? "28px"
        : count >= 10
          ? "18px"
          : "16px";

  // Dynamic border radius: 50% for 1-2 digits, 13px for 3+ digits
  $: badgeBorderRadius = count >= 100 ? "13px" : "50%";
</script>

<div class="d-flex p-1">
  {#if !dot}
    <span
      class="circle-bot {badgeColor}-color text-center d-flex align-items-center justify-content-center fw-normal text-center"
      style={`width: ${badgeContainerWidth}; height: 16px; font-size: 12px; border-radius: ${badgeBorderRadius};`}
    >
      {count > maxCount ? "+999" : count}
    </span>
  {:else}
    <span
      class="unsaved-indicator"
      style="background-color: {badgeColor === 'primary'
        ? 'var(--bg-ds-primary-400)'
        : badgeColor === 'neutral'
          ? 'var(--bg-ds-neutral-100)'
          : 'var(--text-ds-danger-400)'}; height: {badgeSize === 'small'
        ? '4px'
        : '6px'}"
    />
  {/if}
</div>

<style>
  .circle-bot {
    max-width: 40px;
  }
  .danger-color {
    color: var(--text-ds-neutral-100);
    background-color: var(--text-ds-danger-500);
  }
  .primary-color {
    color: var(--text-ds-primary-300);
    background-color: var(--bg-ds-surface-100);
  }
  .neutral-color {
    color: var(--text-ds-neutral-100);
    background-color: var(--bg-ds-surface-100);
  }
  .unsaved-indicator {
    aspect-ratio: 1;
    border-radius: 50%;
    display: inline-block;
  }
</style>
