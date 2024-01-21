<script lang="ts">
  import plus from "$lib/assets/plus.svg";
  import Tooltip from "$lib/components/tooltip/Tooltip.svelte";
  import { openedTeam } from "$lib/store/team.store";
  import type { CurrentTeam } from "$lib/utils/interfaces/team.interface";
  import { onDestroy } from "svelte";
  import { PeopleIcon } from "$lib/assets/app.asset";
  import { base64ToURL } from "$lib/utils/helpers";
  export let handleCreateTeamModal: any;
  export let teams: any;
  let currOpenedTeam: CurrentTeam;

  const handleOpenTeam = (
    teamId: string,
    teamName: string,
    teamBase64String: object,
  ) => {
    openedTeam.set({
      id: teamId,
      name: teamName,
      base64String: teamBase64String,
    });
  };

  const openedTeamSubscribe = openedTeam.subscribe((value) => {
    if (value) currOpenedTeam = value;
  });

  onDestroy(() => {
    openedTeamSubscribe();
  });
</script>

<section class="pb-4">
  <div class="sidebar-teams-header d-flex justify-content-between">
    <h6 class="teams-heading">Teams</h6>
    <div>
      <Tooltip text="New Team">
        <button
          class="new-team-btn rounded border-0"
          on:click={handleCreateTeamModal}
        >
          <img src={plus} alt="" />
        </button>
      </Tooltip>
    </div>
  </div>
  <div class="sidebar-teams-list sparrow-thin-scrollbar overflow-y-auto">
    {#each teams as team, index}
      <button
        class={`d-flex w-100 align-items-center justify-content-between rounded teams-outer border-0 ${
          currOpenedTeam.id == team.teamId && "active"
        }`}
        on:click={() => {
          handleOpenTeam(team.teamId, team.name, team.logo);
        }}
      >
        <div class="d-flex overflow-hidden">
          {#if base64ToURL(team.logo) == "" || base64ToURL(team.logo) == undefined}
            <p
              class={`m-0 text-defaultColor me-2 text-center align-items-center justify-content-center bg-transparent border-defaultColor `}
              style={`font-size: 15px; padding-top: 2px; width: 25px !important; height: 25px !important; display: flex; border: 1px solid #45494D; border-radius: 50%;`}
            >
              {team.name[0] ? team.name[0].toUpperCase() : ""}
            </p>
          {:else}
            <img src={base64ToURL(team.logo)} alt="" />
          {/if}
          <p class=" ellipsis overflow-hidden my-auto">{team.name}</p>
        </div>
        <PeopleIcon
          color={currOpenedTeam.id == team.teamId ? "#8A9299" : "#45494D"}
          classProp={team.users?.length <= 1 && "d-none"}
        />
      </button>
    {/each}
  </div>
</section>

<style>
  .teams-heading {
    font-size: 14px;
    font-weight: 700;
    line-height: 21px;
  }
  .teams-outer {
    padding: 8px 7px;
    background-color: transparent;
  }
  .teams-outer.active {
    background-color: var(--border-color);
  }
  .new-team-btn {
    background-color: transparent;
  }
  .new-team-btn:hover {
    background-color: var(--border-color);
  }
  .new-team-btn > img:hover {
    filter: invert(86%) sepia(37%) saturate(4292%) hue-rotate(180deg)
      brightness(101%) contrast(100%);
  }
  .teams-outer:hover {
    background-color: #313233;
  }
  .teams-outer img {
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }
  .sidebar-teams-list {
    max-height: 30vh;
  }
</style>
