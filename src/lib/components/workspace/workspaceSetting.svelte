<script lang="ts">
  import { SearchIcon } from "$lib/assets/app.asset";
  import WorkspaceUserInfo from "./workspaceUserInfo.svelte";
  import { TeamRole} from "$lib/utils/enums";
  import MemberChangeRolePopup from "../Modal/MemberChangeRolePopup.svelte"
  import type { CollectionsMethods, TeamRepositoryMethods, TeamServiceMethods, userDetails, workspaceInviteMethods } from "$lib/utils/interfaces";
  import type { TeamDocument, WorkspaceDocument } from "$lib/database/app.database";
  export let collectionsMethods: CollectionsMethods;
  import { notifications } from "$lib/utils/notifications";
  import { navigate } from "svelte-navigator";
  export let currentTeamworkspaces:WorkspaceDocument[];
  export let currentWorkspaceDetails: { id: string; name: string };
  export let currentTeamDetails:{id:string,name:string}
  export let loggedInUserEmail: string;
  export let loggedUserRole:TeamRole;
  export let teamWorkspaceMethods: Pick<TeamServiceMethods,'demoteToMemberAtTeam'|'promoteToAdminAtTeam'|'removeMembersAtTeam'|'refreshWorkspace'> & Pick <TeamRepositoryMethods,'updateUserRoleInTeam'|'removeUserFromTeam'>
  export let workspaceInvitePermissonMethods:workspaceInviteMethods
  export let currentActiveTeam:TeamDocument;
  let isshowDeletePopupOpen:boolean=false;
  export let users: userDetails[] = [];
  export let hasPermission: boolean;
  export let loggedInUser: userDetails;
  let filterText="";
  export let  handleInvitePopup:(showPopup: boolean)=>void;
  export let getUserDetailsOfWorkspace: (workspaceId: string) => any;
  const handleUserOnRemove=async(workspaceId:string,userId:string)=>{
    users = users.filter((userObj) => !(userObj.id !== userId && userObj.workspaceId !== workspaceId))
  }

  const handleDeletePopup=(showPopup:boolean)=>{
    isshowDeletePopupOpen=showPopup;
  }


  const handleDeleteWorkspaceFlow=async()=>{
    const response=await workspaceInvitePermissonMethods.deleteWorkspace(currentWorkspaceDetails.id);
    await workspaceInvitePermissonMethods.handleWorkspaceDeletion(currentTeamDetails.id,currentWorkspaceDetails.id)
    if(response && response.data){
      notifications.success(`${currentWorkspaceDetails.name}is removed from ${currentTeamDetails.name}`);
      navigate("/dashboard/workspaces");
    }else{
      notifications.error(`Failed to remove ${currentWorkspaceDetails.name} from ${currentTeamDetails.name}.Please Try Again`);
     }
     handleDeletePopup(false);
  }
  


</script>

<div
  class="my-workspace d-flex flex-column"
  style="width:calc(100% - 280px); margin-top: 15px;padding:24px;"
