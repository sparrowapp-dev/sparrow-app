<script>
  import CollectionsList from "$lib/components/collections/collections-list/CollectionList.svelte";
  import RequestResponse from "$lib/components/collections/req-res-section/RequestResponse.svelte";
  import SidebarRight from "$lib/components/collections/req-res-section/SidebarRight.svelte";

  //   const collectionsList = [];
  //   const selectedApi = {};

  //   const onApiSelected = () => {
  //     // change selectedApi
  //   };
</script>

<div class="d-flex">
  <CollectionsList />
  <SidebarRight />
  <RequestResponse />
  <!-- we should add req-res folder -->
</div>

<style>
</style>
