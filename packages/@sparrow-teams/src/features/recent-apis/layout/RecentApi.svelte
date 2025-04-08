<script>
  import ApiListItem from "../../../components/api-list-items/ApiListItem.svelte";
  import { ItemType } from "@sparrow/common/enums/item-type.enum";
  import { List } from "@sparrow/library/ui";
  import { onMount } from "svelte";

  export let tabList = [];
  export let collectionList;
  export let data;
  export let onApiClick;

  // Helper to filter, sort by time, and get the top 5 APIs

  $: filteredApis = tabList
    ?.filter((tab) =>
      [
        ItemType.REQUEST,
        ItemType.WEB_SOCKET,
        ItemType.SOCKET_IO,
        ItemType.GRAPHQL,
      ].includes(tab.type),
    )
    ?.sort((a, b) => new Date(b.time) - new Date(a.time)) // Sort descending by time
    ?.slice(0, 5)
    ?.reverse();
</script>

<div class="d-flex justify-content-between pb-0" style="gap:8px; ">
  <h6
    class="teams-heading text-ds-font-size-14 text-ds-line-height-143 text-ds-font-weight-regular"
  >
    Recent APIs
  </h6>
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
<hr
  class=" pb-0"
  style="margin-left: 10px; margin-top:12px; margin-bottom:12px;"
/>

<style>
  .sidebar-recentapi-list::-webkit-scrollbar-thumb {
    background-color: var(--bg-secondary-330);
  }

  .sidebar-recentapi-list::-webkit-scrollbar-button {
    color: var(--bg-secondary-330);
  }
  .teams-heading {
    margin-bottom: 0;
    padding: 6px;
    padding-left: 15px;
    color: var(--text-ds-neutral-300);
  }

  .not-found-text {
    color: var(--request-arc);
    font-size: 12px;
  }
</style>
