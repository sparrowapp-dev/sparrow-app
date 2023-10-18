<script lang="ts">
    export let name: string;
    export let method: string;
    let apiClass = "red-api";
    if(method === "delete") apiClass = "red-api";
    if(method === "get") apiClass = "green-api"; 
    if(method === "post") apiClass = "yellow-api";
    if(method === "put") apiClass = "blue-api";
    if(method === "ARC") apiClass = "grey-api";
</script>

<div class="d-flex align-items-center" style="height:32px;">
    <div class="api-method {apiClass}">
        {method.toUpperCase()} 
    </div>
    <div class="api-name">
        {name} 
    </div>
</div>

<style>
    .red-api{ color: var(--request-delete); }
    .green-api{ color: var(--request-delete); }
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