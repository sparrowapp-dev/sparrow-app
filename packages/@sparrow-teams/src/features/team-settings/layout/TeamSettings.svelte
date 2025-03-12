<script lang="ts">
  import { SettingsNavigator, TeamProfile } from "../components";
  import { TeamSettingsTabsEnum } from "../types";
  import { createEventDispatcher } from "svelte";
  import { SearchIcon2, SearchFilled } from "@sparrow/library/icons";
  import { CrossIcon2, CrossIcon } from "@sparrow/library/icons";
  export let openTeam;
  export let onUpdateTeam;

  let activeTeamSettingsTabId = TeamSettingsTabsEnum.TEAM_PROFILE;
</script>

<div>
  <section class="h-100 pb-2 pt-2">
    <div class="d-flex h-100">
      <div class="h-100 d-flex flex-column" style="width: 250px;">
        <div style="flex:1; overflow:auto;">
          <SettingsNavigator bind:activeTeamSettingsTabId />
        </div>
      </div>
      <div class="h-100 d-flex flex-column" style="width: calc(100% - 250px);">
        <div style="flex:1; overflow:auto;" class="ps-5 pe-1">
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
    </div>
  </section>
</div>

<style lang="scss">
  .custom-surface700 {
    background-color: var(--bg-ds-surface-400);
    border: none;
    caret-color: var(--border-ds-primary-300);
  }

  .custom-surface700:focus {
    background-color: var(--bg-ds-surface-300);
    outline: none;
    border: 2px solid var(--border-ds-primary-300);
  }

  .custom-surface700.has-text {
    border: 1px solid var(--border-ds-primary-300);
  }

  .custom-surface700.has-text:not(:focus) {
    border: none;
  }

  .custom-surface700.entered:focus {
    border: 2px solid var(--border-ds-primary-300);
  }

  .custom-surface700:not(:focus):hover {
    border: 1px solid var(--border-ds-neutral-300);
  }
</style>
