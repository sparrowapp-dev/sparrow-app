<script lang="ts">
  import { Router, Route } from "svelte-navigator";
  import "font-awesome/css/font-awesome.css";
  import Toast from "$lib/components/toast-notification/ToastNotification.svelte";
  import Authguard from "./routing/Authguard.svelte";
  import Navigate from "./routing/Navigate.svelte";
  import Dashboard from "./pages/dashboard/Dashboard.svelte";
  import { TabRepository } from "$lib/repositories/tab.repository";
  import { syncTabs } from "$lib/store/request-response-section";
  import EntryPoint from "./pages/Auth/entry-point/EntryPoint.svelte";
  import {
    resizeWindowOnLogOut,
    resizeWindowOnLogin,
  } from "$lib/components/header/window-resize";
  import { registerDeepLinkHandler } from "$lib/utils/deeplink/app.deeplink";
  import { onMount } from "svelte";
  import { user } from "$lib/store/auth.store";
  import { generateSampleRequest } from "$lib/utils/sample/request.sample";
  import { createDeepCopy } from "$lib/utils/helpers/conversion.helper";
  import { handleShortcuts } from "$lib/utils/shortcuts";
  import AutoUpdateDialog from "$lib/components/Modal/AutoUpdateDialog.svelte";
  import { getCurrent } from "@tauri-apps/api/window";

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
    await getCurrent().setFocus();
    await registerDeepLinkHandler();
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
      <!-- deprecated - visit sparrow auth repo -->
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
