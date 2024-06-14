<script lang="ts">
  import { getMethodStyle } from "$lib/utils/helpers/conversion.helper";
  import folder from "$lib/assets/folder.svg";
  import collection from "$lib/assets/collection.svg";
  import { ItemType, RequestMethod } from "$lib/utils/enums";
  import { CollectionIcon } from "@library/icons";
  export let type: ItemType = ItemType.REQUEST;
  export let name = "";
  export let method = RequestMethod.GET;
</script>

{#if type === ItemType.REQUEST}
  <div class="d-flex align-items-center" style="height:calc(32px);">
    <div
      class="api-method text-start sparrow-fs-12 fw-normal me-2 text-{getMethodStyle(
        method,
      )}"
    >
      {method.toUpperCase()}
    </div>
    <div class="api-name sparrow-fs-12 fw-normal">
      <p class="ellipsis mb-0">{name}</p>
    </div>
  </div>
{:else if type === ItemType.FOLDER || type === ItemType.COLLECTION}
  <div style="height:36px;" class="d-flex align-items-center">
    {#if type === ItemType.FOLDER}
      <img src={folder} alt="" />
    {:else if type === ItemType.COLLECTION}
      <CollectionIcon
        height={"15px"}
        width={"15px"}
        color={"var(--icon-secondary-100)"}
      />
    {/if}
    <span
      class="ellipsis sparrow-fs-12 fw-normal ps-3"
      style="cursor:pointer; width: calc(100% - 20px);">{name}</span
    >
  </div>
{/if}

<style>
  .api-name {
    width: calc(100% - 70px);
  }
</style>
