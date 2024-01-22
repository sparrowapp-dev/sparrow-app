<script lang="ts">
  import { Route } from "svelte-navigator";
  import Sidebar from "$lib/components/sidebar/Sidebar.svelte";
  import Navigate from "../../routing/Navigate.svelte";
  import HeaderDashboard from "$lib/components/header/header-dashboard/HeaderDashboard.svelte";
  import CollectionsHome from "../Collections/Collections.svelte";
  import { collapsibleState } from "$lib/store/request-response-section";
  import { onDestroy, onMount } from "svelte";
  import ActiveSideBarTabViewModel from "./ActiveSideBarTab.ViewModel";
  import { CollectionsViewModel } from "../Collections/Collections.ViewModel";
  import Mock from "../Mock/Mock.svelte";
  import Environment from "../Environment/Environment.svelte";
  import Teams from "../Teams/Teams.svelte";
  import {
    type ActiveSideBarTabDocument,
    type TeamDocument,
    type WorkspaceDocument,
  } from "$lib/database/app.database";
  import type { Observable } from "rxjs";
  import { HeaderDashboardViewModel } from "$lib/components/header/header-dashboard/HeaderDashboard.ViewModel";
  import { generateSampleWorkspace } from "$lib/utils/sample/workspace.sample";
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import {
    isWorkspaceCreatedFirstTime,
    isWorkspaceLoaded,
    setCurrentWorkspace,
  } from "$lib/store/workspace.store";
  import { TeamViewModel } from "../Teams/team.viewModel";
  import type { Path } from "$lib/utils/interfaces/request.interface";
  import type { CurrentTeam, CurrentWorkspace } from "$lib/utils/interfaces";
  import { user } from "$lib/store";
  import { TeamRepository } from "$lib/repositories/team.repository";

  const _viewModelWorkspace = new HeaderDashboardViewModel();
  const _viewModel = new ActiveSideBarTabViewModel();
  const collectionsMethods = new CollectionsViewModel();
  const _viewModelHome = new TeamViewModel();
  const activeWorkspaceRxDoc: Observable<WorkspaceDocument> =
    _viewModelHome.activeWorkspace;
  const activeTeamRxDoc: Observable<TeamDocument> = _viewModelHome.activeTeam;
  const activeWorkspace: Observable<WorkspaceDocument> =
    collectionsMethods.getActiveWorkspace();
  const teams: Observable<TeamDocument[]> = _viewModelHome.teams;

  let currentWorkspaceId: string;
  let currentWorkspaceName: string;
  let currentTeam: CurrentTeam;
  let currentWorkspace: CurrentWorkspace;
  let activeSidebarTabName: string;
  let workspaces: Observable<WorkspaceDocument[]> =
    _viewModelWorkspace.workspaces;
  let activeSidebarTab: Observable<ActiveSideBarTabDocument> =
    _viewModel.getActiveTab();
  let activeSidbarTabRxDoc: ActiveSideBarTabDocument;

  const userUnsubscribe = user.subscribe(async (value) => {
    if (value) {
      await _viewModelHome.refreshTeams(value._id);
      await _viewModelWorkspace.refreshWorkspaces(value._id);
    }
  });
  const activeWorkspaceSubscribe = activeWorkspace.subscribe(
    async (value: WorkspaceDocument) => {
      if (value) {
        currentWorkspaceId = value.get("_id");
        currentWorkspaceName = value.get("name");
        currentWorkspace = {
          id: value.get("_id"),
          name: value.get("name"),
        };
        let currentTeam = value.get("team");
        _viewModelHome.activateTeam(currentTeam.teamId);
      }
    },
  );

  const activeTeamSubscribe = activeTeamRxDoc.subscribe(
    async (value: TeamDocument) => {
      if (value) {
        currentTeam = {
          id: value.get("teamId"),
          name: value.get("name"),
          base64String: value.get("logo"),
        };
      }
    },
  );

  const activeSidbarTabSubscribe = activeSidebarTab.subscribe(
    async (value: ActiveSideBarTabDocument) => {
      if (value) {
        activeSidbarTabRxDoc = value;
        activeSidebarTabName = activeSidbarTabRxDoc.get("activeTabName");
      } else {
        await activeSideBarTabMethods.addActiveTab("workspaces");
      }
    },
  );

  const handleWorkspaceSwitch = (
    workspaceId: string,
    workspaceName: string,
    teamId: string,
    teamName: string,
    base64String: object,
  ) => {
    isWorkspaceLoaded.set(false);
    _viewModelWorkspace.activateWorkspace(workspaceId);
    isWorkspaceCreatedFirstTime.set(false);

    setCurrentWorkspace(workspaceId, workspaceName);
    isWorkspaceLoaded.set(true);
  };

  const handleWorkspaceTab = (
    workspaceId: string,
    workspaceName: string,
    workspaceDesc: string,
  ) => {
    isWorkspaceCreatedFirstTime.set(false);
    let totalCollection: number = 0;
    let totalRequest: number = 0;
    $workspaces.map((item) => {
      if (item) {
        if (item._data._id === workspaceId) {
          totalCollection = item?._data?.collections?.length;
        } else {
          totalRequest = 0;
        }
      }
    });

    let path: Path = {
      workspaceId: workspaceId,
      collectionId: "",
    };

    const sampleWorkspace = generateSampleWorkspace(
      workspaceId,
      new Date().toString(),
    );
    sampleWorkspace.id = workspaceId;
    sampleWorkspace.name = workspaceName;
    sampleWorkspace.description = workspaceDesc;
    sampleWorkspace.path = path;
    sampleWorkspace.property.workspace.requestCount = totalRequest;
    sampleWorkspace.property.workspace.collectionCount = totalCollection;
    sampleWorkspace.save = true;
    collectionsMethods.handleCreateTab(sampleWorkspace);
    collectionsMethods.handleActiveTab(sampleWorkspace.id);
    moveNavigation("right");
  };
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
        currentWorkspaceName,
      );
      workspace.path.workspaceId = currentWorkspaceId;
      collectionsMethods.handleCreateTab(workspace);
      collectionsMethods.handleActiveTab(currentWorkspaceId);
      moveNavigation("right");
    }
    return selectedActiveSideBar;
  }

  const getActiveTab = handleActiveTab();

  onMount(() => {
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });
  onDestroy(() => {
    userUnsubscribe();
    activeTeamSubscribe.unsubscribe();
    activeWorkspaceSubscribe.unsubscribe();
    activeSidbarTabSubscribe.unsubscribe();
  });
