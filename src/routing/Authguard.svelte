<script>
  import { authStore } from "$lib/store/auth.store";

  let loggedIn = true;

  authStore.subscribe(({ user }) => {
    loggedIn = user || localStorage.getItem("AUTH_TOKEN") ? true : false;
  });

</script>

{#if loggedIn}
  <slot name="authed" />
{:else}
  <slot name="not_authed" />
{/if}
