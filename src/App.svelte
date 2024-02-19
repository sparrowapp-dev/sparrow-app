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
  import {
    resizeWindowOnLogOut,
    resizeWindowOnLogin,
  } from "$lib/components/header/window-resize";

  import { onMount } from "svelte";

  import { setUser, user } from "$lib/store/auth.store";
  import { listen } from "@tauri-apps/api/event";
  import { appWindow } from "@tauri-apps/api/window";
  import { jwtDecode, setAuthJwt } from "$lib/utils/jwt";
  import constants from "$lib/utils/constants";
  import { notifications } from "$lib/components/toast-notification/ToastNotification";
  import { generateSampleRequest } from "$lib/utils/sample/request.sample";
  import { invoke } from "@tauri-apps/api";
  import { createDeepCopy } from "$lib/utils/helpers/conversion.helper";
  import WelcomeScreen from "$lib/components/Transition/WelcomeScreen.svelte";
  import { handleShortcuts } from "$lib/utils/shortcuts";
  import {
    checkUpdate,
    installUpdate,
    onUpdaterEvent,
  } from "@tauri-apps/api/updater";
  import ProgressBar from "$lib/components/Transition/progress-bar/ProgressBar.svelte";
  import { relaunch } from "@tauri-apps/api/process";
  import Modal from "$lib/components/Modal/Modal.svelte";
  import { ModalWrapperV1 } from "$lib/components";
  import Button from "$lib/components/buttons/Button.svelte";

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

  var showProgressBar = false;
  var updateAvailable = false;
  onMount(async () => {
    const unlisten = await onUpdaterEvent(({ error, status }) => {
      console.log("STATUS ===> ", status);
      console.log("error ===> ", error);
      // This will log all updater events, including status updates and errors.
      if (status === "PENDING") {
        showProgressBar = true;
      } else if (status === "DONE") {
        showProgressBar = false;
      }
    });
    try {
      const { shouldUpdate, manifest } = await checkUpdate();
      if (shouldUpdate) {
        notifications.info("Update Available");
        updateAvailable = true;
      }
    } catch (error) {
      console.error(error);
    }

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

  const handleUpdatePopUp = (flag: boolean) => {
    updateAvailable = flag;
  };
</script>

{#if updateAvailable === true}
  <ProgressBar onClick="" title="Update in progress" />{/if}
<ModalWrapperV1
  title={"New Update Available!!!"}
  type={"primary"}
  width={"50%"}
  zIndex={1000}
  isOpen={updateAvailable}
  handleModalState={handleUpdatePopUp}
>
  <div class="text-lightGray mb-1 sparrow-fs-14">
    <p>Are you sure you want to update?</p>
  </div>
  <div
    class="d-flex align-items-center justify-content-end gap-3 mt-1 mb-0 rounded"
  >
    <Button
      disable={showProgressBar}
      title={"Cancel"}
      textStyleProp={"font-size: var(--base-text)"}
      type={"dark"}
      loader={false}
      onClick={() => {
        updateAvailable = false;
        showProgressBar = true;
      }}
    />

    <Button
      disable={showProgressBar}
      title={"Update"}
      textStyleProp={"font-size: var(--base-text)"}
      type={"primary"}
      loader={false}
      onClick={() => {
        updateAvailable = false;
        showProgressBar = true;
        installUpdate().then(() => {
          notifications.success("Update Completed. App will relaunch now!");
          relaunch();
        });
      }}
    />
  </div></ModalWrapperV1
>
{#if showProgressBar === true}
  <ProgressBar onClick="" title="Update in progress" />{/if}
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
<svelte:window on:keydown={handleShortcuts} />;

<style>
</style>
