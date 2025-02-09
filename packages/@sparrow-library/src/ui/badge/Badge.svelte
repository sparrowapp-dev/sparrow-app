<script lang="ts">
  export let variant: "danger" | "primary" | "neutral" = "danger";
  export let size: "small" | "medium" = "medium";
  export let type: "dot" | "count" = "count";
  export let count: number = 1;
  const maxCount: number = 999;

  // Dynamic border radius: 50% for 1-2 digits, 13px for 3+ digits
  $: badgeBorderRadius = count >= 100 ? "13px" : "50%";

  function getBadgeColor(color: string) {
    switch (color) {
      case "primary":
        return "var(--bg-ds-primary-400)";
      case "neutral":
        return "var(--bg-ds-neutral-100)";
      default:
        return "var(--text-ds-danger-400)";
    }
  }
  function getBadgeSize(size: string) {
    return size === "small" ? "4px" : "6px";
  }
</script>

<div class="d-flex p-1">
  {#if type === "count"}
    <span
      class="circle-bot {variant}-color text-center d-flex align-items-center justify-content-center fw-normal text-center"
      style={`min-width: 16px; max-width:40px width: auto; height: 16px; font-size: 12px; border-radius: ${badgeBorderRadius};`}
    >
      {count > maxCount ? "+999" : count}
    </span>
  {:else if type === "dot"}
    <span
      class="unsaved-indicator"
      style="background-color:{getBadgeColor(variant)} height: {getBadgeSize(
        size,
      )}"
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
