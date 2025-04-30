<script lang="ts">
  import { Input } from "@sparrow/library/forms";
  import { SettingsNavigator, TeamProfile } from "../components";
  import { TeamSettingsTabsEnum } from "../types";
  import {
    XIcon,
    GithubIcon,
    LinkedIn 
  } from "@sparrow/library/icons";
  export let openTeam;
  export let onUpdateTeam;

  let activeTeamSettingsTabId = TeamSettingsTabsEnum.TEAM_PROFILE;
</script>

<div class="h-100">
  <section class="h-100">
    <div class="d-flex h-100">
      <div class="h-100 d-flex flex-column" style="width: 450px;">
        <div style="flex:1; overflow:auto;">
          <!-- <SettingsNavigator bind:activeTeamSettingsTabId /> -->
          <TeamProfile {openTeam} {onUpdateTeam} />
        </div>
      </div>
      <div
        class="h-100 mx-2"
        style="border-right: 1px solid var(--border-color);"
      ></div>
      <div class="h-100 d-flex flex-column" style="width:400px; ">
        <div
          style="flex:1; overflow:auto; gap:16px; display: flex; flex-direction: column; "
          class="ps-5 pe-1"
        >
          <div class="input-icon">
            <span class="input-header">GitHub Link</span>
            <Input
              id="github-link"
              type="text"
              placeholder="Enter GitHub link"
              size="medium"
              variant="primary"
              width="100%"
              startIcon={GithubIcon}
              startIconProps={{ height: "20px", width: "20px", color: "white" }}
            />
          </div>
          <div class="input-icon">
            <span class="input-header">LinkedIn Link</span>
            <Input
              id="linkedIn-link"
              type="text"
              placeholder="Enter LinkedIn link"
              size="medium"
              variant="primary"
              width="100%"
              startIcon={LinkedIn}
              startIconProps={{ height: "20px", width: "20px", color: "white" }}
            />
          </div>
          <div class="input-icon">
            <span class="input-header">X Link</span>
            <Input
              id="X-link"
              type="text"
              placeholder="Enter X link"
              size="medium"
              variant="primary"
              width="100%"
              startIcon={XIcon}
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</div>

<style lang="scss">
  .input-header {
    font-size: 12px;
    color: var(--text-ds-neutral-200);
    font-weight: 500;
  }
  .input-icon {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
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
