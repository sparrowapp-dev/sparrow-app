<script lang="ts">
  import { getMethodStyle } from "@sparrow/common/utils/conversion.helper";
  import { folderIcon as folder } from "@sparrow/library/assets";
  import { ItemType, RequestMethod } from "@sparrow/common/enums";
  import { CollectionIcon, SocketIcon } from "@sparrow/library/icons";
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
      style="width: 40px;"
    >
      {method.toUpperCase()}
    </div>
    <div class="api-name sparrow-fs-12 fw-normal">
      <p class="ellipsis mb-0">{name}</p>
    </div>
  </div>
{:else if type === ItemType.FOLDER || type === ItemType.COLLECTION || type === ItemType.WEB_SOCKET}
  <div style="height:36px;" class="d-flex align-items-center">
    {#if type === ItemType.FOLDER}
      <div style="width: 40px;">
        <img src={folder} alt="" />
      </div>
    {:else if type === ItemType.COLLECTION}
      <div style="width: 40px;">
        <CollectionIcon
          height={"15px"}
          width={"15px"}
          color={"var(--icon-secondary-100)"}
        />
      </div>
    {:else if type === ItemType.WEB_SOCKET}
      <div style="width: 40px;">
        <SocketIcon
          height={"14px"}
          width={"18px"}
          color={"var(--icon-primary-300)"}
        />
      </div>
    {/if}
    <span
      class="ellipsis sparrow-fs-12 fw-normal ps-2"
      style="cursor:pointer; width: calc(100% - 20px);">{name}</span
    >
  </div>
{/if}

<style>
  .api-name {
    width: calc(100% - 70px);
  }
</style>
