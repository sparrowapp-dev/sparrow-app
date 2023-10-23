<script>
  import TabBar from "./sub-components/sub-components-header/TabBar.svelte";
  import { collapsibleState } from "$lib/store/requestSection";
  let isCollaps;
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
    top: 50px;
    position: fixed;
    right: 32px;
    width: calc(100%-352px);
    height: 93vh;
  }
</style>
