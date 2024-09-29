<script lang="ts">
  import { getMethodStyle } from "@sparrow/common/utils";
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
  class="d-flex flex-start helper-container py-1 px-3 rounded mb-2"
  style=" overflow: auto;"
  on:click={() => handleApiClick(api)}
>
  <div class="api-type">
    <span
      class={`text-fs-12 me-3 fw-bold text-${getMethodStyle(
        api?.property?.request?.method,
      )}`}>{api?.property?.request?.method}</span
    >
  </div>
  <div class="api-desc" style="font-size: 12px;">
    <p class="mb-0 api-type__title text-whiteColor">{api.name}</p>
    <div class="d-flex">
      {#if $data}
        {#each $data.slice().reverse() as list}
          {#if list}
            {#if list?._id === api?.path?.workspaceId}
              <p
                class="mb-0 api-type__endpoint fw-bold"
                style="color:var(--text-secondary-550);"
              >
                {list.team.teamName}/{list.name}
              </p>
            {/if}
          {/if}
        {/each}
      {/if}
      <!-- <p class="mb-0 api-type__endpoint">:</p> -->

      {#if api?.path?.collectionId}
        <p class="mb-0 api-type__endpoint">/</p>
      {/if}

      {#if collectionList}
        {#each collectionList.slice().reverse() as list}
          {#if list}
            {#if list?.id === api?.path?.collectionId}
              <p
                class="mb-0 api-type__endpoint fw-bold"
                style="color:var(--text-secondary-550);"
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
                      class="mb-0 api-type__endpoint fw-bold"
                      style="color:var(--text-secondary-550);"
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
  .helper-container:hover,
  .helper-container:hover .api-type {
    background-color: var(--bg-tertiary-750);
    cursor: pointer;
  }

  .helper-container:active,
  .helper-container:active .api-type {
    background-color: var(--bg-secondary-320);
    cursor: pointer;
  }

  .api-type {
    display: flex;
    height: 34px;
    width: 56px;
    margin-right: 5px;
    font-size: 12px;
  }
  .api-type span {
    font-weight: 500;
  }
  .api-desc {
    width: calc(100% - 61px);
  }
  .api-type__title {
    font-size: 12px;
    font-weight: 400;
  }
  .api-type__endpoint {
    font-family: Roboto Mono;
    font-size: 12px;
    font-weight: 400;
    /* color: var(--recentApiText); */
  }
  .api-type__title,
  .api-type__endpoint {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
