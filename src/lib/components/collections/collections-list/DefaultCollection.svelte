<script lang="ts">
   import whitePlus from "$lib/assets/plus-white.svg";
    import { handleTabAddons } from "$lib/store/request-response-section";
    import { ItemType } from "$lib/utils/enums/item-type.enum";
    import { RequestDefault } from "$lib/utils/enums/request.enum";
    import { moveNavigation } from "$lib/utils/helpers/navigation";
    import { v4 as uuidv4 } from "uuid";
    import { createSampleRequest } from "$lib/utils/sample/request.sample";
    import type { NewTab } from "$lib/utils/interfaces/request.interface";
   const addApiRequest=()=>{ 
         const newTab: NewTab=createSampleRequest(uuidv4())
        handleTabAddons(newTab);
        moveNavigation('right');
}
   
</script>
<div class="container-fluid row  d-flex flex-column align-items-center ps-4 pe-3 pt-3">
<p style="font-size: 14px;
font-weight: 300;">Add Collections to your Workspace to group your requests or send an API request directly</p>
<div class="d-flex flex-column gap-3 w-100 mt-3 align-items-center">
    <button class="buttons d-flex justify-content-center align-items-center gap-1">
      <img src={whitePlus } alt="+">Collection
    </button>
    <button  class="buttons" on:click={()=>{addApiRequest()}}>
      <img src={whitePlus} alt="+">
      API Request</button>
</div>
</div>

<style>


.buttons{
width:180px;
height: 32px;
padding: 4px, 12px, 4px, 4px;
border-radius: 4px;
background: linear-gradient(270deg, #6147FF -1.72%, #1193F0 100%);
border: none;
}
</style>