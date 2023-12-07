<script lang="ts">
  import { Route } from "svelte-navigator";
  import Sidebar from "$lib/components/sidebar/Sidebar.svelte";
  import Teams from "../Teams/Teams.svelte";
  import Navigate from "../../routing/Navigate.svelte";
  import HeaderDashboard from "$lib/components/header/header-dashboard/HeaderDashboard.svelte";
  import CollectionsHome from "../Collections/Collections.svelte";
  import { collapsibleState } from "$lib/store/request-response-section";
  import { onMount } from "svelte";
  import { isShowCollectionPopup } from "$lib/store/collection";

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

<div class="dashboard">
  <HeaderDashboard />
  <div class="dashboard-teams d-flex">
    <Sidebar />
    <section class="w-100">
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
    </section>
  </div>
</div>
