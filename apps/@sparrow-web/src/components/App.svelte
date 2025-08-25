<script lang="ts">
  import { Router, Route } from "svelte-navigator";
  import "font-awesome/css/font-awesome.css";
  import { Toast } from "@sparrow/library/ui";
  import Authguard from "../routing/Authguard.svelte";
  import Navigate from "../routing/Navigate.svelte";
  import Dashboard from "../pages/Dashboard/Dashboard.svelte";
  import { onMount, onDestroy } from "svelte";
  import { handleLogin } from "./App";
  import { initPostHog } from "@app/utils/posthog/posthogConfig";
  export let url = "/";

  let channel: BroadcastChannel;

  onMount(async () => {
    if (typeof window !== "undefined") {
      initPostHog();

      // Listen for refresh events from other tabs
      channel = new BroadcastChannel("sparrow_app_channel");
      channel.onmessage = (event) => {
        if (event.data === "refresh") {
          window.location.reload();
        }
      };
    }
    handleLogin(window.location.search);
  });

  onDestroy(() => {
    if (channel) channel.close();
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
