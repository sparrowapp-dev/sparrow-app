<script lang="ts">
  import { SettingsNavigator, TeamProfile } from "../components";
  import { TeamSettingsTabsEnum } from "../types";
  export let openTeam;
  export let onUpdateTeam;

  let activeTeamSettingsTabId = TeamSettingsTabsEnum.TEAM_PROFILE;
</script>

<section class="h-100 pb-2 pt-2">
  <div class="d-flex h-100">
    <div class="h-100" style="width: 250px;">
      <SettingsNavigator bind:activeTeamSettingsTabId />
    </div>
    <div class="h-100 ps-5" style="width: calc(100% - 250px);">
      {#if activeTeamSettingsTabId === TeamSettingsTabsEnum.TEAM_PROFILE}
        <TeamProfile {openTeam} {onUpdateTeam} />
      {:else if activeTeamSettingsTabId === TeamSettingsTabsEnum.AUTHENTICATION}
        Authentication
      {:else if activeTeamSettingsTabId === TeamSettingsTabsEnum.IDENTITY_PROVIDER}
        Identity Provider
      {:else if activeTeamSettingsTabId === TeamSettingsTabsEnum.PLUGINS}
        Plugins
      {/if}
    </div>
  </div>
</section>
