<script lang="ts">
  import collections from "$lib/assets/collections.svg";
  import collectionsFaded from "$lib/assets/collections-faded.svg";
  import mock from "$lib/assets/mock.svg";
  import environment from "$lib/assets/environment.svg";
  import environmentFaded from "$lib/assets/environment-faded.svg";
  import home from "$lib/assets/home.svg";
  import Helper from "./Helper.svelte";
  import Tooltip from "$lib/components/tooltip/Tooltip.svelte";
  import { HelpIcon } from "$lib/assets/app.asset";
  import SettingsIcon from "$lib/assets/setting.svelte";
  import type { WorkspaceDocument } from "$lib/database/app.database";
  import type { Observable } from "rxjs";
  export let workspaces: Observable<WorkspaceDocument[]>;
  export let activeSideBarTabMethods;
  export let activeSidebarTabName: string;
</script>

<div class="sidebar">
  <div class="sidebar__main">
    <Helper
      {activeSideBarTabMethods}
      route="workspaces"
      heading="Home"
      logo={home}
      isSelected={"workspaces" === activeSidebarTabName ? true : false}
      disabled={false}
    />
    {#if $workspaces && $workspaces.length > 0}
      <Helper
        {activeSideBarTabMethods}
        route="collections"
        heading="Collections"
        logo={collections}
        isSelected={"collections" === activeSidebarTabName && true}
        disabled={false}
      />
    {:else}
      <Tooltip text="Add New Workspace">
        <Helper
          {activeSideBarTabMethods}
          route=""
          heading="Collections"
          logo={collectionsFaded}
          isSelected={"collections" === activeSidebarTabName && false}
          disabled={true}
        />
      </Tooltip>
    {/if}
    {#if $workspaces && $workspaces.length > 0}
      <Helper
        {activeSideBarTabMethods}
        route={"environment"}
        heading="Environment"
        logo={environment}
        isSelected={"environment" === activeSidebarTabName && true}
        disabled={false}
      />
    {:else}
      <Tooltip text="Add New Workspace">
        <Helper
          {activeSideBarTabMethods}
          route={""}
          heading="Environment"
          logo={environmentFaded}
          isSelected={"environment" === activeSidebarTabName && false}
          disabled={true}
        />
      </Tooltip>
    {/if}
    <Helper
      {activeSideBarTabMethods}
      route="mock"
      heading="Mock"
      logo={mock}
      isSelected={"mock" === activeSidebarTabName ? true : false}
      disabled={true}
    />
  </div>
  <div class="sidebar__secondary">
    <Tooltip>
      <div class="sidebar__container sidebar__container_background2">
        <div class="sidebar__container--icon pt-2">
          <HelpIcon />
        </div>
        <div class={`sidebar__container--text mt-1 text-textColor`}>
          <p>Help</p>
        </div>
      </div>
    </Tooltip>
    <Tooltip>
      <div class="sidebar__container sidebar__container_background2">
        <div class="sidebar__container--icon pt-2">
          <SettingsIcon color={"#8A9299"} />
        </div>
        <div class={`sidebar__container--text mt-1 text-textColor`}>
          <p>Settings</p>
        </div>
      </div>
    </Tooltip>
  </div>
</div>

<style>
  .sidebar {
    height: calc(100vh - 44px);
    width: 72px;
    display: flex;
    flex-direction: column;
    padding: 12px 4px 12px 4px;
    border-right: 1px solid #313233;
    justify-content: space-between;
    background: var(--background-color);
  }
  .sidebar__main {
    display: flex;
    flex-direction: column;
  }
  .sidebar__secondary {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .sidebar__container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .sidebar__container--text {
    font-family: Roboto;
    font-size: 10px;
    font-weight: 400;
    line-height: 10px;
    letter-spacing: 0em;
    color: white;
  }
</style>
