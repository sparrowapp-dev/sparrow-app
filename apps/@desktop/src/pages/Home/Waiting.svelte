<script>
  import { Loader } from "@sparrow/library/ui";
  import { setUser } from "@app/store/auth.store";
  import constants from "@app/constants/constants";
  import { jwtDecode, setAuthJwt } from "@app/utils/jwt";
  import { notifications } from "@sparrow/library/ui";
  import { onMount } from "svelte";
  import { navigate } from "svelte-navigator";

  let accessToken;
  let refreshToken;

  onMount(() => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    accessToken = params.get("accessToken");
    refreshToken = params.get("refreshToken");

    setAuthJwt(constants.AUTH_TOKEN, accessToken);
    setAuthJwt(constants.REF_TOKEN, refreshToken);
    setUser(jwtDecode(accessToken));

    notifications.success("Login successful!");
    navigate("/dashboard");
  });
</script>

<div class="d-flex align-items-center justify-content-center m-auto pt-5">
  <div>
    <Loader loaderSize={"80px"} loaderMessage="Please Wait..." />
  </div>
</div>
