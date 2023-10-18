<script>
  import { setUser, user } from "$lib/store/auth.store";
  import { getUserToken } from "$lib/utils/token";
  import { jwtDecode } from "$lib/utils/jwt";
  import { onMount } from "svelte";

  onMount(() => {
    const token = getUserToken();
    if (token) {
      const userData = jwtDecode(token);
      setUser(userData);
    }
  });

  let currentUser = null;
  
  user.subscribe((value)=>{
    currentUser = value;
  });
  
</script>

{#if currentUser}
  <slot name="loggedIn" />
{:else}
  <slot name="unauthorized" />
{/if}
