<script lang="ts">
  import { Route } from "svelte-navigator";
  import Sidebar from "$lib/components/sidebar/Sidebar.svelte";
  import Teams from "../Teams/Teams.svelte";
  import Navigate from "../../routing/Navigate.svelte";
  import HeaderDashboard from "$lib/components/header/header-dashboard/HeaderDashboard.svelte";
  import CollectionsHome from "../Collections/Collections.svelte";
  import { collapsibleState } from "$lib/store/request-response-section";
  import { onMount } from "svelte";
  import ActiveSideBarTabViewModel from "./ActiveSideBarTab.ViewModel";



  let collapsExpandToggle = false;
  let selectedActiveSideBar:string="collections";


  const collapsibleStateUnsubscribe = collapsibleState.subscribe((value) => {
    collapsExpandToggle = value;
  });
  const _viewModel = new ActiveSideBarTabViewModel();
  const activeSideBarTabMethods={
    addActiveTab:_viewModel.addActiveTab,
    getActiveTab:_viewModel.getActiveTab,
    updateActiveTab:_viewModel.updateActiveTab,
  }
  const setcollapsExpandToggle = () => {
    collapsibleState.set(false);
  };

  collapsibleStateUnsubscribe();

  let isCollaps = false;

  const handleResize = () => {
    const windowWidth = window.innerWidth;
    isCollaps = windowWidth <= 800;
  };


  async function handleActiveTab(){
    const activeTab=await activeSideBarTabMethods.getActiveTab();
    if(activeTab){
      selectedActiveSideBar=activeTab;
    }else{
      await activeSideBarTabMethods.addActiveTab("collections");
      selectedActiveSideBar="collections";
    }
    return selectedActiveSideBar;
  }

  const getActiveTab=handleActiveTab();

  

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
    {#await getActiveTab}
    {:then selectedActiveSideBar}
    <Sidebar activeSideBarTabMethods={activeSideBarTabMethods} selectedActiveSideBarTab={selectedActiveSideBar} />
    {:catch}
    <Sidebar activeSideBarTabMethods={activeSideBarTabMethods} selectedActiveSideBarTab={"collections"} />
    {/await}
    <section class="w-100">
    <Route path="/collections/*"><CollectionsHome /></Route>
    <Route path="/mock">Mock</Route>
    <Route path="/environment">Environment</Route>
    <Route path="/teams/*"><Teams /></Route>
    <Route path="/workspaces">Workspaces</Route>
    <Route path="/help">Help</Route>
    <Route path="/*">
     {#await getActiveTab}
     {:then activeTab}
     <Navigate to={activeTab}></Navigate>
     {:catch}
     <Navigate to={"collections"}></Navigate>
     {/await}
    </Route>
  </section>
  </div>
</div>
