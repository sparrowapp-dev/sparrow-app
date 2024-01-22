<script lang="ts">
  import { Router, Route, navigate } from "svelte-navigator";
  import "font-awesome/css/font-awesome.css";
  import Toast from "$lib/components/notifications/Toast.svelte";
  import LoginPage from "./pages/Auth/login-page/LoginPage.svelte";
  import RegisterPage from "./pages/Auth/register-page/RegisterPage.svelte";
  import Authguard from "./routing/Authguard.svelte";
  import Navigate from "./routing/Navigate.svelte";
  import Dashboard from "./pages/Dashboard/Dashboard.svelte";
  import UpdatePassword from "./pages/Auth/update-password/UpdatePassword.svelte";
  import ResetPassword from "./pages/Auth/reset-password/ResetPassword.svelte";
  import ForgotPassword from "./pages/Auth/forgot-password/ForgotPassword.svelte";
  import Waiting from "./pages/Home/Waiting.svelte";
  import { TabRepository } from "$lib/repositories/tab.repository";
  import { syncTabs } from "$lib/store/request-response-section";
  import {
    resizeWindowOnLogOut,
    resizeWindowOnLogin,
  } from "$lib/components/header/window-resize";

  import { onDestroy, onMount } from "svelte";

  import { setUser, user } from "$lib/store/auth.store";
  import { listen } from "@tauri-apps/api/event";
  import { appWindow } from "@tauri-apps/api/window";
  import { jwtDecode, setAuthJwt } from "$lib/utils/jwt";
  import constants from "$lib/utils/constants";
  import { notifications } from "$lib/utils/notifications";
  import { generateSampleRequest } from "$lib/utils/sample/request.sample";
  import { invoke } from "@tauri-apps/api";
  import { createDeepCopy } from "$lib/utils/helpers/conversion.helper";
  import WelcomeScreen from "$lib/components/Transition/WelcomeScreen.svelte";
  import ActiveSideBarTabViewModel from "./pages/Dashboard/ActiveSideBarTab.ViewModel";
    import { RxDB } from "$lib/database/app.database";

  export let url = "/";
  const tabRepository = new TabRepository();
  const _activeSidebarViewModel = new ActiveSideBarTabViewModel();
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
    listen("receive-login", async (event: any) => {
      const params = new URLSearchParams(event.payload.url.split("?")[1]);
      const accessToken = params.get("accessToken");
      const refreshToken = params.get("refreshToken");
      if (accessToken && refreshToken) {
        await invoke("close_oauth_window");
        await appWindow.setFocus();
        setAuthJwt(constants.AUTH_TOKEN, accessToken);
        setAuthJwt(constants.REF_TOKEN, refreshToken);
        setUser(jwtDecode(accessToken));
        notifications.success("Login successful!");
        navigate("/dashboard/collections");
        await resizeWindowOnLogin();
      }
    });

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

<Router {url}>
  <Authguard>
    <section slot="loggedIn">
      <Route path="/dashboard/*" component={Dashboard} />
      <Route path="/*"><Navigate to="/dashboard" /></Route>
    </section>
    <section slot="unauthorized">
      <Route path="/forgot/password" component={ForgotPassword} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/update/password" component={UpdatePassword} />
      <Route path="/reset/password" component={ResetPassword} />
      <Route path="/waiting" component={Waiting} />
      <Route path="/welcome" component={WelcomeScreen} />

      <Route path="/*"><Navigate to="/login" /></Route>
    </section>
  </Authguard>
</Router>

<Toast />

<style>
</style>
