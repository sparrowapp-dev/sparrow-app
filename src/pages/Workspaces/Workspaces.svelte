<script lang="ts">
  import WorkspaceContent from "./WorkspaceContent.svelte";
  import WorkspaceList from "./workspace-list/WorkspaceList.svelte";
  export let data: any;
  console.log($data);
</script>

<div class="workspace bg-backgroundColor">
  <WorkspaceList {data} />
  <WorkspaceContent {data} />
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
