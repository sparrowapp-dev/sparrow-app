<script lang="ts">
  import { SettingsNavigator, TeamLinks, TeamProfile } from "../components";
  import { UpdateTeamIcon } from "../components/team-profile/sub-team-profile";
  import {
    TeamPropertyEnum,
    TeamSettingsTabsEnum,
    type UpdateTeamIcon as IUpdateTeamIcon,
  } from "../types";
  export let openTeam;
  export let onUpdateTeam;
  let uploadTeamIcon: IUpdateTeamIcon = {
    file: {
      value: [],
      invalid: false,
      showFileSizeError: false,
      showFileTypeError: false,
    },
  };

  if (openTeam?.logo?.bufferString) {
    uploadTeamIcon.file.value = openTeam?.logo;
  }

  let activeTeamSettingsTabId = TeamSettingsTabsEnum.TEAM_PROFILE;
  const handleUpdateTeam = async (property: TeamPropertyEnum) => {
    const blankFile = new File([""], "blank.jpg", {
      type: "",
      lastModified: 1706698162061,
    });
    let data;
    if (property === TeamPropertyEnum.IMAGE) {
      data = {
        image:
          uploadTeamIcon.file.value.length === 0
            ? blankFile
            : uploadTeamIcon.file.value,
      };
    }

    await onUpdateTeam(openTeam.teamId, data);
  };
</script>

<div class="h-100" style="padding: 10px;">
  <section class="h-100">
    <UpdateTeamIcon bind:uploadTeamIcon onUpdateTeam={handleUpdateTeam} />
    <div class="d-flex h-90">
      <div class="h-90 d-flex flex-column w-50">
        <div style="flex:1; overflow:auto;">
          <!-- <SettingsNavigator bind:activeTeamSettingsTabId /> -->
          <TeamProfile {openTeam} {onUpdateTeam} />
        </div>
      </div>
      <div
        class="h-90 mx-2"
        style="border-right: 1px solid var(--border-color);"
      ></div>
      <div class="h-100 d-flex flex-column w-50">
        <TeamLinks {openTeam} {onUpdateTeam} />
        <!-- <div style="flex:1; overflow:auto;" class="ps-5 pe-1"> -->
        <!-- {#if activeTeamSettingsTabId === TeamSettingsTabsEnum.TEAM_PROFILE}
            <TeamProfile {openTeam} {onUpdateTeam} />
          {:else if activeTeamSettingsTabId === TeamSettingsTabsEnum.AUTHENTICATION}
            Authentication
          {:else if activeTeamSettingsTabId === TeamSettingsTabsEnum.IDENTITY_PROVIDER}
            Identity Provider
          {:else if activeTeamSettingsTabId === TeamSettingsTabsEnum.PLUGINS}
            Plugins
          {/if} -->
        <!-- </div> -->
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
