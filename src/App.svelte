<script lang="ts">
  import { Router, Route, navigate } from "svelte-navigator";
  import "font-awesome/css/font-awesome.css";
  import Toast from "$lib/components/toast-notification/ToastNotification.svelte";
  import LoginPage from "./pages/Auth/login-page/LoginPage.svelte";
  import RegisterPage from "./pages/Auth/register-page/RegisterPage.svelte";
  import Authguard from "./routing/Authguard.svelte";
  import Navigate from "./routing/Navigate.svelte";
  import Dashboard from "./pages/dashboard/Dashboard.svelte";
  import UpdatePassword from "./pages/Auth/update-password/UpdatePassword.svelte";
  import ResetPassword from "./pages/Auth/reset-password/ResetPassword.svelte";
  import ForgotPassword from "./pages/Auth/forgot-password/ForgotPassword.svelte";
  import Waiting from "./pages/Home/Waiting.svelte";
  import { TabRepository } from "$lib/repositories/tab.repository";
  import { syncTabs } from "$lib/store/request-response-section";
  import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
  import EntryPoint from "./pages/Auth/entry-point/EntryPoint.svelte";
  import {
    resizeWindowOnLogOut,
    resizeWindowOnLogin,
  } from "$lib/components/header/window-resize";
  import { handleDeepLinkHandler } from "$lib/utils/deeplink/app.deeplink";

  import { onMount } from "svelte";

  import { user } from "$lib/store/auth.store";
  import { generateSampleRequest } from "$lib/utils/sample/request.sample";
  import { createDeepCopy } from "$lib/utils/helpers/conversion.helper";
  import WelcomeScreen from "$lib/components/Transition/WelcomeScreen.svelte";
  import { handleShortcuts } from "$lib/utils/shortcuts";
  import AutoUpdateDialog from "$lib/components/Modal/AutoUpdateDialog.svelte";
  import { listen } from "@tauri-apps/api/event";

  export let url = "/";
  const tabRepository = new TabRepository();
  let flag: boolean = true;
  let tabList = tabRepository.getTabList();
  let sample = generateSampleRequest("id", new Date().toString());
  tabList.subscribe((val) => {
    if (val.length > 0) {
      if (flag) {
        let progressiveTab;
        const tabList = val.map((elem) => {
          let temp = createDeepCopy(elem.toJSON());
          if (temp?.property?.request) {
            temp.property.request.state.responseSection =
              sample.property.request.state.responseSection;
            temp.property.request.state.responseRaw =
              sample.property.request.state.responseRaw;
            temp.property.request.state.responseFormatter =
              sample.property.request.state.responseFormatter;
            temp.property.request.response = sample.property.request.response;
          }
          if (elem.isActive) {
            progressiveTab = temp;
          }
          return temp;
        });
        syncTabs(tabList, progressiveTab);
        flag = false;
      }
    }
  });

  onMount(async () => {
    const isWin = navigator.platform.toLowerCase().includes("win");
    if (!isWin) await onOpenUrl(handleDeepLinkHandler);
    else await listen("deep-link-urls", handleDeepLinkHandler);

    let isloggedIn;
    user.subscribe((value) => {
      isloggedIn = value;
    });

    if (!isloggedIn) {
      resizeWindowOnLogOut();
    } else {
      resizeWindowOnLogin();
    }
  });
</script>

<AutoUpdateDialog />
<Router {url}>
  <Authguard>
    <section slot="loggedIn">
      <Route path="/dashboard/*" component={Dashboard} />
      <Route path="/*"><Navigate to="/dashboard" /></Route>
    </section>
    <section slot="unauthorized">
      <Route path="/init" component={EntryPoint} />
      <!-- - -->
      <!-- deprecate - visit sparrow auth repo -->
      <!-- - -->

      <!-- <Route path="/forgot/password" component={ForgotPassword} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/update/password" component={UpdatePassword} />
      <Route path="/reset/password" component={ResetPassword} />
      <Route path="/waiting" component={Waiting} />
      <Route path="/welcome" component={WelcomeScreen} /> -->
      <Route path="/*"><Navigate to="/init" /></Route>
    </section>
  </Authguard>
</Router>

<Toast />
<svelte:window on:keydown={handleShortcuts} on:keyup={handleShortcuts} />;

<style>
</style>
