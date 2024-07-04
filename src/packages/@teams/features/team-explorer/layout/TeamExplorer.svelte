<script lang="ts">
  import table from "$lib/assets/table.svg";
  import hamburger from "$lib/assets/hamburger.svg";
  import { workspaceView } from "$lib/store";
  import { onDestroy } from "svelte";
  import { SearchIcon } from "$lib/assets/app.asset";
  import { base64ToURL } from "$lib/utils/helpers";
  import { PeopleIcon } from "$lib/assets/app.asset";
  import type { TeamDocument, WorkspaceDocument } from "@app/database/database";
  import { TeamRole } from "$lib/utils/enums";
  import { Button } from "@library/ui";
  import TeamNavigator from "../components/team-navigator/TeamNavigator.svelte";
  import {
    TeamTabsEnum,
    TeamViewEnum,
  } from "@teams/common/constants/TeamTabs.constants";
  import { WorkspaceListView } from "../components";
  import WorkspaceGridView from "../components/workspace-grid-view/WorkspaceGridView.svelte";
  import { TeamMembers } from "@teams/features";
  import { CrossIcon } from "@library/icons";
  /**
   * user ID
   */
  export let userId: string;
  /**
   * Open team details which is active
   */
  export let openTeam: TeamDocument;
  /**
   * All the workspaces from local db
   */
  export let workspaces: WorkspaceDocument[] = [];
  /**
   * Active Tab in team
   */
  export let activeTeamTab: string;
  /**
   * Callback for updating active tab in team
   */
  export let onUpdateActiveTab;

  /**
   * Invite team toggler
   */
  export let isTeamInviteModalOpen;

  /**
   * Callback For creating workspace
   */
  export let onCreateWorkspace: (id: string) => void;
  /**
   * Callback for switching workspace
   */
  export let onSwitchWorkspace: (id: string) => void;
  /**
   * function to remove members from team
   */
  export let onRemoveMembersAtTeam;
  /**
   * function to demote admins at team
   */
  export let onDemoteToMemberAtTeam;
  /**
   * function to promote to admin at team
   */
  export let onPromoteToAdminAtTeam;
  /**
   * function to promote to owner at team
   */
  export let onPromoteToOwnerAtTeam;
  /**
   * function to remove member from workspace
   */
  export let onRemoveUserFromWorkspace;
  /**
   * function to change user role at workspace
   */
  export let onChangeUserRoleAtWorkspace;

  let selectedView: string = "Grid";

  const selectedViewSubscribe = workspaceView.subscribe((value) => {
    selectedView = value;
  });

  let userRole: string;
  const findUserType = () => {
    openTeam?.users.forEach((user) => {
      if (user.id === userId) {
        userRole = user.role;
      }
    });
  };

  const refreshTabs = () => {
    return [
      {
        name: "Workspaces",
        id: TeamTabsEnum.WORKSPACES,
        count: openTeam.workspaces?.length,
        visible: true,
        disabled: false,
      },
      {
        name: "Members",
        id: TeamTabsEnum.MEMBERS,
        count: openTeam.users?.length,
        visible: true,
        disabled: false,
      },
      {
        name: "Settings",
        id: TeamTabsEnum.SETTINGS,
        count: 0,
        visible: openTeam?.owner === userId,
        disabled: true,
      },
    ];
  };
  let teamTabs = [];
  $: {
    if (userId) {
      findUserType();
    }
  }
  $: {
    if (openTeam) {
      findUserType();
      teamTabs = refreshTabs();
    }
  }

  const handleCreateNewWorkspace = () => {
    onCreateWorkspace(openTeam.teamId);
  };
  
  let searchQuery = "";
  let hasText = false;

  const handleSearchInput = (event) => {
    searchQuery = event.target.value.toLowerCase();
    hasText = searchQuery.length > 0;
  };
  const clearSearchInput = () => {
    searchQuery = "";
    hasText = false;
  };

  onDestroy(() => {
    selectedViewSubscribe();
  });
</script>

