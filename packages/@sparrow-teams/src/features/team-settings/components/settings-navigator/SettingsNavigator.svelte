<script lang="ts">
  import { LockIcon } from "@sparrow/library/icons";
  import { TeamSettingsTabsEnum } from "../../types";
  import { LockClosedRegular, PeopleFilled } from "@sparrow/library/icons";

  export let activeTeamSettingsTabId: string = "";

  const settingsTabs = [
    {
      name: "Profile",
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
          <LockClosedRegular size={"16px"} color={"var(--bg-ds-neutral-500)"} />
        {:else}
          <PeopleFilled size={"16px"} color={"var(--bg-ds-neutral-100)"} />
        {/if}
      </button>
    {/if}
  {/each}
</div>

<style>
  .settings-list {
    height: 100%;
  }
  .settings-tab {
    text-align: left;
    color: var(--text-ds-neutral-200);
    background-color: transparent;
  }
  .settings-tab-active {
    background-color: var(--bg-tertiary-750);
    color: var(--text-ds-neutral-50);
  }
</style>
