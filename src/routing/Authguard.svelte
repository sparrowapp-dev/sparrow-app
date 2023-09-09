<script>
  import { authActions, authStore } from "$lib/store/auth.store";

  let loggedIn = false;

  $: {
    $authStore;
    loggedIn = authActions.checkAuthSatus();
  }
</script>

{#if loggedIn}
  <slot name="loggedIn" />
{:else}
  <slot name="unauthorized" />
{/if}
