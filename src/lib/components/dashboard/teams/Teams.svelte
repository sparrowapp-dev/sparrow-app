<script lang="ts">
  import plus from "$lib/assets/plus.svg";
  import Tooltip from "$lib/components/tooltip/Tooltip.svelte";
  import { openedTeam } from "$lib/store/team.store";
  import type { CurrentTeam } from "$lib/utils/interfaces/team.interface";
  import { onDestroy } from "svelte";
  export let teams: any;
  let currOpenedTeam: CurrentTeam;
  const handleOpenTeam = (teamId: string, teamName) => {
    openedTeam.set({ id: teamId, name: teamName });
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
        <button class="new-team-btn rounded border-0">
          <img src={plus} alt="" />
        </button>
      </Tooltip>
    </div>
  </div>
  {#each teams as team}
    <button
      class={`d-flex w-100 align-items-center rounded teams-outer border-0 ${
        currOpenedTeam.id == team.teamId && "active"
      }`}
      on:click={() => handleOpenTeam(team.teamId, team.name)}
    >
      <img src={team.icon} alt="" />
      <p class=" mb-0">{team.name}</p>
    </button>
  {/each}
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
</style>
