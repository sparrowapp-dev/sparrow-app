<script lang="ts">
  import RemoveConfirmationPopup from "$lib/components/Modal/RemoveConfirmationPopup.svelte";

  import MemberChangeRolePopup from "$lib/components/Modal/MemberChangeRolePopup.svelte";
  import MemberDropdown from "$lib/components/dropdown/MemberDropdown.svelte";
  import type {
    TeamRepositoryMethods,
    TeamServiceMethods,
  } from "$lib/utils/interfaces";
  import MemberInfoPopup from "../member-info-popup/MemberInfoPopup.svelte";
  import { notifications } from "$lib/utils/notifications";
  import { TeamRole } from "$lib/utils/enums/team.enum";
  import { v4 as uuidv4 } from "uuid";
  export let user;
  export let userType;
  export let openTeam;
  export let teamServiceMethods: TeamServiceMethods;
  export let teamRepositoryMethods: TeamRepositoryMethods;
  export let workspaces;
  export let userId;
  export let owner: boolean = false;

  const handleDropdown = (id) => {
    if (id === "remove") {
      isMemberRemovePopup = true;
    } else if (user.role === TeamRole.ADMIN && id === TeamRole.MEMBER) {
      isMemberDemotePopup = true;
    } else if (user.role === TeamRole.MEMBER && id === TeamRole.ADMIN) {
      isMemberPromotePopup = true;
    } else if (user.role === TeamRole.ADMIN && id === TeamRole.OWNER) {
      isMemberOwnershipPopup = true;
    }
  };
  let isMemberRemovePopup = false;
  let isMemberPromotePopup = false;
  let isMemberDemotePopup = false;
  let isMemberInfoPopup = false;
  let isMemberOwnershipPopup = false;

  const handleMemberPopUpCancel = (flag) => {
    isMemberRemovePopup = flag;
  };
  const handleMemberPromotePopUpCancel = (flag) => {
    isMemberPromotePopup = flag;
  };

  const handleMemberDemotePopUpCancel = (flag) => {
    isMemberDemotePopup = flag;
  };
  const handleMemberInfoPopUpCancel = (flag) => {
    isMemberInfoPopup = flag;
  };

  const handleMemberOwnershipPopUpCancel = (flag) => {
    isMemberOwnershipPopup = flag;
  };

  const handleMemberPopUpSuccess = async () => {
    const response = await teamServiceMethods.removeMembersAtTeam(
      openTeam.teamId,
      user.id,
    );
    if (response) {
      teamRepositoryMethods.modifyTeam(openTeam.teamId, response);
      await teamServiceMethods.refreshWorkspace(userId);
      isMemberRemovePopup = false;
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
      isMemberDemotePopup = false;
      notifications.success(`${user.name} is now a member`);
    } else {
      notifications.error(
        `Failed to change role for ${user.name}. Please try again.`,
      );
    }
  };
  const handleMemberPromotePopUpSuccess = async () => {
    const response = await teamServiceMethods.promoteToAdminAtTeam(
      openTeam.teamId,
      user.id,
    );
    if (response) {
      teamRepositoryMethods.modifyTeam(openTeam.teamId, response);
      await teamServiceMethods.refreshWorkspace(userId);
      isMemberPromotePopup = false;
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
      isMemberOwnershipPopup = false;
      notifications.success(
        `${user.name} is now the new Owner of ${openTeam.name}.`,
      );
    } else {
      notifications.error(
        `Failed to update access of Owner. Please try again.`,
      );
    }
  };
</script>

{#if isMemberRemovePopup}
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
    onCancel={handleMemberPopUpCancel}
  />
{/if}

{#if isMemberPromotePopup}
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
      <li>Create New Workspaces.</li>
      <li>Send Invites.</li>
      <li>Change role of Admin and Members.</li>
      <li>View/edit all the workspaces in the team.</li>
      <li>See all the user, their email and roles.</li>
      <li>See access details of a user.</li>
    </ul>
    `}
    onSuccess={handleMemberPromotePopUpSuccess}
    onCancel={handleMemberPromotePopUpCancel}
  />
{/if}

{#if isMemberDemotePopup}
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
    onCancel={handleMemberDemotePopUpCancel}
  />
{/if}

{#if isMemberOwnershipPopup}
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
    onCancel={handleMemberOwnershipPopUpCancel}
  />
{/if}

{#if isMemberInfoPopup}
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
    onCancel={handleMemberInfoPopUpCancel}
    {handleMemberPopUpCancel}
    {handleMemberPromotePopUpCancel}
    {handleMemberDemotePopUpCancel}
    {handleMemberOwnershipPopUpCancel}
    {teamServiceMethods}
    {handleMemberPopUpSuccess}
  />
{/if}
<div class="d-flex tile rounded align-items-center">
  <div
    class="info d-flex align-items-center"
    on:click={() => {
      isMemberInfoPopup = true;
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
    {#if (userType === TeamRole.OWNER && user.role === TeamRole.MEMBER) || (userType === TeamRole.ADMIN && user.role === TeamRole.MEMBER)}
      <MemberDropdown
        id={user.id + uuidv4()}
        data={[
          {
            name: "Admin",
            id: TeamRole.ADMIN,
            color: "whiteColor",
          },
          {
            name: "Member",
            id: TeamRole.MEMBER,
            color: "whiteColor",
          },
          {
            name: "Remove",
            id: "remove",
            color: "dangerColor",
          },
        ]}
        method={user.role ? user.role : ""}
        onclick={handleDropdown}
      />
    {:else if userType === TeamRole.OWNER && user.role === TeamRole.ADMIN}
      <MemberDropdown
        id={user.id + uuidv4()}
        data={[
          {
            name: "Owner",
            id: TeamRole.OWNER,
            color: "whiteColor",
          },
          {
            name: "Admin",
            id: TeamRole.ADMIN,
            color: "whiteColor",
          },
          {
            name: "Member",
            id: TeamRole.MEMBER,
            color: "whiteColor",
          },
          {
            name: "Remove",
            id: "remove",
            color: "dangerColor",
          },
        ]}
        method={user.role ? user.role : ""}
        onclick={handleDropdown}
      />
    {:else}
      <MemberDropdown
        id={user.id + uuidv4()}
        disabled={true}
        data={[
          {
            name: "Owner",
            id: TeamRole.OWNER,
            color: "whiteColor",
          },
          {
            name: "Admin",
            id: TeamRole.ADMIN,
            color: "whiteColor",
          },
          {
            name: "Member",
            id: TeamRole.MEMBER,
            color: "whiteColor",
          },
        ]}
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
