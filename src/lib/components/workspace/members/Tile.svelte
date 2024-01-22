<script lang="ts">
  import RemoveConfirmationPopup from "$lib/components/Modal/RemoveConfirmationPopup.svelte";

  import MemberChangeRolePopup from "$lib/components/Modal/MemberChangeRolePopup.svelte";
  import MemberDropdown from "$lib/components/dropdown/MemberDropdown.svelte";
  import type {
    TeamRepositoryMethods,
    TeamServiceMethods,
  } from "$lib/utils/interfaces";
  import MemberInfoPopup from "../member-info-popup/MemberInfoPopup.svelte";
  import { HeaderDashboardViewModel } from "$lib/components/header/header-dashboard/HeaderDashboard.ViewModel";
  export let user;
  export let userType;
  export let activeTeam;
  export let teamServiceMethods: TeamServiceMethods;
  export let teamRepositoryMethods: TeamRepositoryMethods;
  export let workspaces;
  export let userId;
  export let owner: boolean = false;

  const hd = new HeaderDashboardViewModel();
  const handleDropdown = (id) => {
    if (id === "remove") {
      isMemberRemovePopup = true;
    } else if (user.role === "admin" && id === "member") {
      isMemberDemotePopup = true;
    } else if (user.role === "member" && id === "admin") {
      isMemberPromotePopup = true;
    }
  };
  let isMemberRemovePopup = false;
  let isMemberPromotePopup = false;
  let isMemberDemotePopup = false;
  let isMemberInfoPopup = false;

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
  const handleMemberPopUpSuccess = async () => {
    const response = await teamServiceMethods.removeMembersAtTeam(
      activeTeam.teamId,
      user.id,
    );
    teamRepositoryMethods.modifyTeam(activeTeam.teamId, response);
    isMemberRemovePopup = false;
  };
  const handleMemberDemotePopUpSuccess = async () => {
    const response = await teamServiceMethods.demoteToMemberAtTeam(
      activeTeam.teamId,
      user.id,
    );
    teamRepositoryMethods.modifyTeam(activeTeam.teamId, response);
    await hd.refreshWorkspaces(userId);
    isMemberDemotePopup = false;
  };
  const handleMemberPromotePopUpSuccess = async () => {
    const response = await teamServiceMethods.promoteToAdminAtTeam(
      activeTeam.teamId,
      user.id,
    );
    teamRepositoryMethods.modifyTeam(activeTeam.teamId, response);
    await hd.refreshWorkspaces(userId);
    isMemberPromotePopup = false;
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
        class="text-whiteColor">"${activeTeam?.name}"</span> team.
    </p>`}
    onSuccess={handleMemberPopUpSuccess}
    onCancel={handleMemberPopUpCancel}
  />
{/if}

{#if isMemberPromotePopup}
  <MemberChangeRolePopup
    title={`Changing Role?`}
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

{#if isMemberInfoPopup}
  <MemberInfoPopup
    {owner}
    title={`Access to ${activeTeam.name}`}
    {user}
    workspaces={workspaces.map((elem) => {
      for (let i = 0; i < elem.users.length; i++) {
        if (elem.users[i].id === user.id) {
          elem.position = elem.users[i].role;
          break;
        }
      }
      return elem;
    })}
    {userType}
    onCancel={handleMemberInfoPopUpCancel}
    {handleMemberPopUpCancel}
    {handleMemberPromotePopUpCancel}
    {handleMemberDemotePopUpCancel}
  />
{/if}
<div class="d-flex tile rounded">
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
    {#if (userType === "owner" && user.role === "member") || (userType === "admin" && user.role === "member")}
      <MemberDropdown
        id={user.id}
        data={[
          {
            name: "Admin",
            id: "admin",
            color: "whiteColor",
          },
          {
            name: "Member",
            id: "member",
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
    {:else if userType === "owner" && user.role === "admin"}
      <MemberDropdown
        id={user.id}
        data={[
          {
            name: "Owner",
            id: "owner",
            color: "whiteColor",
          },
          {
            name: "Admin",
            id: "admin",
            color: "whiteColor",
          },
          {
            name: "Member",
            id: "member",
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
        id={user.id}
        disabled={true}
        data={[
          {
            name: "Owner",
            id: "owner",
            color: "whiteColor",
          },
          {
            name: "Admin",
            id: "admin",
            color: "whiteColor",
          },
          {
            name: "Member",
            id: "member",
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
  .tile {
    padding: 8px;
  }
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
    width: calc(100% - 100px);
    height: 36px;
  }
  .position {
    width: 100px;
  }
</style>
