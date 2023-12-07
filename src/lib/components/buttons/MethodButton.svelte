<script lang="ts">
    import { getMethodStyle } from "$lib/utils/helpers/conversion.helper";

    export let method: string;
</script>

<div class="d-flex flex-start pb-2">
    <div class="api-type rounded d-flex align-items-center justify-content-center"><span class="text-{getMethodStyle(method)}">{method}</span></div>
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
</style>