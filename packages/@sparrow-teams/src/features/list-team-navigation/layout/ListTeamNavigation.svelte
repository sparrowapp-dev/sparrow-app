<script lang="ts">
  import { TeamHeading, TeamNavigation } from "../components";
  export let tabs = [];
  export let activeTeamTab: string;
  export let onUpdateActiveTab: (data: string) => void;
  export let openTeam;
</script>

<TeamHeading {openTeam} />
<div class="">
  <!-- Tabs -->
  <div class="mb-2 p-3">
    {#each tabs as tab}
      {#if tab?.visible}
        <TeamNavigation {tab} {activeTeamTab} {onUpdateActiveTab} />
      {/if}
    {/each}
  </div>
</div>
