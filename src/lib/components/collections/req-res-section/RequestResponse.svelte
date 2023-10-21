<script>
 
  import TabBar from "./sub-components/sub-components-header/TabBar.svelte";
</script>

<div class="collection bg-backgroundColor">
  <TabBar />
</div>

<style>
  .collection {
    width: calc(100% - 280px);
    height: calc(100vh - 50px);
    overflow: auto;
  }
</style>