>
  <div class="workspace-setting-header">
    <p class="workspace-name" style="font-size: 18px;">
      {currentWorkspaceDetails.name}
    </p>
    {#if hasPermission}
      <div class="workspace-setting-buttons">
        <button class="workspace-setting-button-del" on:click={()=>{handleDeletePopup(true)}}> Delete Workspace </button>
        <button class="workspace-setting-button-inv" on:click={()=>{handleInvitePopup(true)}}> Invite</button>
      </div>
    {/if}
  </div>

  <div
    class="search-bar ps-2 pe-1 gap-2 d-flex align-items-center justify-content-center rounded"
  >
    <SearchIcon />
    <input
      type="search"
      style=" font-size: 14px;font-weight:500;background:none;"
      class="border-0 w-100 h-100"
      placeholder="Search People in {currentWorkspaceDetails.name || ''}"
      on:input={(event) => {
         filterText=event.target.value;
      }}
    />
  </div>
  <div class="mt-4">
    {#if loggedInUser?.name
      .toLocaleLowerCase()
      .startsWith(filterText) || loggedInUser?.email
        .toLocaleLowerCase()
        .startsWith(filterText)}
      <WorkspaceUserInfo
        name={loggedInUser?.name}
        role={loggedInUser?.role}
        loggedInUser={true}
        {currentTeamworkspaces}
        email={loggedInUser?.email}
        {hasPermission}
        {currentTeamDetails}
        loggedUserRole={loggedUserRole}
        id={loggedInUser?.id}
        {currentWorkspaceDetails}
        {workspaceInvitePermissonMethods}
        {handleUserOnRemove}
        {teamWorkspaceMethods}
        {currentActiveTeam}
      ></WorkspaceUserInfo>
      <hr style="margin-top:-5px;" />
    {/if}
  </div>
  <div>
    {#each users as user}
      {#if user.name.toLocaleLowerCase().startsWith(filterText) || user.email
          .toLocaleLowerCase()
          .startsWith(filterText)}
        <WorkspaceUserInfo
          name={user?.name}
          role={user?.role}
          email={user?.email}
          {hasPermission}
          loggedUserRole={loggedUserRole}
          id={user?.id}
          {currentTeamDetails}
          {teamWorkspaceMethods}
          {currentTeamworkspaces}
          {handleUserOnRemove}
          {currentWorkspaceDetails}
          {workspaceInvitePermissonMethods}
          {currentActiveTeam}
        ></WorkspaceUserInfo>
      {/if}
    {/each}
    {#if ![...users, loggedInUser].some((user) => {
      return user.name.toLocaleLowerCase().startsWith(filterText) || user.email
          .toLocaleLowerCase()
          .startsWith(filterText);
    })}
      <span class="not-found-text mx-auto ellipsis">No results found.</span>
    {/if}
  </div>

  {#if isshowDeletePopupOpen }
  <MemberChangeRolePopup
    title={`Delete Workspace?`}
    teamName={currentWorkspaceDetails.name}
    teamLogo={""}
    isTeam={false}
    auth={true}
    description={`
    <div class="d-flex tile rounded mb-2">
  <div
    class="info d-flex align-items-center"
  >
  </div>
  </div>
    <p style="font-size:12px;" class="text-textColor">
      Everything in '<span class="text-whiteColor">${currentWorkspaceDetails.name}</span> will be permanently removed, and all contributors will lose access. This action cannot be undone. 
      </p>
    `}
    onSuccess={async()=>{
      await handleDeleteWorkspaceFlow();
    }}
    onCancel={()=>{
       handleDeletePopup(false)
    }}
  />
{/if}
</div>

<style>
  .workspace-setting-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    line-height: 18px;
  }
  .workspace-setting-buttons {
    display: flex;
    gap: 10px;
  }
  .workspace-setting-button-del {
    background-color: var(--border-color);
    border: none;
    padding: 5px 15px 5px 15px;
    border-radius: 4px;
  }
  .workspace-setting-button-del:hover {
    background-color: #616364;
  }
  .workspace-setting-button-inv {
    background-color: var(--primary-btn-color);
    border: none;
    padding: 5px 15px 5px 15px;
    border-radius: 4px;
  }
  .workspace-setting-button-inv:hover {
    background-color: var(--send1-hoverbutton);
  }
  .search-bar {
    border: 1px solid var(--border-color);
  }
  .search-bar:hover {
    outline: 1px solid;
  }
  .search-bar {
    width: 50%;
    padding: 8px;
  }
  .search-bar > input:focus {
    outline: none;
    border: none;
  }
  @media (max-width: 1000px) {
    .workspace-setting-header {
      display: flex;
      flex-direction: column;
    }
    .search-bar {
      margin-top: 15px;
      width: 80%;
    }
  }
</style>
