<script lang="ts">
  import { LockIcon } from "@sparrow/library/icons";
  import { TeamSettingsTabsEnum } from "../../types";

  export let activeTeamSettingsTabId: string = "";

  const settingsTabs = [
    {
      name: "Team Profile",
      id: TeamSettingsTabsEnum.TEAM_PROFILE,
      visible: true,
      disabled: false,
      onclick: function () {
        activeTeamSettingsTabId = TeamSettingsTabsEnum.TEAM_PROFILE;
      },
    },
    {
      name: "Authentication",
      id: TeamSettingsTabsEnum.AUTHENTICATION,
      visible: true,
      disabled: true,
      onclick: function () {
        activeTeamSettingsTabId = TeamSettingsTabsEnum.AUTHENTICATION;
      },
    },
    {
      name: "Identity Provider",
      id: TeamSettingsTabsEnum.IDENTITY_PROVIDER,
      visible: true,
      disabled: true,
      onclick: function () {
        activeTeamSettingsTabId = TeamSettingsTabsEnum.IDENTITY_PROVIDER;
      },
    },
    {
      name: "Plugins",
      id: TeamSettingsTabsEnum.PLUGINS,
      visible: true,
      disabled: true,
      onclick: function () {
        activeTeamSettingsTabId = TeamSettingsTabsEnum.PLUGINS;
      },
    },
  ];
</script>

<div class="settings-list w-30 pe-2">
  {#each settingsTabs as tab}
    {#if tab.visible}
      <button
        on:click={() => {
          if (!tab.disabled) {
            tab.onclick();
          }
        }}
        class="settings-tab {tab.id === activeTeamSettingsTabId
          ? 'settings-tab-active'
          : ''} d-flex align-items-center justify-content-between mb-1 py-2 px-3 w-100 text-fs-12 rounded border-0"
      >
        <span>
          {tab.name}
        </span>
        {#if tab.disabled}
          <LockIcon
            height={"14px"}
            width={"14px"}
            color={"var(--icon-secondary-400)"}
          />
        {/if}
      </button>
    {/if}
  {/each}
</div>

<style>
  .settings-list {
    height: 100%;
    border-right: 1px solid var(--border-color);
  }
  .settings-tab {
    text-align: left;
    background-color: transparent;
  }
  .settings-tab-active {
    background-color: var(--bg-tertiary-750);
  }
</style>
