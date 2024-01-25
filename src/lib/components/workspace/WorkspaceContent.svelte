<script lang="ts">
  import { Link } from "svelte-navigator";
  import table from "$lib/assets/table.svg";
  import hamburger from "$lib/assets/hamburger.svg";
  import AllWorkspace from "$lib/components/table/all-workspace/AllWorkspace.svelte";
  import { workspaceView, openedTeam } from "$lib/store";
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  import WorkspaceCardList from "../dashboard/workspace-card-list/WorkspaceCardList.svelte";
  import { onDestroy } from "svelte";
  import type { CurrentTeam } from "$lib/utils/interfaces";
  import { base64ToURL } from "$lib/utils/helpers";
  import type { TeamDocument } from "$lib/database/app.database";
  import { TeamViewModel } from "../../../pages/Teams/team.viewModel";
  import type { Observable } from "rxjs";
  import { PeopleIcon, ShowMoreIcon } from "$lib/assets/app.asset";
  import { CustomButton, IconButton } from "$lib/components";

  export let userId: string;
  export let data: any;
  export let loaderColor = "default";
  export let handleWorkspaceSwitch: any;
  export let handleWorkspaceTab: any;
  export let activeSideBarTabMethods: any;
  export let currentTeam: CurrentTeam;
  export let handleCreateWorkspace: any;
  export let handleLeaveTeamModal: () => void;
  export let handleOnShowMoreClick: (e) => void;
  export let isShowMoreVisible: boolean = false;

  let currOpenedTeam: CurrentTeam;
  let isLoading: boolean = false;
  let selectedTab = "all-workspace";
  let selectedView: string;
  let currOpenedTeamRxDoc: Observable<TeamDocument>;
  let isTooltipVisible: boolean = false;

  const _teamViewModel = new TeamViewModel();

  const openedTeamSubscribe = openedTeam.subscribe(async (value) => {
    if (value) {
      currOpenedTeam = value;
      currOpenedTeamRxDoc = await _teamViewModel.getTeam(value.id);
    }
  });
  const selectedViewSubscribe = workspaceView.subscribe((value) => {
    selectedView = value;
  });

  onDestroy(() => {
    selectedViewSubscribe();
    openedTeamSubscribe();
  });
</script>

