<script lang="ts">
  import icons from "$lib/assets/app.asset";
  export let  noOfCollections:number;
  export let email:String;
  export let handleWorkspaceTab:(tab:string)=>void;
 </script>
 
 

 
 <div
   class="d-flex flex-column align-items-left justify-content-start"
   style="width: 280px;border-left:2px solid #313233"
 >
   <div
     class="d-flex flex-column text-whiteColor mt-4 ps-3 gap-1"
     style="font-size: 12px;"
   >
     <button id="btn" on:click={()=>{handleWorkspaceTab("ABOUT")}}
       class='d-flex align-items-center gap-2 mt-2 info-setting-hover rounded py-2 cursor-pointer'
      style='background:transparent;border:none'>
       <img src={icons.info} alt="info" class="ps-2" />
       <p class="mb-0">About</p>
     </button>
     <button id="btn2" style="background:transparent;border:none" on:click={()=>{handleWorkspaceTab("SETTING")}}
       class="d-flex align-items-center gap-2 info-setting-hover rounded py-2"
     >
       <img src={icons.setting} alt="settings" class="ps-2" />
       <p class="mb-0">Workspace Settings</p>
     </button>
     <div class="mb-3 mt-2">
       <img src={icons.line} alt="lineicon" />
     </div>
     <div class="d-flex flex-column">
       <p class="fw-bold fs-6 text-textColor ps-3">Last Activity by</p>
       <div class="d-flex align-items-center ps-3 gap-2">
         <button
           class="bg-backgroundColor border-0"
           id="profile-dropdown"
           style="width: 24px; height:24px;border-radius:50%"
         >
           <p
             class="mb-0 profile-circle bg-plusButton text-black m-auto text-center d-flex align-items-center justify-content-center"
             style="width: 100%; height: 100%; margin: 0;"
           >
            {email[0].toUpperCase()}
           </p>
         </button>
         <p class="mb-0">{email}</p>
       </div>
     </div>
   </div>
   <!-- This is not dynamic. So commenting for now. - Nayan (29 Feb, 2024) 
    
    <div class="workspace-info gap-3 text-defaultColor">
     <p>
       <span class="me-1 fs-6 text-plusButton">{noOfCollections}</span
       >COLLECTION
     </p>
   </div> -->
 </div>






<style>
  .main-container {
    width: 280px;
    position: fixed;
    font-family: Roboto;
    right: 0;
    top: 80px;
    border-left: 1px solid var(--border-color);
    height: calc(100vh - 80px);
    z-index: 99;
  }

  .workspace-info {
    position: fixed;
    bottom: 0;
    padding: 15px;
    display: flex;
    width: 100%;
    color: #45494d;
    font-size: 12px;
  }
  .workspace-info > :first-child {
    margin-right: 10px;
  }
  .api-info {
    color: #85c2ff;
    line-height: 18px;
    font-size: 16px;
    padding-left: 10px;
  }
  .profile-circle {
       border-radius: 50%;
     }
     .info-setting-hover:hover {
       background-color: var(--border-color);
     }
     .workspace-info {
       position: fixed;
       bottom: 0;
       padding: 15px;
       display: flex;
       width: 100%;
       font-size: 12px;
     } 
</style>
