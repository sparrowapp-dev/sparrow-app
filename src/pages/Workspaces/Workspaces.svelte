<script lang="ts">
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";

  import WorkspaceContent from "./WorkspaceContent.svelte";
  import WorkspaceList from "./workspace-list/WorkspaceList.svelte";
  export let data: any;
  export let tabList: any;

  export let collectionsMethods: CollectionsMethods;
</script>

<div class="workspace bg-backgroundColor">
  <WorkspaceList {data} />
  <WorkspaceContent {data} {collectionsMethods} />
</div>

<style>
  .workspace {
    font-size: 12px;
    top: 44px;
    left: 352px;
    width: calc(100% - 352px);
    position: fixed;
    height: calc(100% - 44px);
    overflow: auto;
  }
</style>
