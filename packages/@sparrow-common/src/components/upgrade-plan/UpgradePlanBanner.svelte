<script lang="ts">
  export let isUpgradePlanModelOpen;
</script>

<div
  class=" d-flex align-items-center justify-content-center text-center"
  style="background-color: var(--bg-ds-primary-900); height:28px;"
>
  <p class="text-fs-12 mb-0">
    You're currently on the Community Edition. Upgrade for advanced features,
    increased limits, and priority support. <span
      class="text-primary-400"
      style="text-decoration:underline; cursor:pointer;"
      on:click={() => {
        isUpgradePlanModelOpen = true;
      }}>Upgrade Now</span
    >
  </p>
</div>
