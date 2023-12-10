<script lang="ts">
  import { Route } from "svelte-navigator";
  import Sidebar from "$lib/components/sidebar/Sidebar.svelte";
  import Navigate from "../../routing/Navigate.svelte";
  import HeaderDashboard from "$lib/components/header/header-dashboard/HeaderDashboard.svelte";
  import Teams from "../Teams/Teams.svelte";
  import CollectionsHome from "../Collections/Collections.svelte";
  import { collapsibleState } from "$lib/store/request-response-section";
  import { onMount } from "svelte";
  import ActiveSideBarTabViewModel from "./ActiveSideBarTab.ViewModel";
  import { CollectionsViewModel } from "../Collections/Collections.ViewModel";
  import Mock from "../Mock/Mock.svelte";
  import Enviornment from "../Enviornment/Enviornment.svelte";
  import Workspaces from "../Workspaces/Workspaces.svelte";
  import { type WorkspaceDocument } from "$lib/database/app.database";
  import type { Observable } from "rxjs";
  import { HeaderDashboardViewModel } from "$lib/components/header/header-dashboard/HeaderDashboard.ViewModel";
  const _viewModelWorkspace = new HeaderDashboardViewModel();
  const workspaces: Observable<WorkspaceDocument[]> =
    _viewModelWorkspace.workspaces;
  let collapsExpandToggle = false;
  let selectedActiveSideBar: string = "collections";

  const collapsibleStateUnsubscribe = collapsibleState.subscribe((value) => {
    collapsExpandToggle = value;
  });
  const _viewModel = new ActiveSideBarTabViewModel();
  const collectionsMethods = new CollectionsViewModel();
  const activeSideBarTabMethods = {
    addActiveTab: _viewModel.addActiveTab,
    getActiveTab: _viewModel.getActiveTab,
    updateActiveTab: _viewModel.updateActiveTab,
  };
  const setcollapsExpandToggle = () => {
    collapsibleState.set(false);
  };

  collapsibleStateUnsubscribe();

  let isCollaps = false;

  const handleResize = () => {
    const windowWidth = window.innerWidth;
    isCollaps = windowWidth <= 800;
  };

  async function handleActiveTab() {
    const activeTab = await activeSideBarTabMethods.getActiveTab();
    if (activeTab) {
      selectedActiveSideBar = activeTab;
    } else {
      await activeSideBarTabMethods.addActiveTab("collections");
      selectedActiveSideBar = "collections";
    }
    return selectedActiveSideBar;
  }

  const getActiveTab = handleActiveTab();

  onMount(() => {
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });
</script>

<div class="dashboard">
  <HeaderDashboard {collectionsMethods} />
  <div class="dashboard-teams d-flex">
    {#await getActiveTab then selectedActiveSideBar}
      <Sidebar
        {activeSideBarTabMethods}
        selectedActiveSideBarTab={selectedActiveSideBar}
      />
    {:catch}
      <Sidebar
        {activeSideBarTabMethods}
        selectedActiveSideBarTab={"collections"}
      />
    {/await}
    <section class="w-100">
      <Route path="/collections/*"><CollectionsHome /></Route>
      <Route path="/workspaces/*"><Workspaces data={workspaces} /></Route>
      <Route path="/mock/*"><Mock /></Route>
      <Route path="/environment/*"><Enviornment /></Route>
      <Route path="/teams/*"><Teams /></Route>
      <Route path="/help">Help</Route>
      <Route path="/*">
        {#await getActiveTab then activeTab}
          <Navigate to={activeTab} />
        {:catch}
          <Navigate to={"collections"} />
        {/await}
      </Route>
    </section>
  </div>
</div>