</script>

<div class="dashboard">
  <HeaderDashboard
    {currentWorkspace}
    {currentTeam}
    {collectionsMethods}
    {handleWorkspaceSwitch}
    {activeSideBarTabMethods}
    {teams}
  />
  <div class="dashboard-teams d-flex">
    {#if activeSidebarTabName}
      <Sidebar {activeSideBarTabMethods} {activeSidebarTabName} {workspaces} />
    {:else}
      <Sidebar
        {activeSideBarTabMethods}
        activeSidebarTabName="workspaces"
        {workspaces}
      />
    {/if}
    <section class="w-100">
      <Route path="/collections/*"><CollectionsHome /></Route>
      <Route path="/workspaces/*"
        ><Teams
          {currentTeam}
          data={workspaces}
          {handleWorkspaceSwitch}
          {handleWorkspaceTab}
          {activeSideBarTabMethods}
          {collectionsMethods}
        /></Route
      >
      <Route path="/mock/*"><Mock /></Route>
      <Route path="/environment/*"><Environment /></Route>
      <Route path="/help">Help</Route>
      <Route path="/*">
        {#if activeSidebarTabName}
          <Navigate to={activeSidebarTabName} />
        {:else}
          <Navigate to={"workspaces"} />
        {/if}
      </Route>
    </section>
  </div>
</div>
