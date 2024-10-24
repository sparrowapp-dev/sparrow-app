<script lang="ts">
  import { TeamRole } from "@sparrow/common/enums/team.enum";
  import type {
    userDetails,
    workspaceDocumentWithPosition,
  } from "@sparrow/common/interfaces";

  import { ProfileWorkspace } from "./sub-profile";
  import { Select } from "@sparrow/library/forms";

  export let user: userDetails;
  export let teamRole: TeamRole;
  export let workspaces: workspaceDocumentWithPosition[];
  export let userType: TeamRole;
  export let handlePopup: (flag: boolean, popType: string) => void;
  export let owner = false;
  export let userId: string;
  export let handleMemberPopUpSuccess = (flag: boolean) => {};
  export let getPermissionsData: () => Array<{
    name: string;
    id: string;
    dynamicClasses: string;
  }>;

  /**
   * function to remove member from workspace
   */
  export let onRemoveUserFromWorkspace;
  /**
   * function to change user role at workspace
   */
  export let onChangeUserRoleAtWorkspace;

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
  <div class="d-flex tile align-items-center justify-content-center">
    <div class="info d-flex align-items-center mt-2">
      <div class="icon d-flex align-items-center justify-content-center">
        <span style="mt-2">{user.name[0].toUpperCase()}</span>
      </div>

      <div class="name px-2 ellipsis" style="width:80%">
        <span class="text-whiteColor sparrow-fs-12"
          >{user.name} {owner ? "(You)" : ""}</span
        ><br />
        <span class="text-textColor sparrow-fs-12">{user.email}</span>
      </div>
    </div>

    <div class="position mt-3">
      {#if (userType === TeamRole.TEAM_OWNER && user.role === TeamRole.TEAM_MEMBER) || (userType === TeamRole.TEAM_ADMIN && user.role === TeamRole.TEAM_MEMBER)}
        <Select
          id={"profile" + user.id}
          data={getPermissionsData()}
          titleId={user.role ? user.role : ""}
          onclick={handleDropdown}
          menuItem={"v2"}
          bodyTheme={"violet"}
          headerTheme={"violet"}
          borderType={"none"}
          disabled={owner}
          headerFontSize={"10px"}
          headerFontWeight={400}
          borderRounded={"4px"}
        />
      {:else if (userType === TeamRole.TEAM_OWNER && user.role === TeamRole.TEAM_ADMIN) || (userType === TeamRole.TEAM_ADMIN && user.role === TeamRole.TEAM_ADMIN)}
        <Select
          id={"profile" + user.id}
          data={getPermissionsData()}
          titleId={user.role ? user.role : ""}
          onclick={handleDropdown}
          menuItem={"v2"}
          headerTheme={"violet"}
          bodyTheme={"violet"}
          borderType={"none"}
          disabled={owner}
          headerFontSize={"10px"}
          headerFontWeight={400}
          borderRounded={"4px"}
        />
      {:else}
        <Select
          id={"profile" + user.id}
          data={getPermissionsData()}
          titleId={user.role ? user.role : ""}
          onclick={handleDropdown}
          menuItem={"v2"}
          headerTheme={"transparent"}
          borderType={"none"}
          disabled={true}
          headerFontSize={"10px"}
          position={"absolute"}
        />
      {/if}
    </div>
  </div>
</div>

<hr style="color: var(--text-secondary-400 ); margin-bottom:4px" />

<div class="team-workspace mb-1 sparrow-fs-14">
  {#each workspaces as workspace}
    {#if workspace.position}
      <ProfileWorkspace
        {teamRole}
        {workspace}
        {userType}
        {user}
        {owner}
        {userId}
        {workspaceCount}
        {handleMemberPopUpSuccess}
        {onRemoveUserFromWorkspace}
        {onChangeUserRoleAtWorkspace}
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
