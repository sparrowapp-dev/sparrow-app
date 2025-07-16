<script lang="ts">
  export let onFix;
</script>

<div
  class=" d-flex align-items-center justify-content-center text-center"
  style="background-color: var(--bg-ds-danger-900); height:28px;"
>
  <p class="text-fs-12 mb-0">
    Payment failed: Please check or update billing details in the Admin Panel to
    avoid service interruption. <span
      class="text-primary-400"
      style="text-decoration:underline; cursor:pointer;"
      on:click={onFix}>Fix Now</span
    >
  </p>
</div>
