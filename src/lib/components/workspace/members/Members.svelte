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

  let userId: string = "";
  let userType: string = "";
  const unsubscribeUser = user.subscribe((value) => {
    if (value) {
      userId = value._id;
    }
  });
  const findUserType = () => {
    activeTeam?.users.forEach((user) => {
      if (user.id === userId) {
        userType = user.role;
      }
    });
  };
  $: {
    if (userId) {
      findUserType();
    }
  }
  $: {
    if (activeTeam) {
      findUserType();
    }
  }
  onDestroy(() => {
    unsubscribeUser();
  });
</script>

<section>
  {#if activeTeam?.users}
    {#each activeTeam?.users as user}
      {#if user.id === userId}
        <div class="d-flex tile">
          <div class="info d-flex">
            <div class="icon d-flex align-items-center justify-content-center">
              <span>{user.name[0].toUpperCase()}</span>
            </div>
            <div class="name px-2">
              <span>{user.name} (You)</span><br />
              <span>{user.email}</span>
            </div>
          </div>
          <div class="position">
            {user.role}
          </div>
        </div>
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
