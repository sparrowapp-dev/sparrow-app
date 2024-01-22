<script lang="ts">
  import { user } from "$lib/store/auth.store";
  import Tile from "$lib/components/workspace/members/Tile.svelte";
  import type {
    TeamRepositoryMethods,
    TeamServiceMethods,
  } from "$lib/utils/interfaces";
  import { onDestroy } from "svelte";
  export let activeTeam;
  export let teamServiceMethods: TeamServiceMethods;
  export let teamRepositoryMethods: TeamRepositoryMethods;
  export let workspaces = [];

  export let userId: string = "";
  export let userType: string = "";
</script>

<section>
  {#if activeTeam?.users}
    {#each activeTeam?.users as user}
      {#if user.id === userId}
        <Tile
          owner={true}
          {user}
          {userType}
          {activeTeam}
          workspaces={workspaces.filter((elem) => {
            return elem?.team?.teamId === activeTeam?.teamId;
          })}
          {teamServiceMethods}
          {teamRepositoryMethods}
          {userId}
        />
      {/if}
    {/each}
    <hr />
    {#each activeTeam?.users as user}
      {#if user.id !== userId}
        <Tile
          {user}
          {userType}
          {activeTeam}
          workspaces={workspaces.filter((elem) => {
            return elem?.team?.teamId === activeTeam?.teamId;
          })}
          {teamServiceMethods}
          {teamRepositoryMethods}
          {userId}
        />
      {/if}
    {/each}
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
</style>
