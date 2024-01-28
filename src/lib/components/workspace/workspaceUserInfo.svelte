<script lang="ts">
  import { UserRoles } from "$lib/utils/enums/enums";
  import MemberDropDown from "../dropdown/MemberDropDown.svelte";
  import RemoveMemberFromWorkspacePopup from "../Modal/RemoveMemberFromWorkspacePopup.svelte";
  export let id: string;
  export let name: string;
  export let email: string;
  export let role: UserRoles;
  export let teamName:string;
  export let hasPermission: boolean;
  export let currentWorkspaceDetails:{id:string,name:string}; 
  let isRemoveMemberPopup = false;
  let isPartOfOnlythisWorkspace:boolean;
  export let handleUserOnRemove:(userId:string)=>void;
  export let deleteUserFromWorkspace:(workspaceId:string,userId:string)=>Promise<any>
  export let deleteUserFromWorkspaceRxDB:(workspaceId:string,userId:string)=>Promise<void>
  export let checkIfUserIsPartOfMutipleWorkspaces:(userId:string)=>Promise<boolean>;
  export let updateRoleInWorkspace: (
    workspaceId: string,
    userId: string,
    role: UserRoles,
  ) => any;
  export let updateUsersInWorkspaceInRXDB: (
    workspaceId: string,
    userId: string,
    role: UserRoles,
  ) => any;

  const handleDropdown = async (currentRole: UserRoles | "remove") => {
    if (
      (hasPermission && currentRole === UserRoles.VIEWER) ||
      currentRole === UserRoles.EDITOR
    ) {
      role = currentRole;
      const response = await updateRoleInWorkspace(currentWorkspaceDetails.id, id, role);
      if (response && response.data.data) {
        await updateUsersInWorkspaceInRXDB(currentWorkspaceDetails.id, id, role);
      }
    }
    if (hasPermission && currentRole === "remove") {
      handleRemovePopup(true,id);
    }
  };
  const showRemoveMemberPopup =async(showMemberPopup: boolean) => {
    isRemoveMemberPopup =showMemberPopup;
  };
  const handleRemovePopup=async(showMemberPopup:boolean,userId:string)=>{
    await checkIfUserExistInMultipleWorkspace(userId);
    showRemoveMemberPopup(showMemberPopup);
    return;
  }
  const checkIfUserExistInMultipleWorkspace=async(userId:string)=>{
   isPartOfOnlythisWorkspace=await checkIfUserIsPartOfMutipleWorkspaces(userId);
  }
</script>

<div class="team-details d-flex w-100% justify-content-between">
  <div class="user-info">
    <p
      class="profile-circle bg-dullBackgroundr text-white text-center d-flex align-items-center justify-content-center"
      style="width: 36px; height:36px;border-radius:50%;border:2px solid #45494D ;"
    >
      {name[0]}
    </p>
    <div class="user-info-details" style="position: relative">
      <p>{name}</p>
      <p class="user-email" style="position:absolute;bottom:0;">{email}</p>
    </div>
  </div>
  <div></div>
  <div class="user-info-role">
    {#if hasPermission}
      <MemberDropDown
        {id}
        data={[
          {
            name: "Editor",
            id: "editor",
            color: "whiteColor",
          },
          {
            name: "Viewer",
            id: "viewer",
            color: "whiteColor",
          },
          {
            name: "Remove",
            id: "remove",
            color: "dangerColor",
          },
        ]}
        method={role ? role : ""}
        onclick={handleDropdown}
        isWorkspaceMemberDropDown={true}
      />
    {:else}
      <div class="default-admin-container p-2 rounded z-2">
        <p class="m-0 p-0 text-white text-capitalize" style="font-size: 12px;">
          {role}
        </p>
      </div>
    {/if}
    {#if isRemoveMemberPopup}
      <RemoveMemberFromWorkspacePopup teamName={teamName} handleUserOnRemove={handleUserOnRemove}   deleteUserFromWorkspaceRxDB={deleteUserFromWorkspaceRxDB} deleteUserFromWorkspace={deleteUserFromWorkspace}   isPartOfOnlythisWorkspace={isPartOfOnlythisWorkspace} userId={id} {showRemoveMemberPopup} name={name} 
   currentWorkspaceDetails={currentWorkspaceDetails}  
      ></RemoveMemberFromWorkspacePopup>
    {/if}
  </div>
</div>

<style>
  .profile-circle {
    border-radius: 50%;
  }
  .user-email {
    position: absolute;
    bottom: 0;
    color: var(--button-color);
  }
  .user-info {
    display: flex;
    gap: 5px;
    justify-content: center;
  }
  .user-info-details {
    display: flex;
    gap: 2px;
    font-size: 12px;
    flex-direction: column;
  }
  .user-info-role {
    font-size: 14px;
    margin-top: 5px;
  }
  .select-option:focus {
    border: 2px solid var(--workspace-hover-color);
  }
  select {
    border: 2px solid var(--workspace-hover-color);
  }
  .default-admin-container {
    background: none;
    outline: none;
    border: none;
    height: 34px;
    width: auto;
    padding: 0 10px;
    border: 1px solid transparent;
    cursor: pointer;
  }
  .default-admin-container:hover {
    background-color: var(--border-color);
  }
</style>
