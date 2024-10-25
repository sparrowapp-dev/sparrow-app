<script lang="ts">
  import { tableIcon as table } from "@sparrow/library/assets";
  import { hamburgerIcon as hamburger } from "@sparrow/library/assets";
  import { workspaceView } from "../store/workspace-view";
  import { onDestroy } from "svelte";
  import { SearchIcon } from "@sparrow/library/assets";
  import { base64ToURL } from "@sparrow/common/utils";
  import { PeopleIcon } from "@sparrow/library/assets";
  import type { TeamDocument, WorkspaceDocument } from "@app/database/database";
  import { TeamRole } from "@sparrow/common/enums";
  import { Button } from "@sparrow/library/ui";
  import TeamNavigator from "../components/team-navigator/TeamNavigator.svelte";
  import {
    TeamTabsEnum,
    TeamViewEnum,
  } from "../../../constants/TeamTabs.constants";
  import { WorkspaceListView } from "../components";
  import WorkspaceGridView from "../components/workspace-grid-view/WorkspaceGridView.svelte";
  import { TeamMembers, TeamSettings } from "@sparrow/teams/features";
  import { CrossIcon, MoreOptions } from "@sparrow/library/icons";
  import { Tooltip, Dropdown } from "@sparrow/library/ui";
  export let isWebApp = false;

  export let isWebEnvironment: boolean;

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

  export let isLeaveTeamModelOpen;

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
  /**
   * function to delete workspace
   */
  export let onDeleteWorkspace;

  /**
   * function to update team details
   */
  export let onUpdateTeam;

  /**
   * Flag to check if user is guest user
   */
  export let isGuestUser = false;

  export let onAddMember;

  export let openInDesktop;

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
        count: openTeam?.workspaces?.length,
        visible: true,
        disabled: isGuestUser === true ? true : false,
      },
      {
        name: "Members",
        id: TeamTabsEnum.MEMBERS,
        count: openTeam?.users?.length,
        visible: true,
        disabled: isGuestUser === true ? true : false,
      },
      {
        name: "Settings",
        id: TeamTabsEnum.SETTINGS,
        count: 0,
        visible: openTeam?.owner === userId,
        disabled: isGuestUser === true ? true : false,
      },
    ];
  };
  let teamTabs = [];
  $: {
    if (userId) {
      findUserType();
    }
  }
  let previousTeamId = "";
  $: {
    if (openTeam) {
      findUserType();
      teamTabs = refreshTabs();
      if (previousTeamId !== openTeam?.teamId) {
        onUpdateActiveTab(TeamTabsEnum.WORKSPACES);
      }
      previousTeamId = openTeam?.teamId;
    }
  }

  let isWorkspaceCreationInProgress = false;
  const handleCreateNewWorkspace = async () => {
    isWorkspaceCreationInProgress = true;
    await onCreateWorkspace(openTeam.teamId);
    isWorkspaceCreationInProgress = false;
  };

  let searchQuery = "";
  let hasText = false;
  let leaveButtonMenu: boolean = false;

  const handleLeaveTeam = () => {
    leaveButtonMenu = !leaveButtonMenu;
    isLeaveTeamModelOpen = true;
  };

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

  const addButtonData = [
    {
      name: "Leave Team",
      color: "var(--dangerColor)",
      onclick: () => handleLeaveTeam(),
    },
  ];
  $: {
    if (isGuestUser) {
      teamTabs = refreshTabs();
    }
  }
</script>

