<script>
  import { isGuestUserActive, setUser, user } from "@app/store/auth.store";
  import { getUserToken } from "@app/utils/token";
  import { jwtDecode } from "@app/utils/jwt";
  import { onMount } from "svelte";
  import { GuestUserRepository } from "@app/repositories/guest-user.repository";
  const guestUserRepository = new GuestUserRepository();

  onMount(async () => {
    const token = getUserToken();
    if (token) {
      const userData = jwtDecode(token);
      setUser(userData);
    }
    const guestUser = await guestUserRepository.findOne({ name: "guestUser" });
    const isGuestUser = guestUser?.getLatest().toMutableJSON().isGuestUser;
    if (isGuestUser) {
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
{:else if $isGuestUserActive}
  <slot name="guestUser" />
{:else}
  <slot name="unauthorized" />
{/if}