{#if openTeam}
  <div class="teams-content bg-secondary-850">
    <div class="content-teams px-md-1 px-lg-3 px-3 pt-5">
      <div class="container-fluid">
        <div class="row">
          <div class="col-12 pb-3">
            <div
              class="team-heading d-flex justify-content-between position-relative"
            >
              <h2 class="d-flex ellipsis overflow-visible team-title">
                {#if openTeam?.logo?.size}
                  <img
                    class="text-center w-25 align-items-center justify-content-center profile-circle bg-dullBackground"
                    style="width: 40px !important; height: 40px !important; padding-top: 2px; display: flex; border-radius: 50%;"
                    src={base64ToURL(openTeam?.logo)}
                    alt=""
                  />{:else}
                  <p
                    class={`text-defaultColor w-25 text-center my-auto align-items-center justify-content-center profile-circle bg-tertiary-750 border-secondary-300 border-2`}
                    style={`font-size: 24px; padding-top: 2px; width: 40px !important; height: 40px !important; display: flex; border: 2px solid #45494D;border-radius: 50%;`}
                  >
                    {openTeam?.name[0] ? openTeam?.name[0].toUpperCase() : ""}
                  </p>
                {/if}
                <span
                  class="ms-3 my-auto ellipsis overflow-hidden heading"
                  style="font-size: 24px;"
                  >{openTeam?.name || ""}
                </span>
              </h2>

              <div class="d-flex align-items-end justify-content-end">
                {#if openTeam?.users?.length > 0}
                  <p class="d-flex my-auto ms-1 me-4 sparrow-fs-12">
                    <PeopleIcon
                      color={"var(--sparrow-text-color)"}
                      classProp="mx-2 my-auto d-flex"
                    />
                    <span class="my-auto">{openTeam?.users.length} Members</span
                    >
                  </p>
                {/if}
                {#if userRole && userRole !== TeamRole.TEAM_MEMBER}
                  <Button
                    title={`Invite`}
                    type={`dark`}
                    textStyleProp={"font-size: var(--small-text)"}
                    onClick={() => {
                      isTeamInviteModalOpen = true;
                    }}
                    buttonClassProp={`my-auto px-3 pt-1 me-4`}
                    buttonStyleProp={`height: 30px;`}
                  />
                  <Button
                    title={`New Workspace`}
                    type={`primary`}
                    loaderSize={17}
                    textStyleProp={"font-size: var(--small-text)"}
                    buttonClassProp={`my-auto`}
                    buttonStyleProp={`height: 30px;`}
                    onClick={handleCreateNewWorkspace}
                  />
                {/if}
              </div>
            </div>
          </div>
        </div>
        <!--Workspace, setting and members tab-->
        <div class="row">
          <div class="col-12">
            <div
              class="teams-menu d-flex justify-content-between align-items-center"
            >
              <div class="teams-menu__left gap-4 align-items-center">
                <TeamNavigator
                  tabs={teamTabs}
                  {onUpdateActiveTab}
                  {activeTeamTab}
                />
              </div>
              <div class="teams-menu__right">
                {#if activeTeamTab === TeamTabsEnum.WORKSPACES}
                  <span class="mx-3" style="cursor:pointer;">
                    <img
                      on:click={() => {
                        workspaceView.set(TeamViewEnum.GRID);
                      }}
                      class:view-active={selectedView === TeamViewEnum.GRID}
                      src={table}
                      alt=""
                    />
                  </span>
                  <span style="cursor:pointer;">
                    <img
                      on:click={() => {
                        workspaceView.set(TeamViewEnum.LIST);
                      }}
                      class:view-active={selectedView === TeamViewEnum.LIST}
                      src={hamburger}
                      alt=""
                    />
                  </span>
                {/if}
              </div>
            </div>
          </div>
        </div>
      </div>
      {#if openTeam && openTeam?.workspaces?.length > 0 && activeTeamTab === TeamTabsEnum.WORKSPACES}
        <div class="ps-2 pt-2">
          <div class={`d-flex search-input-container rounded py-2 px-2 mb-4`}>
            <SearchIcon width={14} height={14} classProp={`my-auto me-3`} />
            <input
              type="text"
              id="search-input"
              class={`bg-transparent w-100 border-0 my-auto`}
              placeholder="Search workspaces in {openTeam?.name}"
              on:input={handleSearchInput}
              bind:value={searchQuery}
            />

            {#if hasText}
              <div class="clear-icon" on:click={clearSearchInput}>
                <CrossIcon
                  height="16px"
                  width="12px"
                  color="var(--icon-secondary-300)"
                />
              </div>
            {/if}
          </div>
        </div>
      {/if}

      {#if selectedView === TeamViewEnum.LIST && activeTeamTab === TeamTabsEnum.WORKSPACES}
        <WorkspaceListView
        {searchQuery}
          {openTeam}
          data={workspaces.filter((elem) => {
            return (
              elem?.team?.teamId === openTeam?.teamId &&
              elem?.name?.toLowerCase().includes(searchQuery)
            );
          }) || []}
          userType={userRole}
          {userId}
          {onSwitchWorkspace}
        />
      {:else if selectedView == TeamViewEnum.GRID && activeTeamTab === TeamTabsEnum.WORKSPACES}
        <WorkspaceGridView
        {searchQuery}
          {openTeam}
          {userId}
          workspaces={workspaces.filter((elem) => {
            return (
              elem?.team?.teamId === openTeam?.teamId &&
              elem?.name?.toLowerCase().includes(searchQuery)
            );
          }) || []}
          onCreateNewWorkspace={handleCreateNewWorkspace}
          {onSwitchWorkspace}
        />
        <!--Enabled in next phase-->
      {:else if activeTeamTab === TeamTabsEnum.MEMBERS}
        <TeamMembers
          {userId}
          userType={userRole}
          {openTeam}
          {workspaces}
          {onRemoveMembersAtTeam}
          {onDemoteToMemberAtTeam}
          {onPromoteToAdminAtTeam}
          {onPromoteToOwnerAtTeam}
          {onRemoveUserFromWorkspace}
          {onChangeUserRoleAtWorkspace}
        />
        <!-- {:else if selectedTab === "settings" && userType === "owner"}
        <Settings
          openTeam={openTeam?.toMutableJSON()}
          {teamServiceMethods}
          {teamRepositoryMethods}
        ></Settings> -->
      {/if}
    </div>
  </div>
{/if}

<style>
  .custom-tooltip {
    --bs-tooltip-bg: var(--bs-primary);
  }

  .teams-content {
    height: calc(100vh - 44px);
  }
  @media only screen and (max-width: 1000px) {
    .team-heading {
      display: block !important;
    }
    .team-heading > h2,
    .team-heading > div {
      width: 100% !important;
    }
  }
  .team-menu__link {
    color: var(--button-color);
  }
  .team-menu__link:hover {
    background-color: var(--dull-background-color);
  }
  .tab-active {
    color: var(--white-color);
    border-bottom-left-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
    border-bottom: 3px solid var(--workspace-hover-color);
  }
  .view-active {
    filter: invert(65%) sepia(63%) saturate(551%) hue-rotate(185deg)
      brightness(103%) contrast(104%);
  }
  .team-title {
    width: calc(100% - 351px);
  }
  .heading {
    max-width: calc(100% - 150px);
  }
  .cursor-pointer {
    cursor: pointer;
  }
  .item-count-active {
    color: unset !important;
  }
  .item-count {
    color: var(--primary-btn-color);
  }
  .leave-team-container {
    transform: rotate(90deg);
  }
  .leave-btn {
    border-style: solid;
    border-color: var(--border-color);
  }
  .search-input-container {
    /* border: 1px solid var(--border-color); */
    background: var(--bg-tertiary-400);
    width: 27vw;
    font-size: 12px;
    position: relative;
    border: 1px solid transparent;
  }
  .search-input-container:hover {
    border: 1px solid var(--border-primary-300);
    caret-color: var(--border-primary-300);
  }

  .search-input-container:focus-within {
    border-color: var(--border-primary-300);
    caret-color: var(--border-primary-300);
  }

  #search-input:focus {
    outline: none;
    border: none;
    box-shadow: none;
  }

  .clear-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    font-size: 16px;
  }
</style>
