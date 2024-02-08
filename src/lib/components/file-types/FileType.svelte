<script lang="ts">
  import { getMethodStyle } from "$lib/utils/helpers/conversion.helper";
  import folder from "$lib/assets/folder.svg";
  import collection from "$lib/assets/collection.svg";
  import { ItemType, RequestMethod } from "$lib/utils/enums";
  export let type: ItemType = ItemType.REQUEST;
  export let name = "";
  export let method: RequestMethod = RequestMethod.GET;
</script>

{#if type === ItemType.REQUEST}
  <div class="d-flex align-items-center" style="height:32px;">
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
    <img
      src={type === ItemType.FOLDER
        ? folder
        : type === ItemType.COLLECTION
        ? collection
        : null}
      alt=""
      style="height:16px; width:16px;"
    />
    <span class="ellipsis sparrow-fs-12 fw-normal ps-2" style="cursor:pointer;"
      >{name}</span
    >
  </div>
{/if}

<style>
  .api-name {
    width: calc(100% - 70px);
  }
</style>
