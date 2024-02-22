<script lang="ts">
  import table from "$lib/assets/table.svg";
  import hamburger from "$lib/assets/hamburger.svg";
  import AllWorkspace from "$lib/components/dashboard/workspaces/AllWorkspace.svelte";
  import { workspaceView } from "$lib/store";
  import WorkspaceCardList from "../dashboard/workspace-card-list/WorkspaceCardList.svelte";
  import Members from "$lib/components/workspace/members/Members.svelte";
  import { onDestroy } from "svelte";
  import type {
    CurrentTeam,
    Team,
    TeamRepositoryMethods,
    TeamServiceMethods,
  } from "$lib/utils/interfaces";
  import TeamInvite from "./team-invite/TeamInvite.svelte";
  import { base64ToURL } from "$lib/utils/helpers";
  import { PeopleIcon, ShowMoreIcon } from "$lib/assets/app.asset";
  import Settings from "./settings/Settings.svelte";
  import Button from "../buttons/Button.svelte";
  import ModalWrapperV1 from "../Modal/Modal.svelte";
  export let userId: string;
  export let data: any;
  export let loaderColor = "default";
  export let handleWorkspaceSwitch: any;
  export let handleWorkspaceTab: any;
  export let activeSideBarTabMethods: any;
  export let openTeam: Team;
  export let currentTeam: CurrentTeam;
  export let handleCreateWorkspace: any,
    teamServiceMethods: TeamServiceMethods,
    teamRepositoryMethods: TeamRepositoryMethods,
    workspaces;
  export let handleLeaveTeamModal: () => void;
  export let handleOnShowMoreClick: () => void;
  export let handleCloseShowMoreClick: () => void;
  export let isShowMoreVisible: boolean = false;
  export let workspaceUnderCreation = false;

  let selectedTab = "all-workspace";
  let selectedView: string;

  const selectedViewSubscribe = workspaceView.subscribe((value) => {
    selectedView = value;
  });

  let userType: string;
  const findUserType = () => {
    openTeam?.users.forEach((user) => {
      if (user.id === userId) {
        userType = user.role;
      }
    });
  };

  let previousTeamId: string;
  $: {
    if (userId) {
      findUserType();
    }
  }
  $: {
    if (openTeam) {
      findUserType();
      if (previousTeamId !== openTeam?.teamId) {
        selectedTab = "all-workspace";
      }
      previousTeamId = openTeam?.teamId;
    }
  }

  onDestroy(() => {
    selectedViewSubscribe();
  });
  let teamInvitePopup = false;
</script>

<ModalWrapperV1
  title={"Invite Team Members"}
  type={"dark"}
  width={"35%"}
  zIndex={1000}
  isOpen={teamInvitePopup}
  handleModalState={(flag) => {
    teamInvitePopup = flag;
  }}
>
  <TeamInvite
    {userId}
    teamLogo={openTeam?.logo}
    onSubmit={teamServiceMethods.inviteMembersAtTeam}
    onRefresh={teamServiceMethods.refreshWorkspace}
    updateRepo={teamRepositoryMethods.modifyTeam}
    teamName={openTeam?.name}
    teamId={openTeam?.teamId}
    workspaces={workspaces.filter((elem) => {
      return elem?.team?.teamId === openTeam?.teamId;
    })}
    handleInvitePopup={(flag) => {
      teamInvitePopup = flag;
    }}
  /></ModalWrapperV1
