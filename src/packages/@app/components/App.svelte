<script lang="ts">
  import { Router, Route } from "svelte-navigator";
  import "font-awesome/css/font-awesome.css";
  import Toast from "@library/ui/toast/Toast.svelte";
  import Authguard from "@app/routing/Authguard.svelte";
  import Navigate from "@app/routing/Navigate.svelte";
  import Dashboard from "@app/pages/Dashboard/Dashboard.svelte";
  import EntryPoint from "@app/pages/Auth/entry-point/EntryPoint.svelte";
  import { resizeWindowOnLogin } from "../utils";
  import { registerDeepLinkHandler } from "$lib/utils/deeplink/app.deeplink";
  import { onMount } from "svelte";
  import { user } from "$lib/store/auth.store";
  import { handleShortcuts } from "$lib/utils/shortcuts";
  import { AppUpdater } from "@common/features";
  import { getCurrent } from "@tauri-apps/api/window";
  import { notifications } from "@library/ui/toast/Toast";
  import LoginPage from "@app/pages/Auth/login-page/LoginPage.svelte";
  import RegisterPage from "@app/pages/Auth/register-page/RegisterPage.svelte";
  import { singleInstanceHandler } from "$lib/utils/singleinstance/app.singleinstance";

  export let url = "/";
  let isActiveInternet: boolean = true;

  const doOnlineCheck = () => {
    if (!navigator.onLine && isActiveInternet) {
      isActiveInternet = false;
      // notifications.error("The network connection has been lost. Please check your internet and try again. ");
    } else isActiveInternet = true;
  };

  onMount(async () => {
    await getCurrent().setFocus();
    await getCurrent().center();
    await registerDeepLinkHandler();
    await singleInstanceHandler();
    let isloggedIn;
    user.subscribe((value) => {
      isloggedIn = value;
    });

    resizeWindowOnLogin();
    window.addEventListener(
      "dragover",
      function (e) {
        e = e || event;
        e.preventDefault();
      },
      false,
    );
    window.addEventListener(
      "drop",
      function (e) {
        e = e || event;
        e.preventDefault();
      },
      false,
    );
    setInterval(() => {
      doOnlineCheck();
    }, 5000);
  });
  window.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
</script>

<AppUpdater />
<Router {url}>
  <Authguard>
    <section slot="loggedIn">
      <Route path="/app/*" component={Dashboard} />
      <Route path="/*"><Navigate to="/app/" /></Route>
    </section>
    <section slot="guestUser">
      <Route path="/guest/*" component={Dashboard} />
      <Route path="/*"><Navigate to="/guest/" /></Route>
    </section>
    <section slot="unauthorized">
      {#if 1}
        <Route path="/init" component={EntryPoint} />
        <Route path="/init/*" component={Dashboard} />
        <Route path="/*"><Navigate to="/init" /></Route>
      {:else}
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/*"><Navigate to="/login" /></Route>
      {/if}
    </section>
  </Authguard>
</Router>

<Toast />
<svelte:window on:keydown={handleShortcuts} on:keyup={handleShortcuts} />

<style>
</style>
