<script lang="ts">
  import { Router, Route } from "svelte-navigator";

  import Toast from "$lib/components/notifications/Toast.svelte";
  import LoginPage from "./pages/Auth/login-page/LoginPage.svelte";
  import RegisterPage from "./pages/Auth/register-page/RegisterPage.svelte";
  import HomePage from "./pages/home-page/HomePage.svelte";
  import TeamsPage from "./pages/teams-page/TeamsPage.svelte";
  import Authguard from "./routing/Authguard.svelte";
  import Navigate from "./routing/Navigate.svelte";

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
      <Route path="/" component={TeamsPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/*">
        <Navigate to="/login" />
      </Route>
    </section>
  </Authguard>
</Router>

<Toast />

<style>
</style>
