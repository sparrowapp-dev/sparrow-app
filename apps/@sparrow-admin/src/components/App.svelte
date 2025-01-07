<script lang="ts">
  import { Router, Route } from "svelte-navigator";
  import "font-awesome/css/font-awesome.css";
  import { Toast } from "@sparrow/library/ui";
  import Authguard from "../routing/Authguard.svelte";
  import Navigate from "../routing/Navigate.svelte";
  import Dashboard from "../pages/Dashboard/Dashboard.svelte";
  import LoginPage from "src/pages/LoginPage/LoginPage.svelte";

  export let url = "/";
</script>

<Router {url}>
  <Authguard>
    <section slot="loggedIn">
      <Route path="/app/*" component={Dashboard} />
      <Route path="/*"><Navigate to="/app/" /></Route>
    </section>
    <section slot="unauthorized">
      <Route path="/init/*" component={LoginPage} />
      <Route path="/*"><Navigate to="/init/" /></Route>
    </section>
  </Authguard>
</Router>

<Toast />

<style>
</style>
