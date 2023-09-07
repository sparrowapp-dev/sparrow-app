<script lang="ts">
  import { Router, Route } from "svelte-navigator";

  import Toast from "$lib/components/notifications/Toast.svelte";
  import LoginPage from "./pages/Auth/login-page/LoginPage.svelte";
  import RegisterPage from "./pages/Auth/register-page/RegisterPage.svelte";
  import HomePage from "./pages/home-page/HomePage.svelte";
  import Authguard from "./routing/Authguard.svelte";
  import Navigate from "./routing/Navigate.svelte";

  export let url = "/";

</script>

<Router {url}>

      <Authguard>

          <section slot="authed">
              <Route path="/" component={HomePage}/>
          </section>

          <section slot="not_authed">
              <Route path="/login" component={LoginPage}/>
              <Route path="/register" component={RegisterPage}/>
              <Route path="/*" component={Navigate} />
          </section>

      </Authguard>
   
</Router>

<Toast />

<style>
</style>
