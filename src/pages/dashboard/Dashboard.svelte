<script lang="ts">
  import { Route } from "svelte-navigator";
  import Sidebar from "$lib/components/sidebar/Sidebar.svelte";
  import Teams from "./teams/Teams.svelte";
  import Navigate from "../../routing/Navigate.svelte";
  //   import Header from "$lib/components/header/Header.svelte";
  import HeaderHome from "$lib/components/header/HeaderHome.svelte";
</script>

<HeaderHome />
<div class="dashboard-teams d-flex">
  <Sidebar />
  <Route path="/collections">Collections</Route>
  <Route path="/mock">Mock</Route>
  <Route path="/environment">Environment</Route>
  <Route path="/api-builder">API Builder</Route>
  <Route path="/wiki">Wiki</Route>
  <Route path="/teams/*"><Teams /></Route>
  <Route path="/workspaces">Workspaces</Route>
  <Route path="/help">Help</Route>
  <Route path="/*">
    <Navigate to="collections" />
  </Route>
</div>

<style>
  .dashboard-teams {
    margin-left: 72px;
  }
</style>
