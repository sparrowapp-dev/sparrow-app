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
  import { Navigator } from "@sparrow/library/ui";
  import { Avatar } from "@sparrow/library/ui";
  import {
    AddRegular,
    GlobeRegular,
    ListRegular,
    LockClosedRegular,
    PeopleRegular,
  } from "@sparrow/library/icons";

  import {
    TeamTabsEnum,
    TeamViewEnum,
  } from "../../../constants/TeamTabs.constants";
  import { WorkspaceListView } from "../components";
  import WorkspaceGridView from "../components/workspace-grid-view/WorkspaceGridView.svelte";
  import { TeamMembers, TeamSettings } from "@sparrow/teams/features";
  import { CrossIcon, MoreOptions } from "@sparrow/library/icons";
  import { Tooltip, Dropdown } from "@sparrow/library/ui";
  import { Search } from "@sparrow/library/forms";
  import InvitesView from "../../invited-users/layout/InvitesView.svelte";

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
  /**
   * stores leave team modal state
   */
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

  export let onWithDrawInvite;

  export let onResendInvite;

  export let onAcceptInvite;

  export let onIgnoreInvite;

  /**
   * Flag to check if user is guest user
   */
  export let isGuestUser = false;
  export let onAddMember;
  export let openInDesktop;
  export let onCopyLink;

  let selectedView: string = "Grid";
  let userRole: string;
  let previousTeamId = "";
  let searchQuery = "";
  let searchInviteQuery = "";
  let hasText = false;
  let leaveButtonMenu: boolean = false;
  let isInviteIgnoreProgress = false;
  let isInviteAcceptProgress = false;
  let selectedFilter = "All";
  const addButtonData = [
    {
      name: "Leave Hub",
      color: "var(--dangerColor)",
      onclick: () => handleLeaveTeam(),
    },
  ];
  let isWorkspaceCreationInProgress = false;
  let teamTabs = [];

  /**
   *
   */
  const selectedViewSubscribe = workspaceView.subscribe((value) => {
    selectedView = value;
  });

  /**
   *
   */
  const findUserType = () => {
    openTeam?.users?.forEach((user) => {
      if (user.id === userId) {
        userRole = user.role;
      }
    });
  };
  /**
   *
   */
  const refreshTabs = () => {
    return [
      {
        name: "Workspaces",
        id: TeamTabsEnum.WORKSPACES,
        count: openTeam?.workspaces?.length || 0,
        visible: true,
        disabled: isGuestUser === true ? true : false,
      },
      {
        name: "Members",
        id: TeamTabsEnum.MEMBERS,
        count: openTeam?.users?.length || 1,
        visible: true,
        disabled: isGuestUser === true ? true : false,
      },
      {
        name: "Invites",
        id: TeamTabsEnum.INVITES,
        count: openTeam?._data.invites?.length || 0,
        visible:
          (openTeam?.owner === userId || openTeam?.admins?.includes(userId)) &&
          openTeam?._data.invites?.length > 0,
        disabled: isGuestUser === true ? true : false,
      },
      {
        name: "Settings",
        id: TeamTabsEnum.SETTINGS,
        count: 0,
        visible: openTeam?.owner === userId || isGuestUser === true,
        disabled: isGuestUser === true ? true : false,
      },
    ];
  };

  /**
   *
   */
  $: {
    if (userId || openTeam) {
      findUserType();
    }
  }

  /**
   *
   */
  $: {
    if (isGuestUser || openTeam) {
      teamTabs = refreshTabs();
    }
  }

  /**
   *
   */
  $: {
    if (openTeam) {
      if (previousTeamId !== openTeam?.teamId) {
        searchQuery = "";
        onUpdateActiveTab(TeamTabsEnum.WORKSPACES);
      }
      previousTeamId = openTeam?.teamId;
    }
  }

  /**
   *
   */
  const handleCreateNewWorkspace = async () => {
    isWorkspaceCreationInProgress = true;
    await onCreateWorkspace(openTeam.teamId);
    isWorkspaceCreationInProgress = false;
  };

  /**
   *
   */
  const handleLeaveTeam = () => {
    leaveButtonMenu = !leaveButtonMenu;
    isLeaveTeamModelOpen = true;
  };

  /**
   *
   * @param event
   */
  const handleSearchInput = (event) => {
    searchQuery = event.detail.toLowerCase();
    hasText = searchQuery.length > 0;
  };

  const handleSearchInvite = (event) => {
    searchInviteQuery = event.detail.toLowerCase();
  };

  $: activeTeamTab === TeamTabsEnum.INVITES && !openTeam?._data?.invites?.length
    ? onUpdateActiveTab(TeamTabsEnum.WORKSPACES)
    : null;

  /**
   *
   */
  onDestroy(() => {
    selectedViewSubscribe();
  });

  let filteredWorkspaces = [];
  $: {
    if (selectedFilter !== "All") {
      filteredWorkspaces = workspaces.filter(
        (workspace) =>
          workspace?.workspaceType?.toLowerCase() ===
          selectedFilter.toLowerCase(),
      );
    } else {
      filteredWorkspaces = workspaces;
    }
  }
