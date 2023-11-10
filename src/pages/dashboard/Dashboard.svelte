<script lang="ts">
  import { Route } from "svelte-navigator";
  import Sidebar from "$lib/components/sidebar/Sidebar.svelte";
  import Teams from "../Teams/Teams.svelte";
  import Navigate from "../../routing/Navigate.svelte";
  import HeaderHome from "$lib/components/header/HeaderHome.svelte";
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

  let isCollaps = false; // Initialize to false

  const handleResize = () => {
    const windowWidth = window.innerWidth;

    console.log("kashif");
    // Check if the window width is less than or equal to 600px
    isCollaps = windowWidth <= 800;
  };

  onMount(() => {
    // Add the event listener when the component mounts
    window.addEventListener("resize", handleResize);
    // Call the handler initially to set the initial state
    handleResize();

    return () => {
      // Remove the event listener when the component unmounts
      window.removeEventListener("resize", handleResize);
    };
  });
</script>

<HeaderHome />
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
