<script lang="ts">
     import { handleTabAddons} from "$lib/store/request-response-section";
    import type { Path } from "$lib/utils/interfaces/request.interface";
    export let name: string;
    export let id : string;
    export let collectionId : string; 
    export let currentWorkspaceId : string;
    export let folderId : string;
    export let folderName : string;
    export let api;
    
    let url, method, body, headers, queryParams

    let apiClass = "red-api";
    
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
        if(method === "DELETE") apiClass = "red-api";
        else if(method === "GET") apiClass = "green-api"; 
        else if(method === "POST") apiClass = "yellow-api";
        else if(method === "PUT") apiClass = "blue-api";
        else if(method === "ARC") apiClass = "grey-api";
    }
  }
    
    let path : Path = {
        workspaceId: currentWorkspaceId,
        collectionId,
        folderId,
        folderName
    }
</script>

<div class="d-flex align-items-center" style="height:32px;" on:click={()=>{
     if(!id.includes("MYUID45345")){
        handleTabAddons( {
            id, 
            name, 
            type : api.type,
            request : {
                method,
                url : url ? url : '',
                body: body ? body : "",
                headers : headers ? headers : [],
                queryParams : queryParams ? queryParams : []
            }, 
            save : true,
            requestInProgress : false,
            path,
        } );
        }
    }}>
    <div class="api-method {apiClass}">
        {method.toUpperCase()} 
    </div>
    <div class="api-name">
        {name} 
    </div>
</div>

<style>
    .red-api{ color: var(--request-delete); }
    .green-api{ color: var(--request-get); }
    .yellow-api{ color: var(--request-post); }
    .blue-api{ color: var(--request-put); }
    .grey-api{ color: var(--request-arc); }
    .api-method{
        font-size: 12px;
        font-weight: 500;
        margin-right: 8px;
        text-align: left;
    }
    .api-name{
        font-size: 12px;
        font-weight: 400;
    }
</style>