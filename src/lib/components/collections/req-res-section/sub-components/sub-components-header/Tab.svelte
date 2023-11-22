<script lang="ts">
  import crossIcon from "$lib/assets/cross.svg";
  import { getMethodStyle } from "$lib/utils/helpers/conversion.helper";
  import type { NewTab } from "$lib/utils/interfaces/request.interface";
  export let tab: NewTab;
  export let updateCurrentTab: (id: string) => void;
  export let handleTabRemove: (id: string) => void;
  export let tabWidth: number;
  export let index: number;
</script>

<div
  class="d-inline-block position-relative pt-1"
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
      class="position-relative border-0"
      style="    width: 80%;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden; text-align: left; background-color:transparent;"
    >
      <span
        class="text-{getMethodStyle(tab.property.request.method)}"
        style="font-size: 12px; height: 31px; "
        >{tab.property.request.method || ""}</span
      >
      <!-- {#if workspaceId===currentTabId && !method}
      <img src={book} alt="book">
      {/if} -->
      <span
        class="text-muted font-weight-normal"
        style="font-size: 12px; font-family: Roboto; color: #8A9299;"
      >
        {tab.name}
      </span>
      {#if !tab.save}
        <span
          class="position-absolute"
          style="right:0; top:6px; height:4px; width:4px; background-color:#FF7878; border-radius: 50%;"
        />
      {/if}
    </button>

    <button
      class="btn border-0 d-flex align-items-center"
      on:click={() => {
        handleTabRemove(tab.id);
      }}
      style="overflow:hidden; height:31px;"
    >
      <img src={crossIcon} alt="cross" />
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
</style>
