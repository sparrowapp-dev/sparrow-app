<script lang="ts">
  import { SearchIcon } from "$lib/assets/app.asset";
  import WorkspaceUserInfo from "./workspaceUserInfo.svelte";
  import { UserRoles } from "$lib/utils/enums/enums";
  import type { CollectionsMethods, userDetails } from "$lib/utils/interfaces";
  export let collectionsMethods: CollectionsMethods;
  export let currentWorkspaceDetails:{id:string,name:string};
  export let loggedInUserEmail: string;
  export let teamName:string;
  export let updateRoleInWorkspace:(workspaceId: string,userId:string,role:UserRoles)=>any;
  export let updateUsersInWorkspaceInRXDB:(workspaceId: string,userId:string,role:UserRoles)=>any;
  export let checkIfUserIsPartOfMutipleWorkspaces:(userId:string)=>Promise<boolean>;
  export let deleteUserFromWorkspace:(workspaceId:string,userId:string)=>Promise<any>
  export let deleteUserFromWorkspaceRxDB:(workspaceId:string,userId:string)=>Promise<void>
  export let users: userDetails[] = [];
  export let hasPermission:boolean;
  export let loggedInUser: userDetails;
  let filterText="";
  export let getUserDetailsOfWorkspace: (workspaceId: string) => any;
  const handleUserOnRemove=(userId:string)=>{
    users=users.filter((user)=>{
      return user.id!==userId
    })
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
      <button class="workspace-setting-button-del"> Delete Workspace </button>
      <button class="workspace-setting-button-inv"> Invite</button>
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
    {#if loggedInUser?.name.toLocaleLowerCase().startsWith(filterText) || loggedInUser?.email.toLocaleLowerCase().startsWith(filterText)}
    <WorkspaceUserInfo
      name={loggedInUser?.name + "(YOU)"}
      role={loggedInUser?.role}
      email={loggedInUser?.email}
      {hasPermission}
      teamName={teamName}
      id={loggedInUser?.id}
      currentWorkspaceDetails={currentWorkspaceDetails}    
      updateRoleInWorkspace={updateRoleInWorkspace}
      updateUsersInWorkspaceInRXDB={updateUsersInWorkspaceInRXDB}
      deleteUserFromWorkspace={deleteUserFromWorkspace}
      deleteUserFromWorkspaceRxDB={deleteUserFromWorkspaceRxDB}
      handleUserOnRemove={handleUserOnRemove}
      checkIfUserIsPartOfMutipleWorkspaces={checkIfUserIsPartOfMutipleWorkspaces}
    ></WorkspaceUserInfo>
    <hr style="margin-top:-5px;" />
    {/if}
  </div>
  <div>
    {#each users as user}
    {#if user.name.toLocaleLowerCase().startsWith(filterText) || user.email.toLocaleLowerCase().startsWith(filterText)}
    <WorkspaceUserInfo
    name={user?.name}
    role={user?.role}
    email={user?.email}
    {hasPermission}
    id={user?.id}
    teamName={teamName}
    handleUserOnRemove={handleUserOnRemove}
    currentWorkspaceDetails={currentWorkspaceDetails} 
    updateRoleInWorkspace={updateRoleInWorkspace}
    updateUsersInWorkspaceInRXDB={updateUsersInWorkspaceInRXDB}
    deleteUserFromWorkspace={deleteUserFromWorkspace}
    deleteUserFromWorkspaceRxDB={deleteUserFromWorkspaceRxDB}
    checkIfUserIsPartOfMutipleWorkspaces={checkIfUserIsPartOfMutipleWorkspaces}
  ></WorkspaceUserInfo>
     {/if}
    {/each}
    {#if !(users.some((user)=>{return user.name.toLocaleLowerCase().startsWith(filterText) || user.email.toLocaleLowerCase().startsWith(filterText)}))}
    <span class="not-found-text mx-auto ellipsis">No results found.</span>
    {/if}
  </div>
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
