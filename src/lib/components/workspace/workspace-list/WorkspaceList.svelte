<script lang="ts">
  import RecentApi from "$lib/components/dashboard/recent-apis/RecentAPI.svelte";
  import RecentWorkspace from "$lib/components/dashboard/recent-workspace/RecentWorkspace.svelte";
  import Teams from "$lib/components/dashboard/teams/Teams.svelte";
  export let data: any;
  export let tabList;
  export let collectionList;
  export let teams;
  

</script>

<div
  style="border-right: 1px solid #313233; overflow-y: auto; overflow-x: hidden;"
  class="sidebar d-flex flex-column bg-backgroundColor p-3 pe-3"
>
  <Teams {teams} />
  <RecentApi {tabList} {data} {collectionList} />
  <hr />
  <RecentWorkspace {data} />
</div>

<style>
  .sidebar::-webkit-scrollbar {
    width: 2px;
  }
  .sidebar::-webkit-scrollbar-thumb {
    background: #888;
  }
  .sidebar {
    width: 282px;
    position: fixed;
    top: 44px;
    left: 69px;
    height: calc(100vh - 44px);
  }
</style>
