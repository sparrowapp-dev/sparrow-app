<script lang="ts">
     import { handleTabAddons} from "$lib/store/request-response-section";
    export let name: string;
    export let method: string;
    export let id : string;
    export let collectionId : string; 
    export let currentWorkspaceId : string;
    export let folderId : string;
    export let folderName : string;

    let apiClass = "red-api";
    if(method === "DELETE") apiClass = "red-api";
    else if(method === "GET") apiClass = "green-api"; 
    else if(method === "POST") apiClass = "yellow-api";
    else if(method === "PUT") apiClass = "blue-api";
    else if(method === "ARC") apiClass = "grey-api";
    let path = {
        workspaceId: currentWorkspaceId,
        collectionId,
        folderId,
        folderName
    }
</script>

<div class="d-flex align-items-center" style="height:32px;" on:click={()=>{
    handleTabAddons(id, name, method, path);
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