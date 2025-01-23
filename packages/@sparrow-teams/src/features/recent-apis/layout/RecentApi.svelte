<script>
  import ApiListItem from "../../../components/api-list-items/ApiListItem.svelte";
  import { ItemType } from "@sparrow/common/enums/item-type.enum";
  import { List } from "@sparrow/library/ui";

  export let tabList = [];
  export let collectionList;
  export let data;
  export let onApiClick;

  // Helper to filter, sort by time, and get the top 5 APIs
  $: filteredApis = tabList
    ?.filter((tab) => tab.type === ItemType.REQUEST)
    ?.sort((a, b) => new Date(b.time) - new Date(a.time)) // Sort descending by time
    ?.slice(0, 5)
    ?.reverse(); // Get only the top 5
</script>

<div class="d-flex justify-content-between p-3 pb-0">
  <h6 class="teams-heading ms-2">Recent APIs</h6>
</div>

<div class="sidebar-recentapi-list" style="flex:1; overflow: auto;">
  {#if filteredApis?.length}
    <List height={"100%"} overflowY={"auto"} classProps={"px-2 py-0"}>
      {#each filteredApis as api, index}
        <ApiListItem {api} {data} {onApiClick} {collectionList} />
      {/each}
    </List>
  {:else}
    <p class="not-found-text px-2 ms-3">Recently opened APIs show up here.</p>
  {/if}
</div>
<hr class="mb-0 pb-0" />

<style>
  .sidebar-recentapi-list::-webkit-scrollbar-thumb {
    background-color: var(--bg-secondary-330);
  }

  .sidebar-recentapi-list::-webkit-scrollbar-button {
    color: var(--bg-secondary-330);
  }
  .teams-heading {
    margin-left: 5px;
    font-size: 14px;
    font-weight: 700;
    line-height: 21px;
  }

  .not-found-text {
    color: var(--request-arc);
    font-size: 12px;
  }
</style>
