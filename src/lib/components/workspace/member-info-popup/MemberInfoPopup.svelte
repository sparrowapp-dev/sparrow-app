<script lang="ts">
  import closeIcon from "$lib/assets/close.svg";
  import MemberDropdown from "$lib/components/dropdown/MemberDropdown.svelte";
  import { fly, fade } from "svelte/transition";
  import MemberWorkspace from "../member-worspace/MemberWorkspace.svelte";
  import { TeamRole } from "$lib/utils/enums/team.enum";
  import type {
    TeamRepositoryMethods,
    TeamServiceMethods,
  } from "$lib/utils/interfaces";

  export let title;
  export let user;
  export let workspaces;
  export let onCancel;
  export let userType;
  export let handleMemberPromotePopUpCancel;
  export let handleMemberDemotePopUpCancel;
  export let handleMemberPopUpCancel;
  export let handleMemberOwnershipPopUpCancel;
  export let owner: boolean = false;
  export let teamServiceMethods: TeamServiceMethods;
  export let userId: string;
  export let handleMemberPopUpSuccess;
  export let getPermissionsData;

  const handleDropdown = (id) => {
    if (id === "remove") {
      handleMemberPopUpCancel(true);
    } else if (user.role === TeamRole.ADMIN && id === TeamRole.MEMBER) {
      handleMemberDemotePopUpCancel(true);
    } else if (user.role === TeamRole.MEMBER && id === TeamRole.ADMIN) {
      handleMemberPromotePopUpCancel(true);
    } else if (user.role === TeamRole.ADMIN && id === TeamRole.OWNER) {
      handleMemberOwnershipPopUpCancel(true);
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

<div class="environment-delete-popup">
  <div
    class="background-overlay"
    on:click={() => {
      onCancel(false);
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
      <h5 class="mb-0 text-whiteColor" style="font-weight: 500;">
        {title}
      </h5>
      <button
        class="btn-close1 border-0 rounded"
        on:click={() => {
          onCancel(false);
        }}
      >
        <img src={closeIcon} alt="" />
      </button>
    </div>
    <div>
      <div class="d-flex tile">
        <div class="info d-flex">
          <div class="icon d-flex align-items-center justify-content-center">
            <span>{user.name[0].toUpperCase()}</span>
          </div>
          <div class="name px-2">
            <span style="font-size:12px;" class="text-whiteColor"
              >{user.name} {owner ? "(You)" : ""}</span
            ><br />
            <span style="font-size:12px;" class="text-textColor"
              >{user.email}</span
            >
          </div>
        </div>
        <div class="position">
          {#if (userType === TeamRole.OWNER && user.role === TeamRole.MEMBER) || (userType === TeamRole.ADMIN && user.role === TeamRole.MEMBER)}
            <MemberDropdown
              id={user.id}
              data={getPermissionsData()}
              method={user.role ? user.role : ""}
              onclick={handleDropdown}
            />
          {:else if userType === TeamRole.OWNER && user.role === TeamRole.ADMIN}
            <MemberDropdown
              id={user.id}
              data={getPermissionsData()}
              method={user.role ? user.role : ""}
              onclick={handleDropdown}
            />
          {:else}
            <MemberDropdown
              id={user.id}
              disabled={true}
              data={getPermissionsData()}
              method={user.role ? user.role : ""}
              onclick={handleDropdown}
            />
          {/if}
        </div>
      </div>
    </div>
    <hr />
    <div style="font-size: 14px;" class="team-workspace mb-1">
      {#each workspaces as workspace}
        {#if workspace.position}
          <MemberWorkspace
            {workspace}
            {userType}
            {user}
            {teamServiceMethods}
            {userId}
            {workspaceCount}
            {handleMemberPopUpSuccess}
          />
        {/if}
      {/each}
    </div>
    <div
      class="d-flex align-items-center justify-content-end gap-3 mt-1 mb-0 rounded"
      style="font-size: 16px;"
    ></div>
  </div>
</div>

<style lang="scss">
  .environment-delete-popup {
    .background-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: var(--background-hover);
      -webkit-backdrop-filter: blur(3px);
      backdrop-filter: blur(3px);
      z-index: 7;
    }

    .container {
      display: flex;
      flex-direction: column;
      position: fixed;
      max-width: 540px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: var(--background-color);
      z-index: 8;
      padding: 2%;
      border-radius: 10px;
    }

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
  }
</style>
