<script lang="ts">
  import MemberWorkspace from "../member-worspace/MemberWorkspace.svelte";
  import {
    TeamAccess,
    TeamRole,
    WorkspaceRole,
  } from "$lib/utils/enums/team.enum";
  import type {
    TeamServiceMethods,
    userDetails,
    workspaceDocumentWithPosition,
  } from "$lib/utils/interfaces";
  import type { MemberPopType } from "$lib/utils/types/common.type";
  
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";

  

  export let user: userDetails;
  export let teamRole: TeamRole;
  export let workspaces: workspaceDocumentWithPosition[];
  export let hasPermission = false;
  export let userType: TeamRole;
  export let handlePopup: (flag, popType: MemberPopType) => void;
  export let owner = false;
  export let teamServiceMethods: TeamServiceMethods = {};
  export let userId: string;
  export let handleMemberPopUpSuccess = (flag: boolean) => {};
  export let getPermissionsData: () => Array<{
    name: string;
    id: string;
    dynamicClasses: string;
  }>;
  export let isWorkspaceMemberInfo = false;
  export let handleDropDownWorkspaceLevel = (
    currentRole: WorkspaceRole | "remove",
  ) => {};
  const handleDropdown = (id: "remove" | TeamRole) => {
    if (id === "remove") {
      handlePopup(true, "isMemberRemovePopup");
    } else if (
      user.role === TeamRole.TEAM_ADMIN &&
      id === TeamRole.TEAM_MEMBER
    ) {
      handlePopup(true, "isMemberDemotePopup");
    } else if (
      user.role === TeamRole.TEAM_MEMBER &&
      id === TeamRole.TEAM_ADMIN
    ) {
      handlePopup(true, "isMemberPromotePopup");
    } else if (
      user.role === TeamRole.TEAM_ADMIN &&
      id === TeamRole.TEAM_OWNER
    ) {
      handlePopup(true, "isMemberOwnershipPopup");
    }
  };

  let workspaceCount: number;
  $: {
    workspaceCount = 0;
    if (workspaces) {
      workspaces.forEach((element) => {
        if (element.position) {
          workspaceCount++;
        }
      });
    }
  }
</script>

<div>
  <div class="d-flex tile">
    <div class="info d-flex">
      <div class="icon d-flex align-items-center justify-content-center">
        <span>{user.name[0].toUpperCase()}</span>
      </div>
      <div class="name px-2">
        <span class="text-whiteColor sparrow-fs-12"
          >{user.name} {owner ? "(You)" : ""}</span
        ><br />
        <span class="text-textColor sparrow-fs-12">{user.email}</span>
      </div>
    </div>
    <div class="position">
      {#if (userType === TeamRole.TEAM_OWNER && (isWorkspaceMemberInfo ? teamRole === TeamRole.TEAM_MEMBER : user.role === TeamRole.TEAM_MEMBER)) || (userType === TeamRole.TEAM_ADMIN && isWorkspaceMemberInfo ? teamRole === TeamRole.TEAM_MEMBER : user.role === TeamRole.TEAM_MEMBER)}
        <Dropdown
         dropDownType={{type:"text",title:isWorkspaceMemberInfo ? teamRole : user.role}}            
          data={getPermissionsData()}
          onclick={isWorkspaceMemberInfo
            ? handleDropDownWorkspaceLevel
            : handleDropdown}
        />
        
      {:else if userType === TeamRole.TEAM_OWNER && (isWorkspaceMemberInfo ? teamRole === TeamRole.TEAM_ADMIN : user.role === TeamRole.TEAM_ADMIN)}
        <Dropdown
          data={getPermissionsData()}
          dropDownType={{type:"text",title:isWorkspaceMemberInfo ? teamRole : user.role}}            
          onclick={isWorkspaceMemberInfo
            ? handleDropDownWorkspaceLevel
            : handleDropdown}
        />
      {:else}
        <Dropdown
          disabled={true}
          data={getPermissionsData()}
          dropDownType={{type:"text",title:isWorkspaceMemberInfo ? teamRole : user.role}}            
          onclick={isWorkspaceMemberInfo
            ? handleDropDownWorkspaceLevel
            : handleDropdown}
        />
      {/if}
    </div>
  </div>
</div>
<hr />
<div class="team-workspace mb-1 sparrow-fs-14">
  {#each workspaces as workspace}
    {#if workspace.position}
      <MemberWorkspace
        {teamRole}
        {workspace}
        {userType}
        {user}
        {teamServiceMethods}
        {userId}
        {workspaceCount}
        {handleMemberPopUpSuccess}
        {isWorkspaceMemberInfo}
        {handleDropDownWorkspaceLevel}
      />
    {/if}
  {/each}
</div>
<div
  class="d-flex align-items-center justify-content-end gap-3 mt-1 mb-0 rounded"
  style="font-size: 16px;"
></div>

<style lang="scss">
  .btn-close1 {
    background-color: var(--background-color);
  }

  .btn-close1:hover {
    background-color: var(--background-dropdown);
  }

  .btn-close1:active {
    background-color: var(--background-dropdown);
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
  .icon {
    width: 36px;
    height: 36px;
    border: 1px solid var(--border-color);
    border-radius: 50%;
  }
  .info {
    width: calc(100% - 100px);
    height: 36px;
  }
  .position {
    width: 100px;
  }
  .team-workspace {
    height: 170px;
    overflow-y: auto;
  }
</style>
