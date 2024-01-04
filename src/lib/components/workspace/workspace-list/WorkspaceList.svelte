<script lang="ts">
  import RecentApi from "$lib/components/dashboard/recent-apis/RecentAPI.svelte";
  import RecentWorkspace from "$lib/components/dashboard/recent-workspace/RecentWorkspace.svelte";
  export let data: any;
  export let tabList;
  export let collectionList;
</script>

<div
  style="border-right: 1px solid #313233; overflow: auto;"
  class="sidebar d-flex flex-column bg-backgroundColor p-3 pe-5"
>
  <RecentApi {tabList} {data} {collectionList} />
  <hr />
  <RecentWorkspace {data} />
</div>

<style>
  .sidebar {
    width: 282px;
    position: fixed;
    top: 44px;
    left: 69px;
    height: calc(100vh - 44px);
  }
</style>
