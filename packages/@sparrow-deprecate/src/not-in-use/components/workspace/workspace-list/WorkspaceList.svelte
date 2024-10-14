<script lang="ts">
  import RecentApi from "@deprecate/components/dashboard/recent-apis/RecentAPI.svelte";
  import RecentWorkspace from "@deprecate/components/dashboard/recent-workspace/RecentWorkspace.svelte";
  import TeamsList from "@deprecate/components/dashboard/teams/TeamsList.svelte";
  import type {
    TeamRepositoryMethods,
    TeamServiceMethods,
  } from "@deprecate/utils/interfaces";
  export let data: any;
  export let tabList: any;
  export let collectionList: any;
  export let teams: any;
  export let handleWorkspaceSwitch: any;
  export let handleCreateTeamModal: any;
  export let handleWorkspaceTab: any;
  export let activeSideBarTabMethods: any;
  export let collectionsMethods: any;
  export let teamRepositoryMethods: TeamRepositoryMethods;
  export let teamServiceMethods: TeamServiceMethods;
  export let userId;
  export let openTeam;
</script>

<div
  style="border-right: 1px solid var(--border-color);"
  class="sidebar sparrow-thin-scrollbar d-flex flex-column bg-backgroundColor"
>
  <TeamsList
    {userId}
    {handleCreateTeamModal}
    {teams}
    {teamRepositoryMethods}
    {teamServiceMethods}
    {openTeam}
  />
  <RecentApi
    {tabList}
    {data}
    {collectionList}
    {collectionsMethods}
    {activeSideBarTabMethods}
  />
  <hr class="mb-0 pb-0" />
  <RecentWorkspace
    {data}
    {openTeam}
    {handleWorkspaceSwitch}
    {handleWorkspaceTab}
    {activeSideBarTabMethods}
  />
</div>

<style>
  .sidebar {
    height: calc(100vh - 44px);
  }
</style>
