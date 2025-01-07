<script lang="ts">
  import { Route } from "svelte-navigator";
  import Navigate from "../../routing/Navigate.svelte";

  import Teams from "../Teams/Teams.svelte";
</script>

<div class="dashboard d-flex flex-column" style="height: 100vh;">
  <!-- 
    -- Top Header having app icon and name
  -->
  <!-- <Header
    environments={$environments?.filter((element) => {
      return element?.workspaceId === currentWorkspaceId;
    }) || []}
    {currentEnvironment}
    onInitActiveEnvironmentToWorkspace={_viewModel.initActiveEnvironmentToWorkspace}
    {currentWorkspaceId}
    {currentWorkspaceName}
    {currentTeamName}
    {currentTeamId}
    {isGuestUser}
    {isLoginBannerActive}
    onLoginUser={handleGuestLogin}
    workspaceDocuments={$workspaceDocuments}
    teamDocuments={$teamDocuments}
    onCreateWorkspace={() => (isWorkspaceModalOpen = true)}
    onSwitchWorkspace={_viewModel.handleSwitchWorkspace}
    onSwitchTeam={_viewModel.handleSwitchTeam}
    {user}
    onLogout={_viewModel.handleLogout}
    isWebApp={true}
    bind:isCreateTeamModalOpen
  /> -->

  <!-- 
    -- Application includes collection, environment and help page.
   -->
  <div class="d-flex" style="flex:1; overflow:hidden;">
    <!-- 
      --Sidebar to naviagte between collection, environment and help page.
    -->
    <!-- <Sidebar {user} onLogout={_viewModel.handleLogout} type="web" /> -->
    <!-- 
      -- Dashboard renders any of the pages between collection, environment and help.
    -->
    <section style="flex:1; overflow:auto;">
      <!-- Route for Collections -->
      <!-- <Route path="/collections/*">
        <CollectionsPage />
      </Route> -->
      <!-- Route for Team and workspaces - Home Tab -->
      <Route path="/home/*"><Teams /></Route>

      <!-- Default Route: Navigate to collections -->
      <Route path="/*"><Navigate to="home" /></Route>
    </section>
  </div>
</div>
