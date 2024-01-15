<script lang="ts">
  import { generateSampleRequest } from "$lib/utils/sample/request.sample";
  import { setBodyType } from "$lib/utils/helpers/auth.helper";
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import { navigate } from "svelte-navigator";
  export let api: any;
  export let data: any;
  export let collectionList;
  export let collectionsMethods, activeSideBarTabMethods;

  const handleClick = (api) => {
    let request = generateSampleRequest(api.id, new Date().toString());
    request.path = api.path;
    request.name = api.name;
    if (api.description) request.description = api.description;
    if (api.property.request.url)
      request.property.request.url = api.property.request.url;
    if (api.property.request.body)
      request.property.request.body = api.property.request.body;
    if (api.property.request.method)
      request.property.request.method = api.property.request.method;
    if (api.property.request.queryParams)
      request.property.request.queryParams = api.property.request.queryParams;
    if (api.property.request.headers)
      request.property.request.headers = api.property.request.headers;
    if (api.property.request.selectedRequestBodyType)
      request = setBodyType(
        request,
        api.property.request.selectedRequestBodyType,
      );
    request.property.request.save.api = true;
    request.property.request.save.description = true;
    collectionsMethods.handleCreateTab(request);
    moveNavigation("right");
    navigate("/dashboard/collections");
    activeSideBarTabMethods.updateActiveTab("collections");
  };
  let apiClass = "api-yellow";
  if (api?.property?.request?.method === "DELETE") apiClass = "red-api";
  if (api?.property?.request?.method === "GET") apiClass = "green-api";
  if (api?.property?.request?.method === "POST") apiClass = "yellow-api";
  if (api?.property?.request?.method === "PUT") apiClass = "blue-api";
  if (api?.property?.request?.method === "PATCH") apiClass = "pink-api";
</script>

<div
  class="d-flex flex-start helper-container py-2 rounded"
  style=" overflow: auto;"
  on:click={() => handleClick(api)}
>
  <div
    class="api-type rounded d-flex align-items-center justify-content-center"
  >
    <span class={apiClass}>{api?.property?.request?.method}</span>
  </div>
  <div class="api-desc" style="font-size: 12px;">
    <p class="mb-0 api-type__title text-whiteColor">{api.name}</p>
    <div class="d-flex">
      {#if $data}
        {#each $data.slice().reverse() as list}
          {#if list}
            {#if list?._id === api?.path?.workspaceId}
              <p class="mb-0 api-type__endpoint">
                {list.name}
              </p>
            {/if}
          {/if}
        {/each}
      {/if}
      <p class="mb-0 api-type__endpoint">:</p>

      {#if api?.path?.collectionId}
        <p class="mb-0 api-type__endpoint">/</p>
      {/if}

      {#if collectionList}
        {#each collectionList.slice().reverse() as list}
          {#if list}
            {#if list?.id === api?.path?.collectionId}
              <p class="mb-0 api-type__endpoint">{list.name}</p>
              {#if api.path.folderId}
                <p class="mb-0 api-type__endpoint">/</p>
              {/if}

              {#each list.items as item}
                {#if list.items && item}
                  {#if item.id === api.path.folderId}
                    <p class="mb-0 api-type__endpoint">{item.name}</p>
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
    background-color: var(--border-color);
    cursor: pointer;
  }
  .api-type {
    height: 34px;
    width: 56px;
    border: 1px solid #313233;
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
    color: var(--recentApiText);
  }
  .api-type__title,
  .api-type__endpoint {
    white-space: nowrap;
    overflow: hidden;
    /* text-overflow: ellipsis; */
  }
  .red-api {
    color: #ff7878;
  }
  .green-api {
    color: #69d696;
  }
  .yellow-api {
    color: #ffe47e;
  }
  .blue-api {
    color: #9685ff;
  }
  .pink-api {
    color: #df77f9;
  }
</style>
