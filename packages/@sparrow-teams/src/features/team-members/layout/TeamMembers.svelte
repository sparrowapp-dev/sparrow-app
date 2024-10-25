<script lang="ts">
  import { SearchIcon } from "@sparrow/library/assets";
  import { CrossIcon } from "@sparrow/library/icons";
  import { Member } from "../components";
  export let openTeam;
  export let workspaces = [];

  export let userId: string = "";
  export let userType: string = "";

  /**
   * function to remove members from team
   */
  export let onRemoveMembersAtTeam;
  /**
   * function to demote admins at team
   */
  export let onDemoteToMemberAtTeam;
  /**
   * function to promote to admin at team
   */
  export let onPromoteToAdminAtTeam;
  /**
   * function to promote to owner at team
   */
  export let onPromoteToOwnerAtTeam;
  /**
   * function to remove member from workspace
   */
  export let onRemoveUserFromWorkspace;
  /**
   * function to change user role at workspace
   */
  export let onChangeUserRoleAtWorkspace;

  let filterText: string = "";

  const handleEraseSearch = () => {
    filterText = "";
  };
  let filteredUser = [];
  const calculateFilteredUser = () => {
    filteredUser = openTeam?.users?.filter((elem) => {
      if (
        elem.name.toLowerCase().includes(filterText.toLowerCase()) ||
        elem.role.toLowerCase().includes(filterText.toLowerCase()) ||
        elem.email.toLowerCase().includes(filterText.toLowerCase())
      ) {
        return true;
      } else return false;
    });
  };
  $: {
    if (openTeam) {
      calculateFilteredUser();
    }
  }
  $: {
    if (filterText) {
      calculateFilteredUser();
    }
    if (!filterText) {
      calculateFilteredUser();
    }
  }
</script>

<div class="py-2 h-100 d-flex flex-column">
  <section>
    <div
      class={`d-flex search-input-container rounded mb-4 align-items-center`}
    >
      <div>
        <SearchIcon
          width={14}
          height={14}
          classProp={`my-auto `}
          color={"var(--icon-secondary-200)"}
        />
      </div>
      <input
        type="text"
        id="search-input-team-member"
        class={`bg-transparent ms-2 w-100 border-0 my-auto`}
        placeholder="Search people in {openTeam?.name}"
        bind:value={filterText}
      />
      {#if filterText !== ""}
        <div class="clear-icon" on:click={handleEraseSearch}>
          <CrossIcon
            height="16px"
            width="12px"
            color="var(--icon-secondary-300)"
          />
        </div>
      {/if}
    </div>
  </section>
  <section style="flex:1; overflow:auto;">
    {#if filteredUser}
      {#each filteredUser as user}
        {#if user.id === userId}
          <Member
            owner={true}
            {user}
            {userType}
            {openTeam}
            workspaces={workspaces.filter((elem) => {
              return elem?.team?.teamId === openTeam?.teamId;
            })}
            {userId}
            {onRemoveMembersAtTeam}
            {onDemoteToMemberAtTeam}
            {onPromoteToAdminAtTeam}
            {onPromoteToOwnerAtTeam}
            {onRemoveUserFromWorkspace}
            {onChangeUserRoleAtWorkspace}
          />
          <hr />
        {/if}
      {/each}
      {#each filteredUser as user}
        {#if user.id !== userId}
          <Member
            {user}
            {userType}
            {openTeam}
            workspaces={workspaces.filter((elem) => {
              return elem?.team?.teamId === openTeam?.teamId;
            })}
            {userId}
            {onRemoveMembersAtTeam}
            {onDemoteToMemberAtTeam}
            {onPromoteToAdminAtTeam}
            {onPromoteToOwnerAtTeam}
            {onRemoveUserFromWorkspace}
            {onChangeUserRoleAtWorkspace}
          />
        {/if}
      {/each}
    {/if}
    {#if !filteredUser?.length}
      <p class="not-found-text mt-3">No result found.</p>
    {/if}
  </section>
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

  .search-input-container {
    border: 1px solid var(--border-color);
    background: var(--bg-tertiary-400);
    width: 27vw;
    font-size: 12px;
    position: relative;
    border: 1px solid transparent;
    padding: 8px;
  }

  .search-input-container > input:focus {
    outline: none;
    caret-color: var(--workspace-hover-color);
  }
  .search-input-container:focus-within {
    border: 1px solid var(--workspace-hover-color);
  }

  .search-input-container:hover {
    border: 1px solid var(--border-primary-300);
    caret-color: var(--border-primary-300);
  }
  .search-input-container:focus-within {
    border-color: var(--border-primary-300);
    caret-color: var(--border-primary-300);
  }
  .not-found-text {
    color: var(--request-arc);
    font-size: 16px;
    font-weight: 400;
    text-align: center;
  }
  .clear-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    font-size: 16px;
  }
</style>
