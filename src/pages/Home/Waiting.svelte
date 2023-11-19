<script>
  import PageLoader from "$lib/components/Transition/PageLoader.svelte";
  import { setUser } from "$lib/store/auth.store";
  import constants from "$lib/utils/constants";
  import { jwtDecode, setAuthJwt } from "$lib/utils/jwt";
  import { notifications } from "$lib/utils/notifications";
  import { onMount } from "svelte";
  import { navigate } from "svelte-navigator";

  onMount(() => {
    const currentUrl = window.location.href;

    const [queryAccess, queryRefresh] = new URLSearchParams(
      currentUrl.split("?")[1],
    );

    setAuthJwt(constants.AUTH_TOKEN, queryAccess[0]);
    setAuthJwt(constants.REF_TOKEN, queryRefresh[0]);
    setUser(jwtDecode(queryAccess[0]));
    notifications.success("Login successful!");
    navigate("/dashboard");
  });
</script>

<div class="d-flex align-items-center justify-content-center m-auto pt-5">
  <div>
    <PageLoader />
  </div>
</div>
