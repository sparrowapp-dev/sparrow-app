<script lang="ts">
  import type { WorkspaceMethods } from "$lib/utils/interfaces/workspace.interface";

  import WorkspaceContent from "../../lib/components/workspace/WorkspaceContent.svelte";
  import WorkspaceList from "../../lib/components/workspace/workspace-list/WorkspaceList.svelte";
  import { WorkspaceViewModel } from "./workspace.viewModel";

  export let data: any;

  const _viewModel = new WorkspaceViewModel();

  const workspaceMethods: WorkspaceMethods = {
    handleCreateTab: _viewModel.handleCreateTab,
  };

  const tabList = _viewModel.tabs;
  const collectionList = _viewModel.collection;
</script>

<div class="workspace bg-backgroundColor">
  <WorkspaceList {data} tabList={$tabList} collectionList={$collectionList} />
  <WorkspaceContent {data} {workspaceMethods} />
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
