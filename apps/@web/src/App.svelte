<script lang="ts">
  import { Router, Route } from "svelte-navigator";
  import "font-awesome/css/font-awesome.css";
  import Navigate from "./routing/Navigate.svelte";
  import EntryPoint from "./pages/Auth/entry-point/EntryPoint.svelte";
  export let url = "/";
</script>

<Router {url}>
  <Route path="/init" component={EntryPoint} />

  <Route path="/*"><Navigate to="/init" /></Route>
</Router>

<div
  style="height: 100vh; top:0; left:0;
right:0; z-index:-100 !important"
  class="w-100 position-fixed"
></div>
