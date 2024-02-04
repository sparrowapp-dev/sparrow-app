<script lang="ts">
  import RemoveConfirmationPopup from "$lib/components/Modal/RemoveConfirmationPopup.svelte";
  import MemberChangeRolePopup from "$lib/components/Modal/MemberChangeRolePopup.svelte";
  import MemberDropdown from "$lib/components/dropdown/MemberDropdown.svelte";
  import type {
    TeamRepositoryMethods,
    TeamServiceMethods,
    userDetails,
    workspaceDocumentWithPosition,
  } from "$lib/utils/interfaces";
  import MemberInfoPopup from "../member-info-popup/MemberInfoPopup.svelte";
  import { notifications } from "$lib/utils/notifications";
  import { TeamRole } from "$lib/utils/enums/team.enum";
  import { v4 as uuidv4 } from "uuid";
  import { AdminLevelPermission } from "$lib/utils/constants/permissions.constant";
  import type { MemberPopType } from "$lib/utils/types/common.type";
  export let user: userDetails;
  export let userType: TeamRole;
  export let openTeam;
  export let teamServiceMethods: TeamServiceMethods;
  export let teamRepositoryMethods: TeamRepositoryMethods;
  export let workspaces: workspaceDocumentWithPosition;
  export let userId: string;
  export let owner: boolean = false;

  const handleDropdown = (id: TeamRole | "remove") => {
    if (id === "remove") {
      memberPopObj.isMemberRemovePopup = true;
    } else if (
      user.role === TeamRole.TEAM_ADMIN &&
      id === TeamRole.TEAM_MEMBER
    ) {
      memberPopObj.isMemberDemotePopup = true;
    } else if (
      user.role === TeamRole.TEAM_MEMBER &&
      id === TeamRole.TEAM_ADMIN
    ) {
      memberPopObj.isMemberPromotePopup = true;
    } else if (
      user.role === TeamRole.TEAM_ADMIN &&
      id === TeamRole.TEAM_OWNER
    ) {
      memberPopObj.isMemberOwnershipPopup = true;
    }
  };
  const memberPopObj={
    isMemberRemovePopup:false,
    isMemberPromotePopup:false,
    isMemberDemotePopup :false,
     isMemberInfoPopup:false,
    isMemberOwnershipPopup:false,
  }
 
  const handlePopup = (flag: boolean, popType: MemberPopType): void => {
    switch (popType) {
      case "isMemberRemovePopup":
        memberPopObj.isMemberRemovePopup = flag;
        break;
      case "isMemberPromotePopup":
        memberPopObj.isMemberPromotePopup = flag;
        break;
      case "isMemberDemotePopup":
        memberPopObj.isMemberDemotePopup = flag;
        break;
      case "isMemberInfoPopup":
        memberPopObj.isMemberInfoPopup = flag;
        break;
      case "isMemberOwnershipPopup":
        memberPopObj.isMemberOwnershipPopup = flag;
        break;
      default:
        break;
    }
  };
  
  const handleMemberPopUpSuccess = async () => {
    const response = await teamServiceMethods.removeMembersAtTeam(
      openTeam.teamId,
      user.id,
    );
    if (response) {
      teamRepositoryMethods.modifyTeam(openTeam.teamId, response);
      await teamServiceMethods.refreshWorkspace(userId);
      memberPopObj.isMemberRemovePopup = false;
      notifications.success(`${user.name} is removed from ${openTeam.name}`);
    } else {
      notifications.error(
        `Failed to remove ${user.name} from ${openTeam.name}`,
      );
    }
  };
  const handleMemberDemotePopUpSuccess = async () => {
    const response = await teamServiceMethods.demoteToMemberAtTeam(
      openTeam.teamId,
      user.id,
    );
    if (response) {
      teamRepositoryMethods.modifyTeam(openTeam.teamId, response);
      await teamServiceMethods.refreshWorkspace(userId);
      memberPopObj.isMemberDemotePopup = false;
      notifications.success(`${user.name} is now a member`);
    } else {
      notifications.error(
        `Failed to change role for ${user.name}. Please try again.`,
      );
    }
  };
  export const handleMemberPromotePopUpSuccess = async () => {
    const response = await teamServiceMethods.promoteToAdminAtTeam(
      openTeam.teamId,
      user.id,
    );
    if (response) {
      teamRepositoryMethods.modifyTeam(openTeam.teamId, response);
      await teamServiceMethods.refreshWorkspace(userId);
      memberPopObj.isMemberPromotePopup = false;
      notifications.success(`${user.name} is now an admin`);
    } else {
      notifications.error(
        `Failed to change role for ${user.name}. Please try again.`,
      );
    }
  };

  const handleMemberOwnershipPopUpSuccess = async () => {
    const response = await teamServiceMethods.promoteToOwnerAtTeam(
      openTeam.teamId,
      user.id,
    );
    if (response) {
      teamRepositoryMethods.modifyTeam(openTeam.teamId, response);
      await teamServiceMethods.refreshWorkspace(userId);
      memberPopObj.isMemberOwnershipPopup = false;
      notifications.success(
        `${user.name} is now the new Owner of ${openTeam.name}.`,
      );
    } else {
      notifications.error(
        `Failed to update access of Owner. Please try again.`,
      );
    }
  };
  export let getPermissionsData = () => {
    const commonPermissions = [
      {
        name: "Admin",
        id: TeamRole.TEAM_ADMIN,
        color: "whiteColor",
      },
      {
        name: "Member",
        id: TeamRole.TEAM_MEMBER,
        color: "whiteColor",
      },
    ];
    if (
      (userType === TeamRole.TEAM_OWNER &&
        user.role === TeamRole.TEAM_MEMBER) ||
      (userType === TeamRole.TEAM_ADMIN && user.role === TeamRole.TEAM_MEMBER)
    ) {
      return [
        ...commonPermissions,
        {
          name: "Remove",
          id: "remove",
          color: "dangerColor",
        },
      ];
    } else if (
      userType === TeamRole.TEAM_OWNER &&
      user.role === TeamRole.TEAM_ADMIN
    ) {
      return [
        {
          name: "Owner",
          id: TeamRole.TEAM_OWNER,
          color: "whiteColor",
        },
        ...commonPermissions,
        {
          name: "Remove",
          id: "remove",
          color: "dangerColor",
        },
      ];
    } else {
      return [
        {
          name: "Owner",
          id: TeamRole.TEAM_OWNER,
          color: "whiteColor",
        },
        ...commonPermissions,
      ];
    }
  };
