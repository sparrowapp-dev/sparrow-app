<script lang="ts">
  import { tableIcon as table } from "@sparrow/library/assets";
  import { hamburgerIcon as hamburger } from "@sparrow/library/assets";
  import { workspaceView } from "../store/workspace-view";
  import { onDestroy } from "svelte";
  import { SearchIcon } from "@sparrow/library/assets";
  import { base64ToURL, planInfoByRole } from "@sparrow/common/utils";
  import { PeopleIcon } from "@sparrow/library/assets";
  import type { TeamDocument, WorkspaceDocument } from "@app/database/database";
  import { TeamRole } from "@sparrow/common/enums";
  import { Button, Tag } from "@sparrow/library/ui";
  import { Navigator } from "@sparrow/library/ui";
  import { Avatar } from "@sparrow/library/ui";
  import { WorkspaceType } from "@sparrow/common/enums";
  import {
    AddRegular,
    GlobeRegular,
    ListRegular,
    LockClosedRegular,
    OpenRegular,
    PeopleRegular,
    AlertOnIcon,
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
  import { open } from "@tauri-apps/plugin-shell";
  import { PlanUpgradeModal } from "@sparrow/common/components";
  import { navigate } from "svelte-navigator";
  import {
    isTeamDowngradePopupDismissed,
    setTeamDowngradePopupDismissed,
  } from "@sparrow/workspaces/stores";

  export let isWebApp = false;

  export let isWebEnvironment: boolean;
  export let upgradePlanModalInvite: boolean;
  export let upgradePlanModal: boolean = false;

  export let sparrowAdminUrl;

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
  export let planLimits;
  export let contactOwner;
  export let handleRedirectAdminPanel;
  export let handleContactSales;
  export let invitedCount;
  export let appEdition = "MANAGED";

  let selectedView: string = "Grid";
  let userRole: string;
  let previousTeamId = "";
  let searchQuery = "";
  let searchInviteQuery = "";
  let hasText = false;
  let leaveButtonMenu: boolean = false;
  let isInviteIgnoreProgress = false;
  let isInviteAcceptProgress = false;
  let userLimits: any;
  let planContent: any;
  let isTeamDowngraded: boolean | undefined;
  let planName: string;
  let selectedFilter = "All";
  let hubId: string;
  $: hubId = openTeam?.teamId;
  $: planName = openTeam?._data?.plan?.name;
  const addButtonData = [
    {
      name: "Leave Hub",
      color: "var(--text-ds-danger-300)",
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
        visible: openTeam?.teamId !== "sharedWorkspaceTeam",
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
        name: "Hub Information",
        id: TeamTabsEnum.SETTINGS,
        count: 0,
        visible:
          (openTeam?.owner === userId &&
            openTeam.teamId !== "sharedWorkspaceTeam") ||
          isGuestUser === true,
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
      getPlanLimits();
      if (userRole) {
        planContent = planInfoByRole(userRole);
      }
    }
  }

  $: isTeamDowngraded = openTeam?._data?.isDowngraded ?? false;
  $: isDismissed = $isTeamDowngradePopupDismissed.get(hubId) ?? false;
  async function handleUpgradeClick() {
    setTeamDowngradePopupDismissed(hubId, true);
    await handleRedirectToAdminPanel();
  }

  function handleClosePopup() {
    setTeamDowngradePopupDismissed(hubId, true);
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
  let teamRestricted = false;
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

  const getPlanLimits = async () => {
    const data = await planLimits();
    userLimits = data;
  };

  const handleRedirectToAdminPanel = async () => {
    await handleRedirectAdminPanel();
    upgradePlanModal = false;
    upgradePlanModalInvite = false;
  };

  const handleRedirectToAdmin = async () => {
    await handleRedirectAdminPanel({ toWorkspace: true });
  };

  const handleRequestOwner = async () => {
    await contactOwner();
    upgradePlanModal = false;
    upgradePlanModalInvite = false;
  };

  $: {
    if (openTeam?.isRestricted) {
      teamRestricted = true;
    }
  }
</script>

{#if openTeam}
  <div
    class="teams-content h-100"
    style="background-color: var(--bg-ds-surface-900);"
  >
    {#if openTeam.owner && !teamRestricted}
      <div class="content-teams d-flex flex-column h-100 px-3 pt-3 pb-2">
        <div class="" style="">
          <div
            class="team-heading d-flex justify-content-between position-relative pb-3"
          >
            <h2
              class="d-flex ellipsis overflow-visible mb-0 team-title align-items-center"
            >
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

              {#if openTeam?.toMutableJSON()?.plan?.name}
                <div
                  class="ms-2 d-flex align-items-center gap-1 text-primary-400 cursor-pointer"
                  on:click={handleRedirectToAdmin}
                >
                  <p class="text-fs-12 mb-0 pb-0">Launch Admin Panel</p>
                  <OpenRegular />
                </div>
              {/if}
              <!-- {#if openTeam?.toMutableJSON()?.plan?.name}
                <span class="ps-2">
                  <Tag
                    type={"cyan"}
                    text={openTeam?.toMutableJSON()?.plan?.name ||
                      "Invalid Plan"}
                  />
                </span>
              {/if} -->
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
                  <span
                    class="d-flex justify-content-center align-items-center my-auto"
                    style="white-space: nowrap;"
                  >
                    {openTeam?.users.length} Members
                  </span>
                </p>
              {/if}
              <Button
                title={`Invite collaborators`}
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
              {#if openTeam && !isGuestUser}
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
                      class={`d-flex rounded px-2 text-fs-12 py-1 btn-formatter align-items-center filter-button ${
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
                      class={`d-flex rounded px-2 text-fs-12 py-1 btn-formatter align-items-center gap-1 filter-button ${
                        selectedFilter === WorkspaceType.PRIVATE
                          ? "bg-tertiary-500 text-secondary-100"
                          : ""
                      }`}
                      on:click={() => (selectedFilter = WorkspaceType.PRIVATE)}
                    >
                      <LockClosedRegular size="16px" />
                      Private
                    </span>
                    <span
                      role="button"
                      class={`d-flex rounded px-2 text-fs-12 py-1 btn-formatter align-items-center gap-1 filter-button ${
                        selectedFilter === WorkspaceType.PUBLIC
                          ? "bg-tertiary-500 text-secondary-100"
                          : ""
                      }`}
                      on:click={() => (selectedFilter = WorkspaceType.PUBLIC)}
                    >
                      <GlobeRegular size="16px" />
                      Public
                    </span>
                  </div>
                  <div class={`d-flex  rounded  align-items-center mb-3`}>
                    <Search
                      variant={"primary"}
                      id="search-input"
                      size="small"
                      placeholder="Search workspaces in {openTeam?.name}"
                      on:input={handleSearchInput}
                      bind:value={searchQuery}
                      customWidth={"320px"}
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
                    {selectedFilter}
                    {appEdition}
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
                    {appEdition}
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
                    {selectedFilter}
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
        {#if isTeamDowngraded && (userRole === TeamRole.TEAM_ADMIN || userRole === TeamRole.TEAM_OWNER) && !isDismissed}
          <div
            class="downgrade-card position-fixed"
            style="
              bottom: 30px;
              right: 20px;
              z-index: 500;
            "
          >
            <div class="downgrade-card-inner">
              <div class="downgrade-header">
                <div class="downgrade-icon">
                  <AlertOnIcon />
                </div>
                <p class="downgrade-title">Your Hub Has Been Downgraded</p>
                <button class="downgrade-close" on:click={handleClosePopup}>
                  ✕
                </button>
              </div>

              <p class="downgrade-description">
                As scheduled, your Hub is now on the {planName} edition.
                <br /><br />
                Based on your previous selections, your excess workspaces have been
                archived and team members removed from the Hub.
                <br /><br />
                To restore all content and permissions, you can upgrade your plan
                anytime.
              </p>

              <div class="d-flex justify-content-center">
                <Button
                  title="Upgrade Plan"
                  type="secondary"
                  size="small"
                  onClick={handleUpgradeClick}
                />
              </div>
            </div>
          </div>
        {/if}
      </div>
    {:else if teamRestricted}
      <div
        style="padding:16px; gap:24px; min-height:100vh"
        class="d-flex flex-column justify-content-center"
      >
        <div class="d-flex flex-row align-items-center">
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

          <div class="d-flex justify-content-end gap-4" style="">
            <Button
              title={`Invite collaborators`}
              type={"secondary"}
              startIcon={PeopleRegular}
              onClick={() => {}}
              disable={true}
            />
            <Button
              title={`New Workspace`}
              type={`primary`}
              startIcon={AddRegular}
              onClick={() => {}}
              loader={false}
              disable={true}
            />
          </div>
        </div>

        <div class="d-flex flex-row justfi-content-start">
          <div class="d-flex" style="gap:10px; margin-left: 16px;">
            <p class="text-restricted-headers">workspaces</p>
            <p class="text-restricted-headers">members</p>
          </div>
        </div>

        <div
          class="d-flex justify-content-center align-items-center flex-column"
          style="gap:10px; flex:1"
        >
          <p class="text-ds-font-size-20 text-ds-font-weight-semi-bold">
            Action Required to Restore This Hub
          </p>
          <div
            class="d-flex flex-column w-100 mx-auto text-ds-font-weight-regular text-ds-line-height-143 text-ds-font-size-14 d-flex justify-content-center align-items-center"
            style="max-width: 492px; color:var(--bg-ds-neutral-100);"
          >
            <div class="text-center">
              {#if userRole === TeamRole.TEAM_OWNER || userRole === TeamRole.TEAM_ADMIN}
                Access to the {openTeam?.name} is restricted for you and your team
                due to a <br /> payment failure.
                <a
                  on:click={handleRedirectToAdminPanel}
                  style="color:var(--bg-ds-primary-400); cursor:pointer;"
                  >Restore Hub Access</a
                >
              {:else}
                Access to the Rapid API Suite Hub is restricted due to a payment
                issue with the subscription. Please contact your Hub Owner, and
                ask them to update the Hub's billing information to restore
                access for the team.
              {/if}
            </div>
          </div>
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

          <div class="d-flex flex-row" style="gap:12px;">
            <Button
              type="primary"
              title="Accept"
              onClick={async () => {
                isInviteAcceptProgress = true;
                await onAcceptInvite(openTeam?.teamId, userId);
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

<PlanUpgradeModal
  bind:isOpen={upgradePlanModal}
  title={planContent?.title}
  description={planContent?.description}
  planType="Workspaces"
  planLimitValue={userLimits?.workspacesPerHub?.value || 3}
  currentPlanValue={openTeam?._data?.workspaces.length}
  isOwner={userRole === TeamRole.TEAM_OWNER || userRole === TeamRole.TEAM_ADMIN
    ? true
    : false}
  {handleContactSales}
  handleSubmitButton={userRole === TeamRole.TEAM_OWNER ||
  userRole === TeamRole.TEAM_ADMIN
    ? handleRedirectToAdminPanel
    : handleRequestOwner}
  userName={openTeam?._data?.name?.split(" ")[0]}
  userEmail={openTeam?._data?.users?.[0]?.email || ""}
  submitButtonName={planContent?.buttonName}
/>

<PlanUpgradeModal
  bind:isOpen={upgradePlanModalInvite}
  title={planContent?.title}
  description={planContent?.description}
  planType="Collaborators"
  planLimitValue={userLimits?.usersPerHub?.value || 5}
  currentPlanValue={invitedCount +
    (openTeam?._data?.invites?.length || 0) +
    (openTeam?._data?.users?.length || 0) -
    1}
  isOwner={userRole === TeamRole.TEAM_OWNER || userRole === TeamRole.TEAM_ADMIN
    ? true
    : false}
  {handleContactSales}
  handleSubmitButton={userRole === TeamRole.TEAM_OWNER ||
  userRole === TeamRole.TEAM_ADMIN
    ? handleRedirectToAdminPanel
    : handleRequestOwner}
  userName={openTeam?._data?.name?.split(" ")[0]}
  userEmail={openTeam?._data?.users?.[0]?.email || ""}
  submitButtonName={planContent?.buttonName}
/>

<style>
  .filter-button:hover {
    background-color: var(--bg-ds-surface-400);
    color: var(--text-ds-neutral-50);
  }

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
    width: calc(100% - 470px);
    font-size: 12px;
    color: var(--text-ds-neutral-200);
    font-weight: 500;
  }
  .heading {
    max-width: calc(100% - 250px);
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
  .text-restricted-headers {
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-style: normal;
    font-size: 12px;
    line-height: 130%;
    letter-spacing: 0;
    text-align: center;
    color: var(--text-ds-neutral-500);
    margin: 0px;
  }
  .downgrade-card {
    width: 340px;
    max-width: 480px;
    background: linear-gradient(
      135deg,
      rgba(17, 173, 240, 1),
      rgba(49, 108, 246, 1),
      rgba(97, 71, 255, 1)
    );
    padding: 1px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    overflow: hidden;
  }

  .downgrade-card-inner {
    background-color: rgba(24, 28, 38, 1);
    border-radius: 7px;
    width: 100%;
    height: 100%;
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    color: var(--text-primary);
    box-sizing: border-box;
  }

  .downgrade-header {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: nowrap;
  }

  .downgrade-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-ds-surface-200);
    border-radius: 50%;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }

  .downgrade-title {
    color: var(--text-ds-neutral-50);
    font-size: 12px;
    font-weight: 500;
    margin: 0;
    white-space: nowrap;
    flex: 1;
  }

  .downgrade-close {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-ds-neutral-400);
    font-size: 14px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .downgrade-description {
    font-size: 12px;
    color: var(--text-ds-neutral-300);
    line-height: 1.5;
    margin: 8px 0 16px 0;
    font-weight: 400;
    flex: 1;
    overflow-wrap: break-word;
  }

  .downgrade-upgrade-btn {
    background-color: var(--accent-primary);
    border: none;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s ease-in-out;
  }

  .downgrade-upgrade-btn:hover {
    opacity: 0.9;
  }
</style>
