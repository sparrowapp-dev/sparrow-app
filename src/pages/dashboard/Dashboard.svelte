<script lang="ts">
  import { Route } from "svelte-navigator";
  import Sidebar from "$lib/components/sidebar/Sidebar.svelte";
  import Teams from "../Teams/Teams.svelte";
  import Navigate from "../../routing/Navigate.svelte";
  import HeaderDashboard from "$lib/components/header/header-dashboard/HeaderDashboard.svelte";
  import CollectionsHome from "../Collections/collections-home/CollectionsHome.svelte";
  import { collapsibleState } from "$lib/store/request-response-section";
  import { onMount } from "svelte";

  let collapsExpandToggle = false;

  const collapsibleStateUnsubscribe = collapsibleState.subscribe((value) => {
    collapsExpandToggle = value;
  });

  const setcollapsExpandToggle = () => {
    collapsibleState.set(false);
  };

  collapsibleStateUnsubscribe();

  let isCollaps = false;

  const handleResize = () => {
    const windowWidth = window.innerWidth;

    isCollaps = windowWidth <= 800;
  };

  onMount(() => {
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });
</script>

<HeaderDashboard />
<div class="dashboard-teams d-flex flex-column">
  <Sidebar />
  <Route path="/collections/*"><CollectionsHome /></Route>
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
