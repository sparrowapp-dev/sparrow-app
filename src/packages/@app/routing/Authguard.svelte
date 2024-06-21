<script>
  import { isGuestUserActive, setUser, user } from "$lib/store/auth.store";
  import { getUserToken } from "$lib/utils/token";
  import { jwtDecode } from "$lib/utils/jwt";
  import { onMount } from "svelte";
  import { GuestUserRepository } from "@app/repositories/guest-user.repository";
  const guestUserRepository = new GuestUserRepository();
  let isGuestUser = false;
  onMount(async () => {
    const token = getUserToken();
    if (token) {
      const userData = jwtDecode(token);
      setUser(userData);
    }
    const response = await guestUserRepository.findOne({ name: "guestUser" });
    if (response) {
      isGuestUser = response?.getLatest().toMutableJSON().isGuestUser;
      isGuestUserActive.set(true);
    }
  });

  let currentUser = null;

  user.subscribe((value) => {
    currentUser = value;
  });
</script>

{#if currentUser}
  <slot name="loggedIn" />
{:else if isGuestUser}
  <slot name="guestUser" />
{:else}
  <slot name="unauthorized" />
{/if}