</script>

{#if memberPopObj.isMemberRemovePopup}
  <RemoveConfirmationPopup
    title={`Remove user?`}
    description={`<p style="font-size:12px;" class="text-textColor">
      Are you sure you want to remove <span
        class="text-whiteColor">"${user.name}"</span
      >
      ? They will lose access to the <span
        class="text-whiteColor">"${openTeam?.name}"</span> team.
    </p>`}
    onSuccess={handleMemberPopUpSuccess}
    onCancel={() => {
      handlePopup(false, "isMemberRemovePopup");
    }}
  />
{/if}

{#if memberPopObj.isMemberPromotePopup}
  <MemberChangeRolePopup
    title={`Changing Role?`}
    teamName={openTeam?.name}
    teamLogo={openTeam?.logo}
    description={`
    <div class="d-flex tile rounded mb-3">
  <div
    class="info d-flex align-items-center"
  >
    <div class="d-flex align-items-center justify-content-center" style="width: 36px;
    border: 1px solid var(--border-color);
    height: 36px;
    border-radius: 50%;">
      <span>${user.name[0].toUpperCase()}</span>
    </div>
    <div class="name px-2">
      <span style="font-size:12px;" class="text-whiteColor">${
        user.name
      }</span><br />
      <span style="font-size:12px;" class="text-textColor">${user.email}</span>
    </div>
  </div>
</div>
    
    <p style="font-size:12px;" class="text-textColor">
    You are assigning the role of an '<span class="text-whiteColor">Admin</span>' to ${
      user.name
    }. Following access will be provided to ${user.name}:</p>
    <ul class="ps-4 text-textColor" style="font-size:12px;">
      ${AdminLevelPermission.map((element) => {
        return `<li>${element}</li>`;
      }).join("")}
    </ul>
    `}
    onSuccess={handleMemberPromotePopUpSuccess}
    onCancel={() => {
      handlePopup(false, "isMemberPromotePopup");
    }}
  />
{/if}

{#if memberPopObj.isMemberDemotePopup}
  <MemberChangeRolePopup
    title={`Changing Role?`}
    teamName={openTeam?.name}
    teamLogo={openTeam?.logo}
    description={`
      <div class="d-flex tile rounded mb-3">
    <div
      class="info d-flex align-items-center"
    >
      <div class="d-flex align-items-center justify-content-center" style="width: 36px;
      border: 1px solid var(--border-color);
      height: 36px;
      border-radius: 50%;">
        <span>${user.name[0].toUpperCase()}</span>
      </div>
      <div class="name px-2">
        <span style="font-size:12px;" class="text-whiteColor">${
          user.name
        }</span><br />
        <span style="font-size:12px;" class="text-textColor">${
          user.email
        }</span>
      </div>
    </div>
  </div>
      
      <p style="font-size:12px;" class="text-textColor">
        Upon transitioning an Admin to a Member, 'Edit' access will be automatically provided for all assigned workspaces.</p>
      
      `}
    onSuccess={handleMemberDemotePopUpSuccess}
    onCancel={() => {
      handlePopup(false, "isMemberDemotePopup");
    }}
  />
{/if}

{#if memberPopObj.isMemberOwnershipPopup}
  <MemberChangeRolePopup
    auth={true}
    title={`Changing Role?`}
    teamName={openTeam?.name}
    teamLogo={openTeam?.logo}
    description={`
      <div class="d-flex tile rounded mb-3">
    <div
      class="info d-flex align-items-center"
    >
      <div class="d-flex align-items-center justify-content-center" style="width: 36px;
      border: 1px solid var(--border-color);
      height: 36px;
      border-radius: 50%;">
        <span>${user.name[0].toUpperCase()}</span>
      </div>
      <div class="name px-2">
        <span style="font-size:12px;" class="text-whiteColor">${
          user.name
        }</span><br />
        <span style="font-size:12px;" class="text-textColor">${
          user.email
        }</span>
      </div>
    </div>
  </div>
      
      <p style="font-size:12px;" class="text-textColor">
        You are assigning the role of <span class="text-whiteColor">‘Owner’</span> to ${
          user.name
        }. All the Owner’s access will be transferred to ${
          user.name
        } and you will be demoted to Admin. This action cannot be undone.  </p>
      
      `}
    onSuccess={handleMemberOwnershipPopUpSuccess}
    onCancel={()=>{handlePopup(false,"isMemberOwnershipPopup")}}
  />
{/if}

{#if memberPopObj.isMemberInfoPopup}
  <MemberInfoPopup
    {owner}
    title={`Access to ${openTeam.name}`}
    {user}
    workspaces={workspaces.map((elem) => {
      let element = elem.toMutableJSON();
      for (let i = 0; i < element.users.length; i++) {
        if (element.users[i].id === user.id) {
          element.position = elem.users[i].role;
          break;
        }
      }
      return element;
    })}
    {userType}
    {userId}
    onCancel={() => {
      handlePopup(false, "isMemberInfoPopup");
    }}
    {handlePopup}
    {teamServiceMethods}
    {handleMemberPopUpSuccess}
    {getPermissionsData}
  />
{/if}
<div class="d-flex tile rounded align-items-center">
  <div
    class="info d-flex align-items-center"
    on:click={() => {
      memberPopObj.isMemberInfoPopup = true;
    }}
  >
    <div class="icon d-flex align-items-center justify-content-center">
      <span>{user.name[0].toUpperCase()}</span>
    </div>
    <div class="name px-2">
      <span style="font-size:12px;" class="text-whiteColor"
        >{user.name} {owner ? "(You)" : ""}</span
      ><br />
      <span style="font-size:12px;" class="text-textColor">{user.email}</span>
    </div>
  </div>
  <div class="position">
    {#if (userType === TeamRole.TEAM_OWNER && user.role === TeamRole.TEAM_MEMBER) || (userType === TeamRole.TEAM_ADMIN && user.role === TeamRole.TEAM_MEMBER)}
      <MemberDropdown
        id={user.id + uuidv4()}
        data={getPermissionsData()}
        method={user.role ? user.role : ""}
        onclick={handleDropdown}
      />
    {:else if userType === TeamRole.TEAM_OWNER && user.role === TeamRole.TEAM_ADMIN}
      <MemberDropdown
        id={user.id + uuidv4()}
        data={getPermissionsData()}
        method={user.role ? user.role : ""}
        onclick={handleDropdown}
      />
    {:else}
      <MemberDropdown
        id={user.id + uuidv4()}
        disabled={true}
        data={getPermissionsData()}
        method={user.role ? user.role : ""}
        onclick={handleDropdown}
      />
    {/if}
  </div>
</div>

<style>
  .tile:hover {
    background-color: var(--background-light) !important;
  }
  .icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid var(--border-color);
  }
  .info {
    width: calc(100% - 120px);
    height: 48px;
    padding: 8px !important;
  }
  .position {
    width: 120px;
    padding: 8px;
  }
</style>