{#if openTeam}
  <div class="teams-content h-100 bg-secondary-850">
    <div
      class="content-teams d-flex flex-column h-100 px-md-1 px-lg-4 px-3 pt-5"
    >
      <div class="" style="padding-left: 14px; padding-right:14px">
        <div
          class="team-heading d-flex justify-content-between position-relative"
          style="padding-bottom: 10px;"
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
              style="font-size: 28px;"
              >{openTeam?.name || ""}
            </span>

            <!-- The leave team option will be availabe to only where you are invited team owner cannot leave the team -->
            {#if !isGuestUser}
              {#if userRole !== "owner"}
                <div
                  class="ms-2 d-flex justify-content-center align-items-center mt-2 moreOption-icon rounded"
                  on:click={() => {
                    leaveButtonMenu = !leaveButtonMenu;
                  }}
                >
                  <Dropdown
                    zIndex={600}
                    buttonId="leaveButton"
                    bind:isMenuOpen={leaveButtonMenu}
                    options={addButtonData}
                  >
                    <Tooltip
                      title={"Leave Team"}
                      placement={"bottom"}
                      distance={12}
                      show={!leaveButtonMenu}
                      zIndex={10}
                    >
                      <div id="leaveButton">
                        <MoreOptions height="15px" width="5px" color="White" />
                      </div>
                    </Tooltip>
                  </Dropdown>
                </div>
              {/if}
            {/if}
          </h2>

          <div class="d-flex align-items-end justify-content-end">
            {#if openTeam?.users?.length > 1 && !isGuestUser}
              <p class="d-flex my-auto ms-4 sparrow-fs-12">
                <PeopleIcon
                  color={"var(--sparrow-text-color)"}
                  classProp="mx-2 my-auto d-flex"
                />
                <span class="my-auto">{openTeam?.users.length} Members</span>
              </p>
            {/if}
            {#if userRole === TeamRole.TEAM_ADMIN || userRole === TeamRole.TEAM_OWNER}
              <Button
                title={`Invite`}
                type={`dark`}
                textStyleProp={"font-size: var(--small-text)"}
                onClick={() => {
                  isTeamInviteModalOpen = true;
                }}
                buttonClassProp={`my-auto px-3 pt-1 m-2`}
                buttonStyleProp={`height: 30px;`}
                disable={isGuestUser}
              />
              <Button
                title={`New Workspace`}
                type={`primary`}
                loaderSize={17}
                textStyleProp={"font-size: var(--small-text)"}
                buttonClassProp={`my-auto ms-1`}
                buttonStyleProp={`height: 30px;`}
                onClick={async () => {
                  await handleCreateNewWorkspace();
                }}
                loader={isWorkspaceCreationInProgress}
                disable={isGuestUser || isWorkspaceCreationInProgress}
              />
            {/if}
          </div>
        </div>

        <!--Workspace, setting and members tab-->

        <div
          class="teams-menu d-flex justify-content-between align-items-center"
        >
          <div
            class="teams-menu__left gap-4 align-items-center"
            style="padding-bottom: 4px;"
          >
            <TeamNavigator
              tabs={teamTabs}
              {onUpdateActiveTab}
              {activeTeamTab}
              {isWebApp}
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

      <div
        style="flex:1; overflow:auto; padding-left: 14px; padding-right:14px"
      >
        {#if activeTeamTab === TeamTabsEnum.WORKSPACES}
          <div class="h-100 d-flex flex-column">
            {#if openTeam && openTeam?.workspaces?.length > 0 && !isGuestUser}
              <div class="pt-2">
                <div
                  class={`d-flex search-input-container rounded  align-items-center mb-4`}
                >
                  <div>
                    <SearchIcon
                      width={14}
                      height={14}
                      classProp={`my-auto me-3`}
                      color={"var(--icon-secondary-200)"}
                    />
                  </div>
                  <input
                    type="text"
                    id="search-input"
                    class={`bg-transparent w-100 border-0 my-auto ms-2`}
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
            <div style="flex:1; overflow:auto;">
              {#if selectedView === TeamViewEnum.LIST}
                <WorkspaceListView
                  {onAddMember}
                  {isWebEnvironment}
                  {openInDesktop}
                  bind:isGuestUser
                  {searchQuery}
                  {openTeam}
                  data={workspaces.filter((elem) => {
                    return (
                      elem?.team?.teamId === openTeam?.teamId &&
                      elem?.name?.toLowerCase().includes(searchQuery)
                    );
                  }) || []}
                  {onSwitchWorkspace}
                  {onDeleteWorkspace}
                  isAdminOrOwner={userRole === TeamRole.TEAM_ADMIN ||
                    userRole === TeamRole.TEAM_OWNER}
                />
              {:else if selectedView == TeamViewEnum.GRID}
                <WorkspaceGridView
                  {onAddMember}
                  bind:isGuestUser
                  {onDeleteWorkspace}
                  {openInDesktop}
                  {isWebEnvironment}
                  {searchQuery}
                  workspaces={workspaces.filter((elem) => {
                    return (
                      elem?.team?.teamId === openTeam?.teamId &&
                      elem?.name?.toLowerCase().includes(searchQuery)
                    );
                  }) || []}
                  onCreateNewWorkspace={handleCreateNewWorkspace}
                  {onSwitchWorkspace}
                  bind:isWorkspaceCreationInProgress
                  isAdminOrOwner={userRole === TeamRole.TEAM_ADMIN ||
                    userRole === TeamRole.TEAM_OWNER}
                />
                <!--Enabled in next phase-->
              {/if}
            </div>
          </div>
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
        {:else if activeTeamTab === TeamTabsEnum.SETTINGS && userRole === "owner"}
          <TeamSettings openTeam={openTeam?.toMutableJSON()} {onUpdateTeam} />
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .custom-tooltip {
    --bs-tooltip-bg: var(--bs-primary);
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
    padding: 8px;
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

  .moreOption-icon {
    height: 24px;
    width: 24px;
  }
  .moreOption-icon:hover {
    background-color: var(--bg-tertiary-190);
  }
</style>
