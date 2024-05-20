<script>
  import icon from "$lib/assets/sparrow-icon-collection.svg";
  import vector4 from "$lib/assets/Vector4.svg";
  import libraryAdd from "$lib/assets/library_add.svg";
  export let showImportCollectionPopup;

  export let onItemCreated;

  </script>  


<div class=" d-flex flex-column justify-content-center align-items-center" style=" padding-top: 102px; padding-right:325px;  padding-left:325px; padding-bottom: 24px; gap: 89px;">
      <div style="height: 176px; width: 175px;">
        <img src={icon} alt="Icon"  />
      </div>
    <div class="d-flex " style="gap: 19px;">
      <div class=" " style="height: 120px; width:120px; border: 0.5px solid #22232E; border-radius : 4px;" role="button"
        on:click={() => {
        showImportCollectionPopup();
        }}>
  
          <div class="d-flex justify-content-center align-items-center" style="height: 79px"> 
              <img src="{libraryAdd}" alt=""/>
          </div>  
          <div class="d-flex justify-content-center align-items-center" style="height: 41px; background-color:#22232E; padding:10px; font-size:14px; " >
            Add Collection
          </div>
      </div>


    
    <div class=" " style="height: 120px; width:120px; border: 0.5px solid #22232E;  border-radius : 4px; "  role="button" 
    on:click={() => {
      onItemCreated("request" , {});
   }}> 
    
    <div class="d-flex justify-content-center align-items-center" style="height: 79px"> 
      <img src="{vector4}" alt=""/>
    </div>  
    <div class="d-flex justify-content-center align-items-center" style="height: 41px; background-color:#22232E; padding:10px; font-size:14px;  " >
  Add Request
    </div>
    </div>


    </div>
</div>
  




  <!-- style="
    display: flex; 
    justify-content: center; 
    align-items: center; 
    height: 100%; 
    font-size: 2em; 
    color: #fff; 
    cursor: pointer; -->