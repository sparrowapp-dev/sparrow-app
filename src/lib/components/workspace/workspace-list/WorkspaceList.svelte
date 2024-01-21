<script lang="ts">
  import RecentApi from "$lib/components/dashboard/recent-apis/RecentAPI.svelte";
  import RecentWorkspace from "$lib/components/dashboard/recent-workspace/RecentWorkspace.svelte";
  import TeamsList from "$lib/components/dashboard/teams/TeamsList.svelte";
  export let data: any;
  export let tabList: any;
  export let collectionList: any;
  export let teams: any;
  export let handleWorkspaceSwitch: any;
  export let handleCreateTeamModal: any;
  export let handleWorkspaceTab: any;
  export let activeSideBarTabMethods: any;
  export let collectionsMethods: any;
</script>

<div
  style="border-right: 1px solid #313233; overflow-y: auto; overflow-x: hidden;"
  class="sidebar sparrow-thin-scrollbar d-flex flex-column bg-backgroundColor p-sm-1 p-md-2 p-lg-3 p-3 pe-3"
>
  <TeamsList {handleCreateTeamModal} {teams} />
  <RecentApi
    {tabList}
    {data}
    {collectionList}
    {collectionsMethods}
    {activeSideBarTabMethods}
  />
  <hr />
  <RecentWorkspace
    {data}
    {handleWorkspaceSwitch}
    {handleWorkspaceTab}
    {activeSideBarTabMethods}
  />
</div>

<style>
  .sidebar {
    width: 21vw;
    position: fixed;
    top: 44px;
    left: 69px;
    height: calc(100vh - 44px);
  }

  @media only screen and (max-width: 900px) {
    .sidebar {
      width: 31vw;
    }
  }
</style>
