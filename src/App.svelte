<script lang="ts">
  import { Router, Route } from "svelte-navigator";
  import "font-awesome/css/font-awesome.css";

  import Toast from "$lib/components/notifications/Toast.svelte";
  import LoginPage from "./pages/Auth/login-page/LoginPage.svelte";
  import RegisterPage from "./pages/Auth/register-page/RegisterPage.svelte";
  import HomePage from "./pages/Home/home-page/HomePage.svelte";
  import Authguard from "./routing/Authguard.svelte";
  import Navigate from "./routing/Navigate.svelte";
  import UpdatePassword from "./pages/Auth/update-password/UpdatePassword.svelte";
  import ResetPassword from "./pages/Auth/reset-password/ResetPassword.svelte";
  import ForgotPassword from "./pages/Auth/forgot-password/ForgotPassword.svelte";
  import ResendEmail from "./pages/Auth/resend-email/ResendEmail.svelte";

  export let url = "/";
</script>

<Router {url}>
  <Authguard>
    <section slot="loggedIn">
      <Route path="/" component={HomePage} />
      <Route path="/*">
        <Navigate to="/" />
      </Route>
    </section>

    <section slot="unauthorized">
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/forgot/password" component={ForgotPassword} />
      <Route path="/update/password" component={UpdatePassword} />
      <Route path="/reset/password" component={ResetPassword} />
      <Route path="/resend/email" component={ResendEmail} />

      <Route path="/*">
        <Navigate to="/login" />
      </Route>
    </section>
  </Authguard>
</Router>

<Toast />

<style>
</style>
