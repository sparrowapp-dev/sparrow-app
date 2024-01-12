<script lang="ts">
  import collections from "$lib/assets/collections.svg";
  import mock from "$lib/assets/mock.svg";
  import environment from "$lib/assets/environment.svg";
  import home from "$lib/assets/home.svg";
  import Helper from "./Helper.svelte";
  import Tooltip from "$lib/components/tooltip/Tooltip.svelte";
  import { HelpIcon } from "$lib/assets/app.asset";
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
    <Helper
      {activeSideBarTabMethods}
      route="collections"
      heading="Collections"
      logo={collections}
      isSelected={"collections" === activeSidebarTabName ? true : false}
      disabled={false}
    />
    <Helper
      {activeSideBarTabMethods}
      route="environment"
      heading="Environment"
      logo={environment}
      isSelected={"environment" === activeSidebarTabName ? true : false}
      disabled={false}
    />
    <Helper
      {activeSideBarTabMethods}
      route="mock"
      heading="Mock"
      logo={mock}
      isSelected={"mock" === activeSidebarTabName ? true : false}
      disabled={true}
    />
  </div>
  <div class="sidebar__help">
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
    background: #1e1e1e;
  }
  .sidebar__main {
    display: flex;
    flex-direction: column;
  }
  .sidebar__help {
    display: flex;
    align-items: center;
    justify-content: center;
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
