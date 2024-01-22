<script lang="ts">
  import constants from "$lib/utils/constants";
  import { ItemType } from "$lib/utils/enums/item-type.enum";
  import Helper from "./Helper.svelte";
  export let tabList;
  export let data: any;
  export let collectionList;
  export let collectionsMethods: any = undefined,
    activeSideBarTabMethods: any;

  let requestCount: number = 0;
  tabList.map((item) => {
    if (item.type === ItemType.REQUEST && !item.id.startsWith("UNTRACKED")) {
      requestCount++;
    }
  });
</script>

<section>
  <h6 class="teams-heading">Recent APIs</h6>
  {#if tabList}
    {#each tabList.slice().reverse() as api, index}
      {#if api.type === ItemType.REQUEST && !api.id.startsWith("UNTRACKED") && index < constants.API_LIMIT}
        <Helper
          {api}
          {data}
          {collectionList}
          {collectionsMethods}
          {activeSideBarTabMethods}
        />
      {/if}
    {/each}
  {/if}

  {#if !tabList.find((api) => api.type === ItemType.REQUEST && !api.id.startsWith("UNTRACKED"))}
    <p class="not-found-text pt-1">Recently opened APIs show up here.</p>
  {/if}
</section>

<style>
  .teams-heading {
    font-size: 14px;
    font-weight: 700;
    line-height: 21px;
  }
  .not-found-text {
    color: var(--request-arc);
    font-size: 12px;
  }
</style>
