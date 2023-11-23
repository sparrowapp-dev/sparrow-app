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
  import { appWindow, currentMonitor } from "@tauri-apps/api/window";
  import { isLoggout, user } from "$lib/store/auth.store";
  export let url = "/";

  // function handleContextMenu(event) {
  //   event.preventDefault();
  // on:contextmenu={handleContextMenu}
  // }

  let isLoggedIn;
  user.subscribe((value) => {
    isLoggedIn = value;
  });

  onMount(async () => {
    const monitor = await currentMonitor();
    const monitorPhysicalSize = monitor.size;

    let scaleFactor = 1;

    const logicalSize = monitorPhysicalSize.toLogical(scaleFactor);
    let appWidth = logicalSize.width / 2.5;
    let appHeight = logicalSize.height;
    await appWindow.setSize({
      type: "Logical",
      width: appWidth,
      height: appHeight,
    });
    await appWindow.center();
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
