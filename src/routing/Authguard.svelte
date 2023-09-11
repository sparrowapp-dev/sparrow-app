<script>
  import { authActions, authStore } from "$lib/store/auth.store";
  import { onMount } from "svelte";

  onMount(() => {
    authActions.checkAuthStatus();
  });
  
</script>

{#if $authStore.user}
  <slot name="loggedIn" />
{:else}
  <slot name="unauthorized" />
{/if}
