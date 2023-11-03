<script lang="ts">
  import TabBar from "./sub-components/sub-components-header/TabBar.svelte";
  import { collapsibleState } from "$lib/store/request-response-section";
  let isCollaps: boolean;
  collapsibleState.subscribe((value) => {
    isCollaps = value;
  });
</script>

<div
  class="collection bg-backgroundColor"
  style="left:{isCollaps ? '72px' : '352px'}"
>
  <TabBar />
</div>

<style>
  .collection {
    top: 44px;
    position: fixed;
    right: 0;
    width: calc(100%-352px);
    height: calc(100vh - 44px);
  }
</style>
