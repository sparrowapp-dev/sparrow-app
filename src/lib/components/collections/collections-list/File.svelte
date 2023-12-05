<script lang="ts">
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  import { UntrackedItems } from "$lib/utils/enums/item-type.enum";
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import type { NewTab, Path } from "$lib/utils/interfaces/request.interface";
  import { generateSampleRequest } from "$lib/utils/sample/request.sample";
  import {
    getPathFromUrl,
    truncatePath,
  } from "$lib/utils/helpers/common.helper";
  import { showPathStore } from "$lib/store/methods";
  import { onDestroy } from "svelte";
    import { getMethodStyle } from "$lib/utils/helpers/conversion.helper";
  export let name: string;
  export let id: string;
  export let collectionId: string;
  export let currentWorkspaceId: string;
  export let folderId: string;
  export let folderName: string;
  export let api;
  let showPath = false;
  export let collectionsMethods: CollectionsMethods;

  let url, method, body, headers, queryParams, type;

  let apiClass = "red-api";
  const selectedMethodUnsubscibe = showPathStore.subscribe((value) => {
    showPath = value;
  });
  $: {
    if (api) {
      if (api.property) {
        api = api.property;
      }
      url = api.request.url;
      method = api.request.method;
      headers = api.request.headers;
      queryParams = api.request.queryParams;
      body = api.request.body;
      type = api.request.type;
    }
  }
  const handleClick = () => {
    const request: NewTab = generateSampleRequest(id, new Date().toString());
    request.path = path;
    request.name = name;
    if (url) request.property.request.url = url;
    if (body) request.property.request.body = body;
    if (method) request.property.request.method = method;
    if (queryParams) request.property.request.queryParams = queryParams;
    if (headers) request.property.request.headers = headers;
    request.save = true;
    collectionsMethods.handleCreateTab(request);
    moveNavigation("right");
  };

  let path: Path = {
    workspaceId: currentWorkspaceId,
    collectionId,
    folderId,
    folderName,
  };

  onDestroy(() => {
    selectedMethodUnsubscibe();
  });
</script>

<div
  class="d-flex align-items-center justify-content-between {id.includes(
    UntrackedItems.UNTRACKED,
  )
    ? 'unclickable'
    : ''}"
  style="height:32px;"
  on:click={() => {
    handleClick();
  }}
>
  <div class="d-flex align-items-center">
    <div class="api-method text-{getMethodStyle(method)}">
      {method.toUpperCase()}
    </div>
    <div class="api-name">
      {name}
      {#if showPath}
        <span class="path-name"
          >{`${url ? truncatePath(getPathFromUrl(url), 14) : ""}`}</span
        >
      {/if}
    </div>
  </div>
  {#if id.includes(UntrackedItems.UNTRACKED)}
    <Spinner size={"15px"} />
  {/if}
</div>

<style>
  .api-method {
    font-size: 12px;
    font-weight: 500;
    margin-right: 8px;
    border: 1px solid var(--border-color);
    width: 56px;
    height: 34px;
    border-radius: 8px;
    padding: 8px 12px 8px 8px;
    display: flex;
    justify-content: center;
    text-align: left;
  }
  .api-name {
    font-size: 12px;
    font-weight: 400;
  }
  .api-info {
    display: flex;
    flex-direction: column;
  }
  .path-name {
    margin-top: -4px;
    font-family: Roboto Mono;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0em;
    text-align: left;
    color: #999999;
  }
  .highlight {
    color: var(--white-color);
  }
  .unclickable {
    pointer-events: none;
  }
</style>
