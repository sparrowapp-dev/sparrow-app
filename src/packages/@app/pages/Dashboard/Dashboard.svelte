<script lang="ts">
  import Sidebar from "$lib/components/sidebar/Sidebar.svelte";
  import { Route } from "svelte-navigator";
  import Navigate from "../../routing/Navigate.svelte";
  import CollectionsPage from "../Collections/CollectionsPage.svelte";
  import { DashboardViewModel } from "./Dashboard.ViewModel.old";
  import { user } from "$lib/store";
  const _viewModel = new DashboardViewModel();
  const userUnsubscribe = user.subscribe(async (value) => {
    if (value) {
      await _viewModel.refreshTeams(value._id);
      await _viewModel.refreshWorkspaces(value._id);
      await _viewModel.refreshTeamsWorkspaces(value._id);
    }
  });
  userUnsubscribe();
  import Mock from "../Mock/Mock.svelte";
  import Environment from "../Environment/Environment.svelte";
</script>

<div class="dashboard vh-100">
  <!-- Application Header -->
  <div style="height: 44px;">Header</div>

  <!-- Application Content -->
  <div class="d-flex">
    <Sidebar />
    <section class="w-100">
      <!-- Route for Collections -->
      <Route path="/collections/*">
        <CollectionsPage />
      </Route>

      <!-- Route for Workspaces -->
      <Route path="/workspaces/*">workspace</Route>

      <!-- Route for Mock -->
      <Route path="/mock/*"><Mock /></Route>

      <!-- Route for Environment -->
      <Route path="/environment/*"><Environment /></Route>

      <!-- Route for Help -->
      <Route path="/help">Help</Route>

      <!-- Default Route: Navigate to workspaces -->
      <Route path="/*"><Navigate to="workspaces" /></Route>
    </section>
  </div>
</div>
