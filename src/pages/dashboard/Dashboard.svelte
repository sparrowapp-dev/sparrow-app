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
  import Environment from "../Environment/Environment.svelte";
  import Workspaces from "../Workspaces/Workspaces.svelte";
  import { type WorkspaceDocument } from "$lib/database/app.database";
  import type { Observable } from "rxjs";
  import { HeaderDashboardViewModel } from "$lib/components/header/header-dashboard/HeaderDashboard.ViewModel";
  import { generateSampleWorkspace } from "$lib/utils/sample/workspace.sample";
  import { moveNavigation } from "$lib/utils/helpers/navigation";

  const _viewModelWorkspace = new HeaderDashboardViewModel();
  const _viewModel = new ActiveSideBarTabViewModel();
  const collectionsMethods = new CollectionsViewModel();
  const workspaces: Observable<WorkspaceDocument[]> =
    _viewModelWorkspace.workspaces;
  const activeWorkspace: Observable<WorkspaceDocument> =
    collectionsMethods.getActiveWorkspace();
  let currentWorkspaceId: string;
  let currentWorkspaceName:string;
  const activeWorkspaceSubscribe = activeWorkspace.subscribe(
    async (value: WorkspaceDocument) => {
      if (value) {
        currentWorkspaceId = value.get("_id");
        currentWorkspaceName=value.get("name");
      }
    },
  );
  let collapsExpandToggle = false;
  let selectedActiveSideBar: string = "collections";
  const _viewModels = new CollectionsViewModel();

  const collapsibleStateUnsubscribe = collapsibleState.subscribe((value) => {
    collapsExpandToggle = value;
  });
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
      await activeSideBarTabMethods.addActiveTab("workspaces");
      selectedActiveSideBar = "workspaces";
      const workspace = generateSampleWorkspace(
        currentWorkspaceId,
        new Date().toString(),
        currentWorkspaceName
      );
      workspace.path.workspaceId = currentWorkspaceId;
      collectionsMethods.handleCreateTab(workspace);
      moveNavigation("right");
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
  <HeaderDashboard {collectionsMethods} {activeSideBarTabMethods} />
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
      <Route path="/environment/*"><Environment /></Route>
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
