<script lang="ts">
  import { ItemType } from "$lib/utils/enums/item-type.enum";
  import Helper from "./Helper.svelte";
  export let tabList;
  export let data: any;
  export let collectionList;

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
      {#if api.type === ItemType.REQUEST && !api.id.startsWith("UNTRACKED")}
        <Helper {api} {data} {collectionList} />
      {/if}
    {/each}
  {/if}

  {#if tabList.length === 0}
    <p>No Recent APIs present</p>
  {/if}
</section>

<style>
  .teams-heading {
    font-size: 14px;
    font-weight: 700;
    line-height: 21px;
  }
</style>
