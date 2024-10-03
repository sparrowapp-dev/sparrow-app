<script lang="ts">
  import { Router, Route } from "svelte-navigator";
  import "font-awesome/css/font-awesome.css";
  import { Toast } from "@sparrow/library/ui";
  import Authguard from "../routing/Authguard.svelte";
  import Navigate from "../routing/Navigate.svelte";
  import Dashboard from "@app/pages/Dashboard/Dashboard.svelte";
  import { onMount } from "svelte";
  import { user } from "@app/store/auth.store";

  export let url = "/";
  let isActiveInternet: boolean = true;

  const doOnlineCheck = () => {
    if (!navigator.onLine && isActiveInternet) {
      isActiveInternet = false;
    } else isActiveInternet = true;
  };

  onMount(async () => {
    let isloggedIn;
    user.subscribe((value) => {
      isloggedIn = value;
    });

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
      doOnlineCheck();
    }, 5000);
  });
  window.addEventListener("contextmenu", (e) => {
    e.preventDefault();
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
    <section slot="unauthorized">ACCESS DENIED</section>
  </Authguard>
</Router>

<Toast />

<style>
</style>