</script>

{#if openTeam}
  <div
    class="teams-content h-100"
    style="background-color: var(--bg-ds-surface-900);"
  >
    {#if openTeam.owner}
      <div class="content-teams d-flex flex-column h-100 px-3 pt-3 pb-2">
        <div class="" style="">
          <div
            class="team-heading d-flex justify-content-between position-relative pb-3"
          >
            <h2 class="d-flex ellipsis overflow-visible mb-0 team-title">
              {#if openTeam?.logo?.size}
                <Avatar
                  type="image"
                  size="large"
                  image={base64ToURL(openTeam?.logo)}
                />
              {:else}
                <Avatar
                  type="letter"
                  size="large"
                  letter={openTeam?.name[0] ? openTeam?.name[0] : ""}
                  bgColor="var(--bg-secondary-600)"
                />
              {/if}
              <span
                class="ms-3 my-auto ellipsis overflow-hidden heading text-ds-font-size-28 text-ds-line-height-120 text-ds-font-weight-semi-bold"
                >{openTeam?.name || ""}
              </span>
              <!-- The leave team option will be availabe to only where you are invited team owner cannot leave the team -->
              {#if !isGuestUser && openTeam?.teamId !== "sharedWorkspaceTeam"}
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
                        title={"Leave Hub"}
                        placement={"bottom-center"}
                        distance={12}
                        show={!leaveButtonMenu}
                        zIndex={10}
                      >
                        <div id="leaveButton">
                          <MoreOptions
                            height="15px"
                            width="5px"
                            color="White"
                          />
                        </div>
                      </Tooltip>
                    </Dropdown>
                  </div>
                {/if}
              {/if}
            </h2>

            <div class="d-flex align-items-end justify-content-end gap-3">
              {#if openTeam?.users?.length > 1 && !isGuestUser}
                <p class="d-flex my-auto sparrow-fs-12">
                  <PeopleIcon
                    color={"var(--sparrow-text-color)"}
                    classProp="mx-2 my-auto d-flex"
                  />
                  <span class="my-auto" style="width: 66px;"
                    >{openTeam?.users.length} Members</span
                  >
                </p>
              {/if}
              <Button
                title={`Invite`}
                type={"secondary"}
                startIcon={PeopleRegular}
                onClick={() => {
                  isTeamInviteModalOpen = true;
                }}
                disable={isGuestUser ||
                  (userRole !== TeamRole.TEAM_ADMIN &&
                    userRole !== TeamRole.TEAM_OWNER)}
              />
              <Button
                title={`New Workspace`}
                type={`primary`}
                startIcon={AddRegular}
                onClick={async () => {
                  await handleCreateNewWorkspace();
                }}
                loader={isWorkspaceCreationInProgress}
                disable={isGuestUser ||
                  isWorkspaceCreationInProgress ||
                  (userRole !== TeamRole.TEAM_ADMIN &&
                    userRole !== TeamRole.TEAM_OWNER)}
              />
            </div>
          </div>

          <!--Workspace, setting and members tab-->

          <div
            class="teams-menu d-flex justify-content-between align-items-center position-relative"
          >
            <div class="teams-menu__left gap-4 align-items-center pb-3">
              <Navigator
                tabs={teamTabs.filter((tab) => tab.visible !== false)}
                currentTabId={activeTeamTab}
                onTabClick={onUpdateActiveTab}
              />
            </div>
            <div class="teams-menu__right">
              {#if activeTeamTab === TeamTabsEnum.WORKSPACES && !isGuestUser}
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
                <span
                  style="cursor:pointer;display:flex;justify-content:center;align-items:center"
                  on:click={() => {
                    workspaceView.set(TeamViewEnum.LIST);
                  }}
                  class:view-active={selectedView === TeamViewEnum.LIST}
                  src={hamburger}
                  alt=""
                >
                  <ListRegular size={"16px"} />
                </span>
              {/if}
            </div>
          </div>
        </div>

        <div style="flex:1; overflow:auto;">
          {#if activeTeamTab === TeamTabsEnum.WORKSPACES}
            <div class="h-100 d-flex flex-column">
              {#if openTeam && openTeam?.workspaces?.length > 0 && !isGuestUser}
                <div
                  class="d-flex align-items-center"
                  style="gap: 20px; justify-content:space-between; align-items:center;"
                >
                  <div
                    class="d-flex align-items-center"
                    style="gap: 12px; margin-bottom: 12px;"
                  >
                    <span
                      role="button"
                      class={`d-flex rounded px-2 text-fs-12 py-1 btn-formatter align-items-center ${
                        selectedFilter === "All"
                          ? "bg-tertiary-500 text-secondary-100"
                          : ""
                      }`}
                      on:click={() => (selectedFilter = "All")}
                    >
                      All
                    </span>

                    <span
                      role="button"
                      class={`d-flex rounded px-2 text-fs-12 py-1 btn-formatter align-items-center gap-1 ${
                        selectedFilter === "Private"
                          ? "bg-tertiary-500 text-secondary-100"
                          : ""
                      }`}
                      on:click={() => (selectedFilter = "Private")}
                    >
                      <LockClosedRegular size="16px" />
                      Private
                    </span>
                    <span
                      role="button"
                      class={`d-flex rounded px-2 text-fs-12 py-1 btn-formatter align-items-center gap-1 ${
                        selectedFilter === "Public"
                          ? "bg-tertiary-500 text-secondary-100"
                          : ""
                      }`}
                      on:click={() => (selectedFilter = "Public")}
                    >
                      <GlobeRegular size="16px" />
                      Public
                    </span>
                  </div>
                  <div class={`d-flex  rounded  align-items-center mb-3`}>
                    <Search
                      variant={"primary"}
                      id="search-input"
                      size="medium"
                      placeholder="Search workspaces in {openTeam?.name}"
                      on:input={handleSearchInput}
                      bind:value={searchQuery}
                      customWidth={"450px"}
                    />
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
                    data={filteredWorkspaces.filter((elem) => {
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
                    {onCopyLink}
                    workspaces={filteredWorkspaces.filter((elem) => {
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
          {:else if activeTeamTab === TeamTabsEnum.INVITES}
            <div class="h-100 d-flex flex-column">
              {#if openTeam && openTeam?._data?.invites?.length > 0 && !isGuestUser}
                <div style="margin-bottom:12px">
                  <div class={`d-flex  rounded  align-items-center`}>
                    <Search
                      variant={"primary"}
                      id="search-input"
                      size="small"
                      placeholder="Search invites by email"
                      on:input={handleSearchInvite}
                      bind:value={searchInviteQuery}
                      customWidth={"320px"}
                    />
                  </div>
                </div>
              {/if}
              <div style="flex:1; overflow:auto;" class="py-2">
                <InvitesView
                  invites={openTeam?._data?.invites?.filter((elem) => {
                    return elem?.email
                      ?.toLowerCase()
                      .includes(searchInviteQuery);
                  }) || []}
                  {onWithDrawInvite}
                  {onResendInvite}
                  {openTeam}
                  {userId}
                />
              </div>
            </div>
          {/if}
        </div>
      </div>
    {:else}
      <div style="padding:16px; gap:24px" class="d-flex flex-column">
        <h2 class="d-flex ellipsis overflow-visible team-title">
          <Avatar
            type="letter"
            size="large"
            letter={openTeam?.name[0] ? openTeam?.name[0] : ""}
            bgColor="var(--bg-ds-secondary-400)"
          />
          <span
            class="my-auto ellipsis overflow-hidden heading text-ds-font-size-28 text-ds-line-height-120 text-ds-font-weight-semi-bold"
            style="margin-left:12px"
            >{openTeam?.name || ""}
          </span>
        </h2>

        <div
          style="background-color:var(--bg-ds-surface-100); min-height:1px;width:100%;"
        ></div>

        <div
          class="d-flex justify-content-center align-items-center flex-column"
          style="gap:24px;"
        >
          <div
            class="w-100 mx-auto text-ds-font-weight-regular text-ds-line-height-143 text-ds-font-size-14 d-flex justify-content-center align-items-center"
            style="max-width: 492px; color:var(--bg-ds-neutral-300);"
          >
            <div class="text-center">
              {openTeam?._data?.description?.trim().split(" ")[0]} has invited you
              to be a member on the {openTeam?.name}.
              <br />
              Once you accept you will gain access to the workspaces within this
              hub.
            </div>
          </div>

          <div class="d-flex" style="gap:12px;">
            <Button
              type="primary"
              title="Accept"
              onClick={async () => {
                isInviteAcceptProgress = true;
                await onAcceptInvite(openTeam?.teamId);
                isInviteAcceptProgress = false;
              }}
              loader={isInviteAcceptProgress}
            />

            <Button
              type="secondary"
              title="Ignore"
              onClick={async () => {
                isInviteIgnoreProgress = true;
                await onIgnoreInvite(openTeam?.teamId);
                isInviteIgnoreProgress = false;
              }}
              loader={isInviteIgnoreProgress}
            />
          </div>
        </div>
      </div>
    {/if}
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
  .teams-menu__right {
    display: flex;
  }

  .btn-formatter {
    outline: none;
    border: none;
  }
</style>