<div class="teams-content bg-backgroundColor">
  <div class="content-teams px-md-1 px-lg-3 px-3 pt-5">
    <div
      class="container-fluid"
      on:mouseleave={(e) => {
        if (!isShowMoreVisible) handleOnShowMoreClick(e);
      }}
    >
      <div class="row">
        <div class="col-12 pb-3">
          <div
            class="team-heading d-flex justify-content-between position-relative"
          >
            <h2 class="d-flex ellipsis overflow-visible">
              {#if base64ToURL(currOpenedTeam.base64String) && base64ToURL(currOpenedTeam.base64String) !== ""}
                <img
                  class="text-center w-25 align-items-center justify-content-center profile-circle bg-dullBackground mb-3"
                  style="width: 60px !important; height: 60px !important; padding-top: 2px; display: flex; border-radius: 50%;"
                  src={base64ToURL(currOpenedTeam.base64String)}
                  alt=""
                />{:else}
                <p
                  class={`text-defaultColor w-25 text-center my-auto align-items-center justify-content-center profile-circle bg-dullBackground border-defaultColor border-2`}
                  style={`font-size: 40px; padding-top: 2px; width: 60px !important; height: 60px !important; display: flex; border: 2px solid #45494D;border-radius: 50%;`}
                >
                  {currOpenedTeam.name[0]
                    ? currOpenedTeam.name[0].toUpperCase()
                    : ""}
                </p>
              {/if}
              <span class="ms-4 my-auto ellipsis overflow-hidden"
                >{currOpenedTeam.name}
              </span>
              <div class="mr-4 position-relative my-auto">
                <IconButton
                  classProp="rounded mx-2 my-auto p-0 d-flex {isShowMoreVisible
                    ? 'transparent'
                    : 'bg-plusButton'}"
                  onClick={handleOnShowMoreClick}
                  ><ShowMoreIcon classProp="" /></IconButton
                >
                {#if $currOpenedTeamRxDoc?._data?.owner == userId}
                  <button
                    on:click={(e) => {
                      handleLeaveTeamModal();
                      handleOnShowMoreClick(e);
                    }}
                    on:mouseenter={() => (isTooltipVisible = true)}
                    on:mouseleave={() => (isTooltipVisible = false)}
                    disabled={$currOpenedTeamRxDoc?._data?.owner == userId}
                    style="font-size: 14px;"
                    class="position-absolute {isShowMoreVisible &&
                      'd-none'} {isShowMoreVisible
                      ? 'bg-plusButton'
                      : 'bg-blackColor'} border-0 py-2 px-3 mt-2 ms-2 rounded {$currOpenedTeamRxDoc
                      ?._data?.owner == userId
                      ? 'text-lightGray'
                      : 'text-dangerColor'}
                ">Leave Team</button
                  >
                  <p
                    style="font-size: 10px;"
                    class="position-absolute mt-5 ms-2 {!isTooltipVisible &&
                      'd-none'} bg-backgroundDark py-1 px-2 rounded text-dangerColor"
                  >
                    Owner cannot leave the team!
                  </p>
                {:else}
                  <button
                    on:click={(e) => {
                      handleLeaveTeamModal();
                      handleOnShowMoreClick(e);
                    }}
                    disabled={$currOpenedTeamRxDoc?._data?.owner == userId}
                    style="font-size: 14px;"
                    class="position-absolute {isShowMoreVisible &&
                      'd-none'} bg-blackColor border-0 py-2 px-3 mt-3 ms-2 rounded {$currOpenedTeamRxDoc
                      ?._data?.owner == userId
                      ? 'text-lightGray'
                      : 'text-dangerColor'}
                  ">Leave Team</button
                  >
                {/if}
              </div>
            </h2>

            {#if $currOpenedTeamRxDoc?._data?.admins?.includes(userId) || $currOpenedTeamRxDoc?._data?.owner == userId}
              <div class="d-flex align-items-end justify-content-end">
                {#if $currOpenedTeamRxDoc?._data?.users.length > 1}
                  <p class="d-flex my-auto ms-1 me-4" style="font-size: 13px;">
                    <PeopleIcon
                      color={"#8A9299"}
                      classProp="mx-2 my-auto d-flex"
                    />
                    <span class="my-auto"
                      >{$currOpenedTeamRxDoc?._data?.users.length} Members</span
                    >
                  </p>
                {/if}
                <CustomButton
                  text={`Invite`}
                  type={`dark`}
                  fontSize={12}
                  onClick={() => {
                    return;
                  }}
                  classProp={`my-auto px-3 pt-1 me-4`}
                  styleProp={`height: 30px;`}
                />
                <CustomButton
                  text={`New Workspace`}
                  type={`primary`}
                  loader={isLoading}
                  fontSize={12}
                  onClick={handleCreateWorkspace}
                  classProp={`my-auto `}
                  styleProp={`height: 30px;`}
                />
              </div>
            {/if}
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-12">
          <div
            class="teams-menu d-flex justify-content-between align-items-center pb-4"
          >
            <div class="teams-menu__left gap-4">
              <Link style="text-decoration:none;" to="all-workspace"
                ><span
                  style="padding: 8px 8px;"
                  on:click={() => (selectedTab = "all-workspace")}
                  class="team-menu__link"
                  class:tab-active={selectedTab === "all-workspace"}
                  >Workspaces {$data &&
                  $data
                    .slice()
                    .filter((item) => item.team.teamId == currOpenedTeam.id)
                    .length > 0
                    ? `(${
                        $data
                          ?.slice()
                          .filter(
                            (item) => item.team.teamId == currOpenedTeam.id,
                          ).length
                      })`
                    : ""}</span
                ></Link
              >
              {#if $currOpenedTeamRxDoc?._data?.owner == userId}
                <Link style="text-decoration:none;" to="personal-workspaces"
                  ><span
                    style="padding: 8px 8px;"
                    on:click={() => (selectedTab = "settings")}
                    class="team-menu__link"
                    class:tab-active={selectedTab === "settings"}>Settings</span
                  ></Link
                >
              {/if}
            </div>
            <div class="teams-menu__right">
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
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- <Route path="/all-workspace"> -->
    {#if selectedView == "TABLE" && selectedTab == "all-workspace"}
      <AllWorkspace
        {userId}
        openedTeam={currOpenedTeam}
        {data}
        {selectedTab}
        {handleWorkspaceSwitch}
        {handleWorkspaceTab}
        {activeSideBarTabMethods}
        {currOpenedTeamRxDoc}
      />
    {:else if selectedView == "GRID" && selectedTab == "all-workspace" && $data}
      <WorkspaceCardList
        {userId}
        {handleCreateWorkspace}
        openedTeam={currOpenedTeam}
        currActiveTeam={currentTeam}
        workspaces={data}
        {handleWorkspaceSwitch}
        {handleWorkspaceTab}
        {activeSideBarTabMethods}
        {currOpenedTeamRxDoc}
      />
    {/if}
    <!-- </Route> -->
  </div>
</div>

<style>
  .custom-tooltip {
    --bs-tooltip-bg: var(--bs-primary);
  }

  .teams-content {
    width: 100%;
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
  .content-teams__btn-new-workspace {
    height: 30px;
    background-color: #1193f0;
  }
  .content-teams__btn-invite {
    height: 30px;
    background-color: var(--border-color);
  }
  .tab-active {
    color: var(--white-color);

    border-bottom: 3px solid var(--workspace-hover-color);
  }
  .view-active {
    filter: invert(65%) sepia(63%) saturate(551%) hue-rotate(185deg)
      brightness(103%) contrast(104%);
  }
</style>
