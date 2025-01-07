<script>
  let currentUser = null;
</script>

{#if currentUser}
  <slot name="loggedIn" />
{:else}
  <slot name="unauthorized" />
{/if}
