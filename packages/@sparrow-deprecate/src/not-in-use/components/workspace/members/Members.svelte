<script lang="ts">
  import { SearchIcon, CrossIcon } from "@deprecate/assets/app.asset";
  import Tile from "@deprecate/components/workspace/members/Tile.svelte";
  import type {
    TeamRepositoryMethods,
    TeamServiceMethods,
  } from "@deprecate/utils/interfaces";
  export let openTeam;
  export let teamServiceMethods: TeamServiceMethods;
  export let teamRepositoryMethods: TeamRepositoryMethods;
  export let workspaces = [];

  export let userId: string = "";
  export let userType: string = "";

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

<section>
  <div class={`d-flex search-input-container rounded py-2 px-2 mb-4`}>
    <SearchIcon width={14} height={14} classProp={`my-auto me-3`} />
    <input
      type="text"
      id="search-input-team-member"
      class={`bg-transparent w-100 border-0 my-auto`}
      placeholder="Search people in {openTeam?.name}"
      bind:value={filterText}
    />
    {#if filterText !== ""}
      <button class="border-0 bg-transparent ms-2" on:click={handleEraseSearch}>
        <CrossIcon color="#45494D" />
      </button>
    {/if}
  </div>
</section>
<section class="member-list">
  {#if filteredUser}
    {#each filteredUser as user}
      {#if user.id === userId}
        <Tile
          owner={true}
          {user}
          {userType}
          {openTeam}
          workspaces={workspaces.filter((elem) => {
            return elem?.team?.teamId === openTeam?.teamId;
          })}
          {teamServiceMethods}
          {teamRepositoryMethods}
          {userId}
        />
        <hr />
      {/if}
    {/each}
    {#each filteredUser as user}
      {#if user.id !== userId}
        <Tile
          {user}
          {userType}
          {openTeam}
          workspaces={workspaces.filter((elem) => {
            return elem?.team?.teamId === openTeam?.teamId;
          })}
          {teamServiceMethods}
          {teamRepositoryMethods}
          {userId}
        />
      {/if}
    {/each}
  {/if}
  {#if !filteredUser?.length}
    <p class="not-found-text mt-3">No results found.</p>
  {/if}
</section>

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
    background: var(--background-color);
    width: 27vw;
    font-size: 12px;
  }
  .search-input-container > input:focus {
    outline: none;
    caret-color: var(--workspace-hover-color);
  }
  .search-input-container:focus-within {
    border: 1px solid var(--workspace-hover-color);
  }
  .not-found-text {
    color: var(--request-arc);
    font-size: 16px;
    font-weight: 400;
    text-align: center;
  }
  .member-list {
    height: calc(100vh - 310px);
    overflow-y: auto;
  }
</style>
