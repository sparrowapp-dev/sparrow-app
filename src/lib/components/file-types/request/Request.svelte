<script lang="ts">
    import { getMethodStyle } from "$lib/utils/helpers/conversion.helper";

    export let name: string;
    export let method: string;
</script>

<div class="d-flex align-items-center" style="height:32px;">
    <div class="api-method text-{getMethodStyle(method)}">
        {method.toUpperCase()} 
    </div>
    <div class="api-name">
        <p class="ellipsis mb-0">{name}</p> 
    </div>
</div>

<style>
    .api-method{
        font-size: 12px;
        font-weight: 500;
        margin-right: 8px;
        text-align: left; 
    }
    .api-name{
        font-size: 12px;
        font-weight: 400;
        width: calc(100% - 70px);
    }
    .ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>