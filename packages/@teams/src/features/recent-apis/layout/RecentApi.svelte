<script>
  import ApiListItem from "../../../common/components/api-list-items/ApiListItem.svelte";
  import { ItemType } from "@deprecate/utils/enums/item-type.enum";
  import { List } from "@sparrow/library/ui";
  import constants from "@app/constants/constants";
  export let tabList = [];
  export let collectionList;
  export let data;
  export let onApiClick;
</script>

<!-- <section class="d-flex flex-columh-100"> -->
<div class="d-flex justify-content-between p-3 pb-0">
  <h6 class="teams-heading ms-2">Recent APIs</h6>
</div>

<div class="sidebar-recentapi-list" style="flex:1; overflow: auto;">
  {#if tabList?.filter((tab) => {
    if (tab.type === ItemType.REQUEST) {
      return true;
    } else {
      return false;
    }
  })?.length}
    <List height={"100%"} overflowY={"auto"} classProps={"px-2 py-0"}>
      {#each tabList?.filter((tab) => {
        if (tab.type === ItemType.REQUEST) {
          return true;
        } else {
          return false;
        }
      }) as api, index}
        <ApiListItem {api} {data} {onApiClick} {collectionList} />
      {/each}
    </List>
  {:else}
    <p class="not-found-text px-2 ms-3">Recently opened APIs show up here.</p>
  {/if}
</div>
<hr class="mb-0 pb-0" />

<!-- </section> -->

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
