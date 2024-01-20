<script lang="ts">
  import RemoveConfirmationPopup from "$lib/components/Modal/RemoveConfirmationPopup.svelte";

  import MemberChangeRolePopup from "$lib/components/Modal/MemberChangeRolePopup.svelte";
  import MemberDropdown from "$lib/components/dropdown/MemberDropdown.svelte";
  import type {
    TeamRepositoryMethods,
    TeamServiceMethods,
  } from "$lib/utils/interfaces";
  export let user;
  export let userType;
  export let activeTeam;
  export let teamServiceMethods: TeamServiceMethods;
  export let teamRepositoryMethods: TeamRepositoryMethods;

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

  const handleMemberPopUpCancel = (flag) => {
    isMemberRemovePopup = flag;
  };
  const handleMemberPromotePopUpCancel = (flag) => {
    isMemberPromotePopup = flag;
  };

  const handleMemberDemotePopUpCancel = (flag) => {
    isMemberDemotePopup = flag;
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
    isMemberDemotePopup = false;
  };
  const handleMemberPromotePopUpSuccess = async () => {
    const response = await teamServiceMethods.promoteToAdminAtTeam(
      activeTeam.teamId,
      user.id,
    );
    teamRepositoryMethods.modifyTeam(activeTeam.teamId, response);
    isMemberPromotePopup = false;
  };
</script>

{#if isMemberRemovePopup}
  <RemoveConfirmationPopup
    title={`Remove user?`}
    description={`<p>
      Are you sure you want to remove <span
        style="font-weight:700;"
        class="text-whiteColor">"${user.name}"</span
      >
      ? They will lose access to the <span
        style="font-weight:700;"
        class="text-whiteColor">"${activeTeam?.name}"</span> team.
    </p>`}
    onSuccess={handleMemberPopUpSuccess}
    onCancel={handleMemberPopUpCancel}
  />
{/if}

{#if isMemberPromotePopup}
  <MemberChangeRolePopup
    title={`Changing Role?`}
    description={`<p>
    Upon transitioning an Member to Admin, 'Edit' access will be automatically provided for all assigned workspaces.</p>`}
    onSuccess={handleMemberPromotePopUpSuccess}
    onCancel={handleMemberPromotePopUpCancel}
  />
{/if}

{#if isMemberDemotePopup}
  <MemberChangeRolePopup
    title={`Changing Role?`}
    description={`<p>
    Upon transitioning an Admin to a Member, 'Edit' access will be automatically provided for all assigned workspaces.</p>`}
    onSuccess={handleMemberDemotePopUpSuccess}
    onCancel={handleMemberDemotePopUpCancel}
  />
{/if}
<div class="d-flex tile">
  <div class="info d-flex">
    <div class="icon d-flex align-items-center justify-content-center">
      <span>{user.name[0].toUpperCase()}</span>
    </div>
    <div class="name px-2">
      <span>{user.name}</span><br />
      <span>{user.email}</span>
    </div>
  </div>
  <div class="position">
    {#if userType === "owner"}
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
    {:else if userType === "admin" && user.role === "member"}
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
    {:else if userType === "admin" && user.role === "admin"}
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
    width: 40px;
    height: 36px;
    background-color: var(--background-dropdown) !important;
    border-radius: 50%;
  }
  .info {
    width: calc(100% - 100px);
    height: 36px;
  }
  .position {
    width: 100px;
  }
</style>
