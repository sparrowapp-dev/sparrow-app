<script lang="ts">
  import type { Path } from "$lib/utils/interfaces/request.interface";
  import { getPathFromUrl,truncatePath } from "$lib/utils/helpers/common.helper";
  import { showPathStore } from "$lib/store/methods";
  import { onDestroy } from "svelte";
  export let name: string;
  export let id: string;
  export let collectionId: string;
  export let currentWorkspaceId: string;
  export let folderId: string;
  export let folderName: string;
  export let api;
  let showPath = false;

  let url, method, body, headers, queryParams;
  // let url = api.request.url;
  // let method = api.request.method;
  // let headers = api.request.headers;
  // let queryParams = api.request.queryParams;
  // let body = api.request.body;
  let apiClass = "red-api";
  const selectedMethodUnsubscibe = showPathStore.subscribe((value) => {
    showPath = value;
  });

  $: {
    if (api) {
      url = api.request.url;
      method = api.request.method;
      headers = api.request.headers;
      queryParams = api.request.queryParams;
      body = api.request.body;
    }
  }
  $: {
    if (method) {
      if (method === "DELETE") apiClass = "red-api";
      else if (method === "GET") apiClass = "green-api";
      else if (method === "POST") apiClass = "yellow-api";
      else if (method === "PUT") apiClass = "blue-api";
      else if (method === "ARC") apiClass = "grey-api";
    }
  }

  let path: Path = {
    workspaceId: currentWorkspaceId,
    collectionId,
    folderId,
    folderName,
  };
  onDestroy(() => {
    selectedMethodUnsubscibe();
  });


    function TruncatePath(arg0: string) {
        throw new Error("Function not implemented.");
    }
</script>

<div></div>
<div class="d-flex align-items-center api-request">
  <div class="api-method {apiClass}">
    {method.toUpperCase()}
  </div>
  <div class="api-info">
    <div class="api-name">{name}</div>
    {#if showPath}
      <span class="path-name">{`${url ? (truncatePath(getPathFromUrl(url),14)) : ""}`}</span>
    {/if}
  </div>
</div>

<style>
  .red-api {
    color: var(--request-delete);
  }
  .green-api {
    color: var(--request-get);
  }
  .yellow-api {
    color: var(--request-post);
  }
  .blue-api {
    color: var(--request-put);
  }
  .grey-api {
    color: var(--request-arc);
  }
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
  .api-request {
    display: flex;
    margin-top: 5px;
  }
</style>
