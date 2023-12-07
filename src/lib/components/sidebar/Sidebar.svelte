<script lang="ts">
  import collections from "$lib/assets/collections.svg";
  import mock from "$lib/assets/mock.svg";
  import environment from "$lib/assets/environment.svg";
  import teams from "$lib/assets/teams.svg";
  import workspaces from "$lib/assets/workspaces.svg";
  import help from "$lib/assets/circle-question.svg";
  import Helper from "./Helper.svelte";
  export let activeSideBarTabMethods;
  export let selectedActiveSideBarTab;
  function changeSelectedActiveSideBarTab(tab:string){
    selectedActiveSideBarTab=tab
  }
</script>

<div class="sidebar">
  <div class="sidebar__main">
    <Helper   activeSideBarTabMethods={activeSideBarTabMethods}  route="collections" heading="Collections" logo={collections} isSelected={"collections"===selectedActiveSideBarTab?true:false} changeSelectedActiveSideBarTab={changeSelectedActiveSideBarTab} />
    <Helper  activeSideBarTabMethods={activeSideBarTabMethods} route="mock" heading="Mock" logo={mock} isSelected={"mock"===selectedActiveSideBarTab?true:false} changeSelectedActiveSideBarTab={changeSelectedActiveSideBarTab}/>
    <Helper  activeSideBarTabMethods={activeSideBarTabMethods} route="environment" heading="Environment" logo={environment} isSelected={"environment"===selectedActiveSideBarTab?true:false}  changeSelectedActiveSideBarTab={changeSelectedActiveSideBarTab}/>
    <Helper  activeSideBarTabMethods={activeSideBarTabMethods} route="teams" heading="Teams" logo={teams}  isSelected={"teams"===selectedActiveSideBarTab?true:false}  changeSelectedActiveSideBarTab={changeSelectedActiveSideBarTab}  />
    <Helper  activeSideBarTabMethods={activeSideBarTabMethods} route="workspaces" heading="Workspaces" logo={workspaces}  isSelected={"workspaces"===selectedActiveSideBarTab?true:false} changeSelectedActiveSideBarTab={changeSelectedActiveSideBarTab}/>
  </div>
  <div class="sidebar__help">
    <Helper  activeSideBarTabMethods={activeSideBarTabMethods} route="help" heading="Help" logo={help} isSelected={"help"===selectedActiveSideBarTab?true:false} changeSelectedActiveSideBarTab={changeSelectedActiveSideBarTab} />
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
</style>
