<script lang="ts">
  import { Router, Route } from "svelte-navigator";
  import "font-awesome/css/font-awesome.css";
  import Toast from "$lib/components/toast-notification/ToastNotification.svelte";
  import Authguard from "@app/routing/Authguard.svelte";
  import Navigate from "@app/routing/Navigate.svelte";
  import Dashboard from "@app/pages/Dashboard/Dashboard.svelte";
  import { TabRepository } from "$lib/repositories/tab.repository";
  import { syncTabs } from "$lib/store/request-response-section";
  import EntryPoint from "@app/pages/Auth/entry-point/EntryPoint.svelte";
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
  import { notifications } from "$lib/components/toast-notification/ToastNotification";
  import LoginPage from "@app/pages/Auth/login-page/LoginPage.svelte";
  import RegisterPage from "@app/pages/Auth/register-page/RegisterPage.svelte";
  import { singleInstanceHandler } from "$lib/utils/singleinstance/app.singleinstance";

  export let url = "/";
  // const tabRepository = new TabRepository();
  // let flag: boolean = true;
  let isActiveInternet: boolean = true;
  // let tabList = tabRepository.getTabList();
  // let sample = generateSampleRequest("id", new Date().toString());
  // tabList.subscribe((val) => {
  //   if (val.length > 0) {
  //     if (flag) {
  //       let progressiveTab;
  //       const tabList = val.map((elem) => {
  //         let temp = createDeepCopy(elem.toJSON());
  //         if (temp?.property?.request) {
  //           temp.property.request.state.responseSection =
  //             sample.property.request.state.responseSection;
  //           temp.property.request.state.responseRaw =
  //             sample.property.request.state.responseRaw;
  //           temp.property.request.state.responseFormatter =
  //             sample.property.request.state.responseFormatter;
  //           temp.property.request.response = sample.property.request.response;
  //         }
  //         if (elem.isActive) {
  //           progressiveTab = temp;
  //         }
  //         return temp;
  //       });
  //       syncTabs(tabList, progressiveTab);
  //       flag = false;
  //     }
  //   }
  // });

  const doOnlineCheck = () => {
    if (!navigator.onLine && isActiveInternet) {
      isActiveInternet = false;
      notifications.error("The network connection has been lost.");
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

    if (!isloggedIn) {
      resizeWindowOnLogOut();
    } else {
      resizeWindowOnLogin();
    }
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
      // doOnlineCheck();
    }, 5000);
  });
</script>

<AutoUpdateDialog />
<Router {url}>
  <Authguard>
    <section slot="loggedIn">
      <Route path="/app/*" component={Dashboard} />
      <Route path="/*"><Navigate to="/app/" /></Route>
    </section>
    <section slot="unauthorized">
      {#if 1}
        <Route path="/init" component={EntryPoint} />
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