>
<svelte:window on:click={handleCloseShowMoreClick()} />
<div class="teams-content bg-backgroundColor">
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
                  style="width: 60px !important; height: 60px !important; padding-top: 2px; display: flex; border-radius: 50%;"
                  src={base64ToURL(openTeam?.logo)}
                  alt=""
                />{:else}
                <p
                  class={`text-defaultColor w-25 text-center my-auto align-items-center justify-content-center profile-circle bg-dullBackground border-defaultColor border-2`}
                  style={`font-size: 40px; padding-top: 2px; width: 60px !important; height: 60px !important; display: flex; border: 2px solid #45494D;border-radius: 50%;`}
                >
                  {openTeam?.name[0] ? openTeam?.name[0].toUpperCase() : ""}
                </p>
              {/if}
              <span class="ms-4 my-auto ellipsis overflow-hidden heading"
                >{openTeam?.name || ""}
              </span>
              <div class="mr-4 position-relative my-auto">
                {#if openTeam?.owner !== userId}
                  <div class="leave-team-container">
                    <Button
                      onClick={() => {
                        if (!isShowMoreVisible) {
                          setTimeout(() => {
                            handleOnShowMoreClick();
                          }, 100);
                        }
                      }}
                      allowChild={true}
                      buttonClassProp={`rounded mx-2 my-auto p-0 d-flex ${
                        !isShowMoreVisible ? "transparent" : "bg-plusButton"
                      } `}
                      type={`icon`}
                    >
                      <ShowMoreIcon
                        color={!isShowMoreVisible
                          ? "var(--white-color)"
                          : "var(--blackColor)"}
                        classProp=""
                      />
                    </Button>
                  </div>
                  <button
                    on:click={(e) => {
                      handleLeaveTeamModal();
                      handleOnShowMoreClick();
                    }}
                    disabled={openTeam?.owner == userId}
                    style="font-size: 14px;"
                    class="leave-btn border-1 position-absolute {!isShowMoreVisible &&
                      'd-none'} bg-blackColor pe-5 py-2 px-3 mt-3 ms-2 rounded {openTeam?.owner ==
                    userId
                      ? 'text-lightGray'
                      : 'text-dangerColor'}
                  ">Leave Team</button
                  >
                {/if}
              </div>
            </h2>

            <div class="d-flex align-items-end justify-content-end">
              {#if openTeam?.users?.length > 0}
                <p class="d-flex my-auto ms-1 me-4" style="font-size: 13px;">
                  <PeopleIcon
                    color={"var(--sparrow-text-color)"}
                    classProp="mx-2 my-auto d-flex"
                  />
                  <span class="my-auto">{openTeam?.users.length} Members</span>
                </p>
              {/if}
              {#if userType && userType !== "member"}
                <Button
                  title={`Invite`}
                  type={`dark`}
                  textStyleProp={"font-size: var(--small-text)"}
                  onClick={() => {
                    teamInvitePopup = true;
                  }}
                  buttonClassProp={`my-auto px-3 pt-1 me-4`}
                  buttonStyleProp={`height: 30px;`}
                />
                <Button
                  title={`New Workspace`}
                  type={`primary`}
                  loader={workspaceUnderCreation}
                  loaderSize={17}
                  textStyleProp={"font-size: var(--small-text)"}
                  onClick={handleCreateWorkspace}
                  buttonClassProp={`my-auto`}
                  buttonStyleProp={`height: 30px;`}
                />
              {/if}
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-12">
          <div
            class="teams-menu d-flex justify-content-between align-items-center pb-4"
          >
            <div class="teams-menu__left gap-4">
              <span
                style="padding: 8px 8px;"
                on:click={() => (selectedTab = "all-workspace")}
                class="team-menu__link cursor-pointer rounded"
                class:tab-active={selectedTab === "all-workspace"}
                >Workspaces <span
                  class="item-count"
                  class:item-count-active={selectedTab === "all-workspace"}
                >
                  {`(${
                    workspaces?.filter((elem) => {
                      return elem?.team?.teamId === openTeam?.teamId;
                    }).length || 0
                  })`}
                </span>
              </span>
              <span
                style="padding: 8px 8px;"
                on:click={() => (selectedTab = "members")}
                class="team-menu__link cursor-pointer rounded"
                class:tab-active={selectedTab === "members"}
                >Members <span
                  class="item-count"
                  class:item-count-active={selectedTab === "members"}
                  >{openTeam?.users?.length
                    ? `(${openTeam.users.length})`
                    : ""}</span
                >
              </span>
              {#if openTeam?.owner === userId}
                <span
                  style="padding: 8px 8px;"
                  on:click={() => (selectedTab = "settings")}
                  class="team-menu__link cursor-pointer rounded"
                  class:tab-active={selectedTab === "settings"}>Settings</span
                >
              {/if}
            </div>
            <div class="teams-menu__right">
              {#if selectedTab === "all-workspace"}
                <span class="mx-3" style="cursor:pointer;">
                  <img
                    on:click={() => {
                      workspaceView.set("GRID");
                    }}
                    class:view-active={selectedView === "GRID"}
                    src={table}
                    alt=""
                  />
                </span>
                <span style="cursor:pointer;">
                  <img
                    on:click={() => {
                      workspaceView.set("TABLE");
                    }}
                    class:view-active={selectedView === "TABLE"}
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

    {#if selectedView == "TABLE" && selectedTab == "all-workspace"}
      <AllWorkspace
        {userId}
        data={workspaces?.filter((elem) => {
          return elem?.team?.teamId === openTeam?.teamId;
        }) || []}
        {selectedTab}
        {handleWorkspaceSwitch}
        {handleWorkspaceTab}
        {activeSideBarTabMethods}
        {openTeam}
        {userType}
      />
    {:else if selectedView == "GRID" && selectedTab == "all-workspace"}
      <WorkspaceCardList
        {userId}
        {handleCreateWorkspace}
        {openTeam}
        currActiveTeam={currentTeam}
        workspaces={workspaces?.filter((elem) => {
          return elem?.team?.teamId === openTeam?.teamId;
        }) || []}
        {handleWorkspaceSwitch}
        {handleWorkspaceTab}
        {activeSideBarTabMethods}
        {workspaceUnderCreation}
      />
    {:else if selectedTab === "members"}
      <Members
        {userId}
        {userType}
        {openTeam}
        {teamServiceMethods}
        {workspaces}
        {teamRepositoryMethods}
      />
    {:else if selectedTab === "settings" && userType === "owner"}
      <Settings
        openTeam={openTeam?.toMutableJSON()}
        {teamServiceMethods}
        {teamRepositoryMethods}
      ></Settings>
    {/if}
  </div>
</div>

<style>
  .custom-tooltip {
    --bs-tooltip-bg: var(--bs-primary);
  }

  .teams-content {
    width: calc(100vw - 352px);
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
</style>
