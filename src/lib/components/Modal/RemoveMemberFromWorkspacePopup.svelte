<script lang="ts">
  import closeIcon from "$lib/assets/close.svg";
  import type { userDetails } from "$lib/utils/interfaces";
  import { notifications } from "$lib/utils/notifications";
  import CoverButton from "../buttons/CoverButton.svelte";
  import { fly, fade } from "svelte/transition";
  export let showRemoveMemberPopup: (flag: boolean) => void;
  export let teamName:string;
  export let users: userDetails[] = [];
  export let handleUserOnRemove:(userId:string)=>void;
  export let name: string;
  export let userId:string;
  export let currentWorkspaceDetails:{id:string,name:string};  
  export let  isPartOfOnlythisWorkspace:boolean;
  export let deleteUserFromWorkspace:(workspaceId:string,userId:string)=>Promise<any>
  export let deleteUserFromWorkspaceRxDB:(workspaceId:string,userId:string)=>Promise<void>



const handleRemove=async(workspaceId:string,userId:string)=>{
  const response=await deleteUserFromWorkspace(workspaceId,userId);
  if(response && response?.data?.data){
    handleUserOnRemove(userId);
     await deleteUserFromWorkspaceRxDB(workspaceId,userId);
     notifications.success(`${name} removed from ${currentWorkspaceDetails.name}`)
  }else{
    notifications.error(`Failed to  remove ${name} from ${currentWorkspaceDetails.name}`)
  }

  showRemoveMemberPopup(false)

}

</script>

<div
  class="background-overlay"
  on:click={() => {
    showRemoveMemberPopup(false);
  }}
  transition:fade={{ delay: 0, duration: 100 }}
/>

<div
  class="container d-flex flex-column mb-0 px-4 pb-0 pt-4"
  transition:fly={{ y: 50, delay: 0, duration: 100 }}
  on:introstart
  on:outroend
>
  <div class="d-flex align-items-center justify-content-between mb-3">
    <h5 class="text-header mb-0 text-whiteColor" style="font-weight: 500;">
      Remove User?
    </h5>
    <button
      class="btn-close1 border-0 rounded"
      on:click={() => {
        showRemoveMemberPopup(false);
      }}
    >
      <img src={closeIcon} alt="" />
    </button>
  </div>
  <div class="mt-2" style="font-size: 14px;">
    <p class="text-lightGray">
      Are you sure you want to remove <span style="font-weight:700;"
      class="text-whiteColor">{name}</span
      >? They will lose access to the
      <span  style="font-weight:700;"
      class="text-whiteColor">{currentWorkspaceDetails.name}</span> workspace.
      {#if isPartOfOnlythisWorkspace}
      <span>
        They will still have access to other workspaces that they are part of.
      </span>
      {:else}
      <span> Since they are
        not part of any other workspace, they will lose access to {teamName} team as
        well.
        </span> 
      {/if}
    </p>
  </div>
  <div
    class="d-flex align-items-center justify-content-end gap-3 mt-1 mb-0 rounded"
    style="font-size: 16px;"
  >
    <CoverButton
      disable={false}
      text={"Cancel"}
      size={14}
      type={"dark"}
      loader={false}
      onClick={() => {
        showRemoveMemberPopup(false);
      }}
    />

    <CoverButton
      disable={false}
      text={"Remove"}
      size={14}
      type={"danger"}
      loader={false}
      onClick={async() => {
       await handleRemove(currentWorkspaceDetails.id,userId)
      }}
    />
  </div>
</div>

<style>
  .background-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: var(--background-hover);
    -webkit-backdrop-filter: blur(3px);
    backdrop-filter: blur(3px);
    z-index: 9;
  }

  .container {
    position: fixed;
    height: 244px;
    width: 540px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--background-color);
    z-index: 10;
    border-radius: 10px;
  }

  .btn-close1 {
    background-color: var(--background-color);
  }

  .btn-close1:hover {
    background-color: var(--dangerColor);
  }

  .btn-close1:active {
    background-color: var(--dangerColor);
  }
  .btn-primary {
    background-color: var(--border-color);
  }

  .btn-primary:hover {
    color: var(--blackColor);
    background-color: var(--workspace-hover-color);
  }

  .btn-primary:active {
    color: var(--blackColor);
    background-color: var(--button-pressed);
  }

  .btn-secondary {
    background-color: var(--dangerColor);
  }

  .btn-secondary:hover {
    background-color: var(--delete-hover);
  }
  
</style>
