<script lang="ts">
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";

  import WorkspaceContent from "./WorkspaceContent.svelte";
  import WorkspaceList from "../../lib/components/workspace/workspace-list/WorkspaceList.svelte";
  import { scaleMotionProps } from "$lib/utils/animations";
  import { Motion } from "svelte-motion";
  export let data: any;
  export let tabList: any;

  export let collectionsMethods: CollectionsMethods;
</script>

<Motion {...scaleMotionProps} let:motion>
  <div class="workspace bg-backgroundColor" use:motion>
    <WorkspaceList {data} />
    <WorkspaceContent {data} {collectionsMethods} />
  </div>
</Motion>

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
