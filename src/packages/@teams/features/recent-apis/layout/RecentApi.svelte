<script>
  import ApiListItem from "@teams/common/components/api-list-items/ApiListItem.svelte";
  import { ItemType } from "$lib/utils/enums/item-type.enum";
  import List from "@library/ui/list/List.svelte";
  import constants from "$lib/utils/constants";
  export let tabList = [];
  export let collectionList;
  export let collectionsMethods;
  export let data;
  export let onApiClick;
</script>

<section>
  <div class="d-flex justify-content-between p-3 pb-0">
    <h6 class="teams-heading ms-2">Recent APIs</h6>
  </div>

  <div class="sidebar-recentapi-list"
  style="overflow-y: auto;">
    {#if tabList?.slice()?.reverse()?.length}
      <List height={"calc((100vh - 230px) / 3)"} classProps={"px-2 py-0"}>
        {#each tabList.slice().reverse() as api, index}
          {#if api.type === ItemType.REQUEST && !api.id.startsWith("UNTRACKED") && index < constants.API_LIMIT}
            <ApiListItem
              {api}
              {data}
              {collectionsMethods}
              {onApiClick}
              {collectionList}
            />
          {/if}
        {/each}
      </List>
    {/if}

    {#if !tabList.find((api) => api.type === ItemType.REQUEST && !api.id.startsWith("UNTRACKED"))}
      <p class="not-found-text px-2 ms-3">Recently opened APIs show up here.</p>
    {/if}
  </div>
</section>

<style>
  .sidebar-recentapi-list {
    max-height: 30vh;
  }

  .sidebar {
    height: calc(100vh - 44px);
  }
  .teams-heading {
    margin-left: 5px;
    font-size: 14px;
    font-weight: 700;
    line-height: 21px;
  }
  
  .new-team-btn {
    background-color: transparent;
  }
  .new-team-btn:hover {
    background-color: var(--border-color);
  }
  .new-team-btn > img:hover {
    filter: invert(86%) sepia(37%) saturate(4292%) hue-rotate(180deg)
      brightness(101%) contrast(100%);
  }
 
  .sidebar-teams-list {
    max-height: 30vh;
  }

  .sidebar-recentapi-list {
    max-height: 30vh;
  }

  .sidebar-recentapi-list::-webkit-scrollbar {
    width: 11px;
    display: none; /* Hide scrollbar for WebKit browsers (Safari, Chrome) */
  }

  .not-found-text {
    color: var(--request-arc);
    font-size: 12px;
  }
</style>
