<script lang="ts">
  import { TabTypeEnum } from "@sparrow/common/types/workspace/tab";
  import { getMethodStyle } from "@sparrow/common/utils";
  import { GraphIcon, SocketIcon, SocketIoIcon } from "@sparrow/library/icons";
  import { onMount } from "svelte";
  export let api: any;
  export let data: any;
  export let collectionList;
  export let onApiClick;

  const handleApiClick = (api) => {
    onApiClick(api);
  };
</script>

<div
  tabindex="0"
  class="d-flex flex-start helper-container py-1 px-3 rounded mb-2"
  style=" overflow: auto; gap:4px; height:48px;"
  on:click={() => handleApiClick(api)}
>
  <div
    class="d-flex"
    style="  align-items:flex-start; margin-top:3px; height:24px; width:30px; justify-content:center;"
  >
    {#if api?.type === "REQUEST"}
      <span
        class={`text-${getMethodStyle(api?.property?.request?.method)} text-ds-font-size-12 text-ds-line-height-150 text-ds-font-weight-Semi-bold`}
        style=" font-size: 9px; align-items:flex-start;"
      >
        <!-- {api?.property?.request?.method} -->
        {api?.property?.request?.method?.toUpperCase() === "DELETE"
          ? "DEL"
          : api?.property?.request?.method?.toUpperCase()}
      </span>
    {:else if api?.type === TabTypeEnum.WEB_SOCKET}
      <span style="display: flex; align-items:flex-start;">
        <SocketIcon
          height={"12px"}
          width={"16px"}
          color={"var(--bg-ds-primary-400)"}
        />
      </span>
    {:else if api?.type === TabTypeEnum.SOCKET_IO}
      <span style="display: flex; align-items:flex-start;">
        <SocketIoIcon
          height={"13px"}
          width={"13px"}
          color={"var(--icon-ds-success-300)"}
        />
      </span>
    {:else if api?.type === TabTypeEnum.GRAPHQL}
      <span style="display: flex; align-items:flex-start;">
        <GraphIcon
          height={"14px"}
          width={"14px"}
          color={"var(--icon-ds-accent-400)"}
        />
      </span>
    {/if}
  </div>
  <div class="api-desc">
    <p
      class="mb-0 api-type__title text-var(--text-ds-neutral-50) text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-Medium"
    >
      {api.name}
    </p>
    <div class="d-flex">
      {#if $data}
        {#each $data.slice().reverse() as list}
          {#if list}
            {#if list?._id === api?.path?.workspaceId}
              <p
                class="mb-0 api-type__endpoint text-ds-font-size-12 text-ds-line-height-150 text-ds-font-weight-Regular"
                style="color:var(--text-ds-neutral-200); "
              >
                {list.team.teamName} / {list.name}
              </p>
            {/if}
          {/if}
        {/each}
      {/if}
      <!-- <p class="mb-0 api-type__endpoint">:</p> -->

      {#if api?.path?.collectionId}
        <p
          class="mb-0 api-type__endpoint text-ds-font-size-12 text-ds-line-height-150 text-ds-font-weight-Regular"
          style="width: 8px;"
        >
          {"/ "}
        </p>
      {/if}

      {#if collectionList}
        {#each collectionList.slice().reverse() as list}
          {#if list}
            {#if list?.id === api?.path?.collectionId}
              <p
                class="mb-0 api-type__endpoint text-ds-font-size-12 text-ds-line-height-150 text-ds-font-weight-Regular"
                style="color:var(--text-ds-neutral-200);"
              >
                {list.name}
              </p>
              {#if api.path.folderId}
                <p class="mb-0 api-type__endpoint"></p>
              {/if}

              {#each list.items as item}
                {#if list.items && item}
                  {#if item.id === api.path.folderId}
                    <p
                      class="mb-0 api-type__endpoint text-ds-font-size-12 text-ds-line-height-150 text-ds-font-weight-Regular"
                      style="color:var(--text-ds-neutral-200); font-weight:400;"
                    >
                      {item.name}
                    </p>
                  {/if}
                {/if}
              {/each}
            {/if}
          {/if}
        {/each}
      {/if}
    </div>
  </div>
</div>

<style>
  .helper-container,
  .helper-container,
  .api-type {
    border: 2px solid transparent;
    border-radius: 4px;
  }
  .helper-container:hover,
  .helper-container:hover .api-type {
    background-color: var(--bg-ds-surface-400);
    cursor: pointer;
    border: 2px solid transparent;
  }

  .helper-container:active,
  .helper-container:active .api-type {
    background-color: var(--bg-ds-surface-500);
    cursor: pointer;
  }
  .helper-container:focus-visible,
  .helper-container:focus-visible {
    outline: none;
    border: 2px solid var(--bg-ds-primary-300);
    background-color: var(--bg-ds-surface-400);
  }

  .helper-container:active .api-type {
    display: flex;
    height: 34px;
    width: 56px;
    margin-right: 5px;
    font-size: 12px;
    color: var(--bg-ds-surface-200) !important;
  }
  .api-type span {
    font-weight: 500;
  }
  .api-desc {
    width: calc(100% - 61px);
  }
  .api-type__title {
    color: var(--text-ds-neutral-50);
  }
  .api-type__endpoint {
    /* font-family: Roboto Mono; */

    /* color: var(--recentApiText); */
  }
  .api-type__title,
  .api-type__endpoint {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
