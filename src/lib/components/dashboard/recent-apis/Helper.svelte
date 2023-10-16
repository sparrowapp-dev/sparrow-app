<script lang="ts">
    export let api: any;
    let apiClass = "api-yellow";
    if(api.type === "DEL") apiClass = "red-api";
    if(api.type === "GET") apiClass = "green-api"; 
    if(api.type === "POST") apiClass = "yellow-api";
    if(api.type === "PUT") apiClass = "blue-api";
    if(api.type === "ARC") apiClass = "grey-api";
</script>

<div class="d-flex flex-start pb-2">
    <div class="api-type rounded d-flex align-items-center justify-content-center"><span class={apiClass}>{api.type}</span></div>
    <div class="api-desc">
        <p class="mb-0 api-type__title">{api.title}</p>
        <p class="mb-0 api-type__endpoint">{api.endpoint}</p>
    </div>
</div>
<style>
    .api-type{
        height:34px;
        width: 56px;
        border: 1px solid #313233;
        margin-right: 5px;
        font-size: 12px;
    }
    .api-type span{
        font-weight: 500;
    }
    .api-desc{
        width: calc(100% - 61px);
    }
    .api-type__title{
        font-size: 12px;
        font-weight: 400;
    }
    .api-type__endpoint{
        font-family: Roboto Mono;
        font-size: 12px;
        color: #999999;
    }
    .api-type__title, .api-type__endpoint {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;    
    }
    .red-api{
        color: #FF7878;
    }
    .green-api{
        color: #69D696;
    }
    .yellow-api{
        color: #FFE47E;
    }
    .blue-api{
        color: #9685FF;
    }
    .grey-api{
        color: #8A9299;
    }
</style>