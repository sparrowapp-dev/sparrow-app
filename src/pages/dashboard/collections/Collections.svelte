<script>
  import CollectionSidebar from "./collection-sidebar/CollectionSidebar.svelte";
  import TabBar from "./TabBar.svelte";
</script>

<div class="collection d-flex bg-backgroundColor">
  <CollectionSidebar />
  <TabBar />
</div>

<style>
  .collection {
    width: calc(100%);
  }
</style>
