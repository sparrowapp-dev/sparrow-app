<script lang="ts">
  import { Tooltip } from "@library/ui/tooltip";
  import plus from "$lib/assets/plus.svg";
  import { onMount } from "svelte";
  import type { TeamDocument } from "@app/database/database";
  import { base64ToURL } from "$lib/utils/helpers";
  import { List } from "@library/ui";
  import { PeopleIcon } from "$lib/assets/app.asset";
  export let teamList: TeamDocument[] = [];
  export let tabList: TabDocument[] = [];
</script>

<div
  style="border-right: 1px solid var(--border-color);"
  class="sidebar sparrow-thin-scrollbar d-flex flex-column bg-secondary-900"
>
  <!--Teams list-->
  <section>
    <div class="sidebar-teams-header d-flex justify-content-between p-3 pb-0">
      <h6 class="teams-heading">Teams</h6>
      <div>
        <Tooltip title="New Team" placement={"bottom"} styleProp={"left: -50%"}>
          <button class="new-team-btn rounded border-0">
            <img src={plus} alt="" />
          </button>
        </Tooltip>
      </div>
    </div>
    <div class="sidebar-teams-list">
      <List height={"calc((100vh - 230px) / 3)"} classProps={"px-3 py-0"}>
        {#each teamList as team, index}
          <button
            class={`d-flex w-100 align-items-center justify-content-between rounded teams-outer border-0 ${"active"}`}
            on:click={async () => {
              // Here implemet the add team functionality
            }}
          >
            <div class="d-flex w-100 overflow-hidden">
              {#if base64ToURL(team.logo) == "" || base64ToURL(team.logo) == undefined}
                <p
                  class={`m-0 sparrow-fs-15 text-defaultColor me-2 align-items-center justify-content-center bg-transparent border-defaultColor `}
                  style={`padding-top: 2px; width: 25px !important; height: 25px !important; display: flex; border: 1px solid var(--defaultcolor); border-radius: 50%;`}
                >
                  {team.name[0] ? team.name[0].toUpperCase() : ""}
                </p>
              {:else}
                <img src={base64ToURL(team.logo)} alt="" />
              {/if}
              <p class="ellipsis text-left teams-title overflow-hidden my-auto">
                {team.name}
              </p>
            </div>
            {#if team.isNewInvite}
              <p class="mb-0 new-invite text-labelColor w-50">NEW INVITE</p>
            {:else}
              <!-- <PeopleIcon
                color={openTeam?.teamId == team.teamId
                  ? "var(--sparrow-text-color)"
                  : "var(--defaultcolor)"}
                classProp={team.users?.length <= 1 && "d-none"}
              /> -->
            {/if}
          </button>
        {/each}
      </List>
    </div>
  </section>
  <!-- Recent APIs-->
  <!-- <RecentApi
    {tabList}
    {data}
    {collectionList}
    {collectionsMethods}
    {activeSideBarTabMethods}
  /> -->
  <hr class="mb-0 pb-0" />
  <!-- <RecentWorkspace
    {data}
    {openTeam}
    {handleWorkspaceSwitch}
    {handleWorkspaceTab}
    {activeSideBarTabMethods}
  /> -->
</div>

<style>
  .sidebar {
    height: calc(100vh - 44px);
  }
  .teams-heading {
    font-size: 14px;
    font-weight: 700;
    line-height: 21px;
  }
  .teams-outer {
    padding: 8px 7px;
    background-color: transparent;
  }
  .teams-outer.active {
    background-color: var(--border-color);
  }
  .new-team-btn {
    background-color: transparent;
  }
  .new-team-btn:hover {
    background-color: var(--border-color);
  }
  .new-team-btn > img:hover {
    filter: invert(86%) sepia(37%) saturate(4292%) hue-rotate(180deg)
      brightness(101%) contrast(100%);
  }
  .teams-outer:hover {
    background-color: var(--dull-background-color);
    color: var(--workspace-hover-color);
  }
  .teams-outer img {
    width: 25px;
    height: 25px;
    overflow: hidden;
    border-radius: 50%;
    margin-right: 8px;
  }
  .sidebar-teams-list {
    max-height: 30vh;
  }
  .new-invite {
    font-size: 12px !important;
  }
  .teams-title {
    width: calc(100% - 40px);
    text-align: left;
  }
</style>
