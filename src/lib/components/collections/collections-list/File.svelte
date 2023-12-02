<script lang="ts">
    import Spinner from "$lib/components/Transition/Spinner.svelte";
    import { AuthSection, AuthType } from "$lib/utils/enums/authorization.enum";
    import { ItemType, UntrackedItems } from "$lib/utils/enums/item-type.enum";
    import { RequestDataType, RequestDataset, RequestDefault, RequestSection } from "$lib/utils/enums/request.enum";
    import { moveNavigation } from "$lib/utils/helpers/navigation";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import type { Path } from "$lib/utils/interfaces/request.interface";
    import { generateSampleRequest } from "$lib/utils/sample/request.sample";
    export let name: string;
    export let id: string;
    export let collectionId: string;
    export let currentWorkspaceId: string;
    export let folderId: string;
    export let folderName: string;
    export let api;
    export let collectionsMethods: CollectionsMethods;
    console.log(api);
    
    let url, method, body, headers, queryParams, type;
    let apiClass = "red-api";
    const path: Path = {
      workspaceId: currentWorkspaceId,
      collectionId,
      folderId,
      folderName,
    };
    
    $: {
      if (api) {
        url = api.request.url;
        method = api.request.method;
        headers = api.request.headers;
        queryParams = api.request.queryParams;
        body = api.request.body;
        type = api.request.type;
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
    
    const handleClick = () => {
      const request=generateSampleRequest(id, new Date().toString());
      request.path = path;
      request.name = name;
      if(url)
      request.property.request.url = url;
      if(body)
      request.property.request.body = body; 
      if(method)
      request.property.request.method = method;
      if(queryParams)
      request.property.request.queryParams = queryParams;
      if(headers)
      request.property.request.headers = headers;
      request.save = true;
      collectionsMethods.handleCreateTab(request);
      }
  </script>

<div
  class="d-flex align-items-center justify-content-between {id.includes(UntrackedItems.UNTRACKED) ? 'unclickable' : '' }"
  style="height:32px;"
  on:click={()=>{handleClick()}}
>
<div class="d-flex align-items-center">
  <div class="api-method {apiClass}">
    {method.toUpperCase()}
  </div>
  <div class="api-name">
    {name}
  </div>

</div>
{#if id.includes(UntrackedItems.UNTRACKED)}
  <Spinner size={"15px"}/>
{/if}
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
    text-align: left;
  }
  .api-name {
    font-size: 12px;
    font-weight: 400;
  }
  .unclickable {
            pointer-events: none;
        }
</style>
