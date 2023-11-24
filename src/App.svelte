<script lang="ts">
  import { Router, Route } from "svelte-navigator";
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

  import { onMount } from "svelte";
  import {
    appWindow,
    currentMonitor,
    getCurrent,
  } from "@tauri-apps/api/window";

  export let url = "/";

  // function handleContextMenu(event) {
  //   event.preventDefault();
  // on:contextmenu={handleContextMenu}
  // }

  onMount(async () => {
    const monitor = await currentMonitor();
    const monitorPhysicalSize = await getCurrent().innerSize();
    let scaleFactor = monitor.scaleFactor;
    const logicalSize = monitorPhysicalSize.toLogical(scaleFactor);

    const minWidth = 500;
    const maxWidth = 500;
    const minHeight = 700;
    const maxHeight = 700;

    if (logicalSize.width < minWidth) {
      logicalSize.width = minWidth;
    }
    if (logicalSize.width > maxWidth) {
      logicalSize.width = maxWidth;
    }
    if (logicalSize.height < minHeight) {
      logicalSize.height = minHeight;
    }
    if (logicalSize.height > maxHeight) {
      logicalSize.height = maxHeight;
    }
    await getCurrent().setSize(logicalSize);
    await getCurrent().center();
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

      <Route path="/*"><Navigate to="/login" /></Route>
    </section>
  </Authguard>
</Router>

<Toast />

<style>
</style>
