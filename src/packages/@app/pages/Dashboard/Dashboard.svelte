<script lang="ts">
  import { Sidebar } from "@common/components";
  import { Route } from "svelte-navigator";
  import Navigate from "../../routing/Navigate.svelte";
  import CollectionsPage from "../Collections/CollectionsPage.svelte";
  import { DashboardViewModel } from "./Dashboard.ViewModel.old";
  import { user } from "$lib/store";
  import Mock from "../Mock/Mock.svelte";
  import Environment from "../EnvironmentPage/EnvironmentPage.svelte";
  import Header from "@common/components/header/Header.svelte";
  import { onDestroy } from "svelte";
  import type {
    EnvironmentDocument,
    WorkspaceDocument,
  } from "$lib/database/app.database";
  import type { Observable } from "rxjs";
  const _viewModel = new DashboardViewModel();
  const userUnsubscribe = user.subscribe(async (value) => {
    if (value) {
      // await _viewModel.refreshTeams(value._id);
      // await _viewModel.refreshWorkspaces(value._id);
      await _viewModel.refreshTeamsWorkspaces(value._id);
    }
  });
  const refreshEnv = _viewModel.refreshEnvironment;
  const environments = _viewModel.environments;
  const activeWorkspace = _viewModel.getActiveWorkspace();

  let currentEnvironment = {
    id: "none",
  };

  let currentWorkspaceId = "";
  const activeWorkspaceSubscribe = activeWorkspace.subscribe(
    async (value: WorkspaceDocument) => {
      const activeWorkspaceRxDoc = value;
      currentWorkspaceId = activeWorkspaceRxDoc._id;
      if (activeWorkspaceRxDoc) {
        refreshEnv(activeWorkspaceRxDoc?._id);
        const envIdInitiatedToWorkspace =
          activeWorkspaceRxDoc.get("environmentId");
        if (envIdInitiatedToWorkspace) {
          currentEnvironment = {
            id: envIdInitiatedToWorkspace,
          };
        } else {
          currentEnvironment = {
            id: "none",
          };
        }
      }
    },
  );

  onDestroy(() => {
    userUnsubscribe();
    activeWorkspaceSubscribe.unsubscribe();
  });
</script>

<div class="dashboard vh-100">
  <!-- Application Header -->
  <!-- <div style="height: 44px;">Header</div> -->
  <Header
    environments={$environments?.filter((element) => {
      return element?.workspaceId === currentWorkspaceId;
    }) || []}
    {currentEnvironment}
    onInitActiveEnvironmentToWorkspace={_viewModel.initActiveEnvironmentToWorkspace}
    {currentWorkspaceId}
  />

  <!-- Application Content -->
  <div class="d-flex">
    <Sidebar />
    <section class="w-100">
      <!-- Route for Collections -->
      <Route path="/collections/*">
        <CollectionsPage />
      </Route>

      <!-- Route for Workspaces -->
      <!-- <Route path="/workspaces/*"><Collections /></Route> -->

      <!-- Route for Mock -->
      <Route path="/mock/*"><Mock /></Route>

      <!-- Route for Environment -->
      <Route path="/environment/*"><Environment /></Route>

      <!-- Route for Help -->
      <Route path="/help/*">Help</Route>

      <!-- Route for More -->
      <Route path="/more/*">More</Route>

      <!-- Route for Setting -->
      <Route path="/setting/*">Setting</Route>

      <!-- Route for Profile -->
      <Route path="/profile/*">Profile</Route>

      <!-- Default Route: Navigate to workspaces -->
      <Route path="/*"><Navigate to="collections" /></Route>
    </section>
  </div>
</div>
