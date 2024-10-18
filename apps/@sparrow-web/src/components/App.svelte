<script lang="ts">
  import { Router, Route } from "svelte-navigator";
  import "font-awesome/css/font-awesome.css";
  import { Toast } from "@sparrow/library/ui";
  import Authguard from "../routing/Authguard.svelte";
  import Navigate from "../routing/Navigate.svelte";
  import Dashboard from "../pages/Dashboard/Dashboard.svelte";
  import { onMount } from "svelte";
  import { handleLogin } from "./App";

  export let url = "/";

  onMount(async () => {
    handleLogin(window.location.search);
  });
</script>

<Router {url}>
  <Authguard>
    <section slot="loggedIn">
      <Route path="/app/*" component={Dashboard} />
      <Route path="/*"><Navigate to="/app/" /></Route>
    </section>
    <section slot="guestUser">
      <Route path="/guest/*" component={Dashboard} />
      <Route path="/*"><Navigate to="/guest/" /></Route>
    </section>
    <!-- <section slot="unauthorized">ACCESS DENIED</section> -->
  </Authguard>
</Router>

<Toast />

<style>
</style>
