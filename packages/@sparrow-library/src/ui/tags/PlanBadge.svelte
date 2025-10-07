<script>
  import { StarNew, Premium, Crown, Globle } from "@sparrow/library/icons";

  export let plan = "";
  export let workspaceType = "";
  export let WorkspaceType = { PRIVATE: "private" };
  const getPlanBadgeStyle = (plan) => {
    switch (plan?.toLowerCase()) {
      case "standard":
        return {
          backgroundColor: "var(--bg-ds-info-900)",
          background:
            "linear-gradient(180deg, var(--text-ds-success-100), var(--text-ds-info-300))",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          borderColor: "var(--border-ds-info-700)",
          color: "transparent",
          text: "Standard",
          IconComponent: StarNew,
          iconColor:
            "linear-gradient(180deg, var(--text-ds-success-100), var(--text-ds-info-300))",
        };
      case "enterprise":
        return {
          backgroundColor: "var(--bg-ds-warning-700)",
          background:
            "linear-gradient(180deg, var(--text-ds-warning-100), var(--text-ds-tertiary-300))",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          borderColor: "var(--border-ds-warning-700)",
          color: "transparent",
          text: "Enterprise",
          IconComponent: Premium,
          iconColor:
            "linear-gradient(180deg, var(--text-ds-warning-100), var(--text-ds-tertiary-300))",
        };
      case "professional":
        return {
          backgroundColor: "var(--bg-ds-secondary-900)",
          background:
            "linear-gradient(180deg, var(--text-ds-accent-100), var(--text-ds-secondary-300))",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          borderColor: "var(--text-ds-secondary-700)",
          color: "transparent",
          text: "Professional",
          IconComponent: Crown,
          iconColor:
            "linear-gradient(180deg, var(--text-ds-accent-100), var(--text-ds-secondary-300))",
        };
      case "community":
      default:
        return {
          backgroundColor: "var(--bg-ds-surface-800)",
          background:
            "linear-gradient(180deg, var(--text-ds-neutral-100), var(--text-ds-neutral-300))",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          borderColor: "var(--border-ds-neutral-700)",
          color: "transparent",
          text: "Community",
          IconComponent: Globle,
          iconColor:
            "linear-gradient(180deg, var(--text-ds-neutral-100), var(--text-ds-neutral-300))",
        };
    }
  };

  $: planBadgeStyle = getPlanBadgeStyle(plan);
</script>

{#if workspaceType === WorkspaceType.PRIVATE}
  {#if plan}
    <div
      class="plan-badge plan-icon"
      style="background-color: {planBadgeStyle.backgroundColor}; 
       {planBadgeStyle.background
        ? `background: ${planBadgeStyle.background};`
        : ''}
       {planBadgeStyle.backgroundClip
        ? `background-clip: ${planBadgeStyle.backgroundClip};`
        : ''}
       {planBadgeStyle.WebkitBackgroundClip
        ? `-webkit-background-clip: ${planBadgeStyle.WebkitBackgroundClip};`
        : ''}
       color: {planBadgeStyle.color};
       border-color: {planBadgeStyle.borderColor || 'transparent'};"
    >
      {#if planBadgeStyle.IconComponent}
        <svelte:component
          this={planBadgeStyle.IconComponent}
          width="12px"
          height="12px"
        />
      {/if}

      {planBadgeStyle.text}
    </div>
  {/if}
{/if}

<style>
  .plan-badge {
    width: 73px;
    height: 20px;
    gap: 2px;
    transform: rotate(0deg);
    opacity: 1;
    padding-top: 4px;
    padding-right: 5px;
    padding-bottom: 5px;
    padding-left: 5px;
    border-radius: 4px;
    border-width: 1px;
    border-style: solid;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.5px;
    white-space: nowrap;
    min-width: fit-content;
    -webkit-background-clip: text;
    background-clip: text;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
