<script lang="ts">
  import { Member } from "../components";
  import { Search } from "@sparrow/library/forms";
  import VirtualScroll from "svelte-virtual-scroll-list";
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

  let filteredUser = [];
  const calculateFilteredUser = (
    _openTeam,
    _filterText: string = "",
    _userId: string,
  ) => {
    filteredUser = (_openTeam?.users ?? [])
      .filter((elem) => {
        const search = _filterText.toLowerCase();
        return (
          elem.name.toLowerCase().includes(search) ||
          elem.role.toLowerCase().includes(search) ||
          elem.email.toLowerCase().includes(search)
        );
      })
      .sort((a, b) => {
        if (a.id === _userId) return -1;
        if (b.id === _userId) return 1;
        return 0;
      });
  };

  $: {
    if (openTeam || filterText || userId) {
      calculateFilteredUser(openTeam, filterText, userId);
    }
  }
</script>

<div class="h-100 d-flex flex-column">
  <section>
    <div class={`d-flex  rounded pb-3 align-items-center`}>
      <div>
        <Search
          variant="primary"
          size="small"
          id="search-input-team-member"
          placeholder="Search people in {openTeam?.name}"
          bind:value={filterText}
          customWidth={"320px"}
        />
      </div>
    </div>
  </section>
  <section style="flex:1; overflow:auto;">
    {#if filteredUser?.length}
      <div style="height: 100%;">
        <VirtualScroll data={filteredUser} key="id" let:data>
          <div>
            <Member
              owner={data.id === userId}
              user={data}
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
            {#if data.id === userId}
              <hr />
            {/if}
          </div>
        </VirtualScroll>
      </div>
    {:else if filterText}
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
