<script lang="ts">
  import Crossicon from "$lib/assets/crossicon.svelte";
  import { ItemType } from "$lib/utils/enums/item-type.enum";
  import { getMethodStyle } from "$lib/utils/helpers/conversion.helper";
  import type { NewTab } from "$lib/utils/interfaces/request.interface";
  import collectionAsset from "$lib/assets/collection-nodes.svg";
  import folderTab from "$lib/assets/folder-tab.svg";

  import BookIcon from "$lib/assets/book.svelte";
  export let tab: NewTab;
  export let updateCurrentTab: (id: string) => void;
  export let tabWidth: number;
  export let index: number;
  export let closeTab;
  export let handleDropOnStart: (index: number) => void;
  export let handleDropOnEnd: (index: number) => void;
</script>

<div
  draggable={true}
  on:drop={() => {
    handleDropOnEnd(index);
  }}
  on:dragstart={() => {
    handleDropOnStart(index);
  }}
  class="d-inline-block position-relative pt-1 individual-tab"
  style="width: {tabWidth}px; height:35px; margin-left:{index === 0
    ? '10px'
    : ''}"
>
  <div
    class="w-100 d-flex justify-content-between ps-2 border-upper-radius"
    style="margin-left: -3px; background-color: {tab.isActive
      ? 'var(--background-color)'
      : 'transparent'}"
  >
    <button
      on:click={() => {
        updateCurrentTab(tab.id);
      }}
      class="position-relative border-0 ellipsis"
      style="    width: 80%;
       text-align: left; background-color:transparent;"
    >
      {#if tab.type === ItemType.REQUEST}
        <span
          class="text-{getMethodStyle(tab.property.request.method)}"
          style="font-size: 10px; height: 31px; "
          >{tab.property.request.method || ""}</span
        >
      {:else if tab.type === ItemType.FOLDER}
        <span>
          <img
            src={folderTab}
            alt="folder-tab"
            style="width: 32px;heigh:25px;margin-right:5px;"
          /></span
        >
      {:else if tab.type === ItemType.COLLECTION}
        <span>
          <img
            src={collectionAsset}
            alt="book"
            style="width: 19px;heigh:19px;margin-right:5px;"
          />
        </span>
      {:else if tab.type === ItemType.WORKSPACE}
        <span>
          <BookIcon />
        </span>
      {/if}
      <span
        class="font-weight-normal"
        style={`font-size: 12px; font-family: Roboto; color: ${
          tab.isActive ? "#fff;" : "#8A9299;"
        }`}
      >
        {tab.name}
      </span>
      {#if tab?.property?.request && (!tab?.property?.request?.save?.api || !tab?.property?.request?.save?.description)}
        <span
          class="position-absolute"
          style="right:0; top:6px; height:4px; width:4px; background-color:#FF7878; border-radius: 50%;"
        />
      {/if}
    </button>

    <button
      class="{tab.isActive
        ? 'active-close-btn'
        : 'inactive-close-btn'} btn border-0 d-flex align-items-center"
      on:click={() => {
        closeTab(tab.id, tab);
      }}
      style="overflow:hidden; height:31px;"
    >
      <Crossicon color={tab.isActive ? "#fff" : "#8A9299"} />
    </button>
  </div>
  {#if !tab.isActive}
    <div
      class="position-absolute"
      style="height:23px; width: 0.5px; background-color: grey; top:7px; right: 0;"
    />
  {/if}
</div>

<style>
  .border-upper-radius {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    overflow: hidden;
  }
  .individual-tab:hover .inactive-close-btn {
    opacity: 1 !important;
  }
  .inactive-close-btn {
    opacity: 0 !important;
  }
</style>
