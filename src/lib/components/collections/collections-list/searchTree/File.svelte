<script lang="ts">
    export let name: string;
    export let method: string;

    let apiClass = "red-api";
    if(method === "DELETE") apiClass = "red-api";
    else if(method === "GET") apiClass = "green-api"; 
    else if(method === "POST") apiClass = "yellow-api";
    else if(method === "PUT") apiClass = "blue-api";
    else if(method === "ARC") apiClass = "grey-api";
    // console.log(actualPath);
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