<script lang="ts">
  import { Router, Route } from "svelte-navigator";
  import "font-awesome/css/font-awesome.css";
  import { Toast } from "@sparrow/library/ui";
  import Authguard from "../routing/Authguard.svelte";
  import Navigate from "../routing/Navigate.svelte";
  import Dashboard from "@app/pages/dashboard-page/Dashboard.svelte";
  import EntryPoint from "@app/pages/auth-page/Auth.svelte";
  import { resizeWindowOnLogin } from "../utils";
  import { onMount } from "svelte";
  import { user } from "@app/store/auth.store";
  import { handleShortcuts } from "@app/utils/shortcuts";
  import { AppUpdater } from "@sparrow/common/features";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import LoginPage from "@app/pages/auth-page/sub-pages/login-page/LoginPage.svelte";
  import { singleInstanceHandler } from "@app/utils/singleinstance/app.singleinstance";
  import { AppViewModel } from "./app.ViewModel";

  const _viewModel = new AppViewModel();

  export let url = "/";
  let isActiveInternet: boolean = true;

  const doOnlineCheck = () => {
    if (!navigator.onLine && isActiveInternet) {
      isActiveInternet = false;
      // notifications.error("The network connection has been lost. Please check your internet and try again. ");
    } else isActiveInternet = true;
  };

  onMount(async () => {
    await getCurrentWindow().setFocus();
    await getCurrentWindow().center();
    await _viewModel.registerDeepLinkHandler();
    await singleInstanceHandler();
    let isloggedIn;
    user.subscribe((value) => {
      isloggedIn = value;
    });

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
        <Route path="/*"><Navigate to="/login" /></Route>
      {/if}
    </section>
  </Authguard>
</Router>

<Toast />
<svelte:window on:keydown={handleShortcuts} on:keyup={handleShortcuts} />

<style>
</style>
