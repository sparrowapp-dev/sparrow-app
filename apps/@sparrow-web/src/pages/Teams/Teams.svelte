<script lang="ts">
  import type { Observable } from "rxjs";
  import type {
    TabDocument,
    TeamDocument,
    WorkspaceDocument,
  } from "@app/database/database";

  import {
    leftPanelWidth,
    rightPanelWidth,
    leftPanelCollapse,
  } from "@sparrow/teams/stores";

  import {
    RecentApis,
    RecentWorkspace,
    TeamList,
  } from "@sparrow/teams/features";

  import { Pane, Splitpanes } from "svelte-splitpanes";
  import TeamExplorerPage from "../TeamExplorerPage/TeamExplorerPage.svelte";
  import { TeamsViewModel } from "./Teams.ViewModel";
  import { Modal, Tooltip, Dropdown, Button } from "@sparrow/library/ui";
  import { pagesMotion } from "../../constants";
  import { version } from "../../../package.json";
  import { CreateTeam } from "@sparrow/common/features";
  import {
    GithubStarRedirect,
    LaunchDesktop,
  } from "@sparrow/common/components";

  const _viewModel = new TeamsViewModel();
  const teamList: Observable<TeamDocument[]> = _viewModel.teams;
  const tabList: Observable<TabDocument[]> = _viewModel.tabs;
  const setOpenTeam = _viewModel.setOpenTeam;
  const disableNewInviteTag = _viewModel.disableNewInviteTag;
  const modifyTeam = _viewModel.modifyTeam;

  let isCreateTeamModalOpen: boolean = false;
  const collectionList = _viewModel.collection;
  const onApiClick = _viewModel.handleApiClick;
  const OnWorkspaceSwitch = _viewModel.handleSwitchWorkspace;
  let workspaces: Observable<WorkspaceDocument[]> = _viewModel.workspaces;
  const openTeam: Observable<TeamDocument> = _viewModel.openTeam;
  const activeTeamTab: Observable<string> = _viewModel.activeTeamTab;
  import { onDestroy, onMount } from "svelte";
  import { Motion } from "svelte-motion";
  import { isUserFirstSignUp } from "src/store/user.store";
  import { user } from "src/store/auth.store";
  import { WithButton } from "@sparrow/workspaces/hoc";
  import {
    ChevronDoubleLeftRegular,
    ChevronDoubleRightRegular,
    DoubleArrowIcon,
    GithubIcon,
    SparkleRegular,
  } from "@sparrow/library/icons";
  import { ListTeamNavigation } from "@sparrow/teams/features";
  import { TeamTabsEnum } from "@sparrow/teams/constants/TeamTabs.constants";
  import constants from "../../constants/constants";
  import { navigate } from "svelte-navigator";
  import type { TeamDocType } from "src/models/team.model";
  import { WelcomePopUpWeb } from "@sparrow/common/components";
  import type { GithubRepoDocType } from "src/models/github-repo.model";
  import { DownloadApp } from "@sparrow/common/features";
  import { shouldRunThrottled } from "@sparrow/common/store";

  let githubRepoData: GithubRepoDocType;
  let isGuestUser = false;

  const externalSparrowGithub = constants.SPARROW_GITHUB;

  let userId = "";
  const userSubscriber = user.subscribe(async (value) => {
    if (value) {
      userId = value._id;
    }
  });
  let isTrialExhausted: boolean | undefined = undefined;

  onMount(async () => {
    if (userId && shouldRunThrottled(userId)) {
      await Promise.all([
        _viewModel.refreshTeams(userId),
        _viewModel.refreshWorkspaces(userId),
      ]);
    } else {
      console.error(`Throttled for ${userId}`);
    }

    let githubRepo = await _viewModel.getGithubRepo();
    githubRepoData = githubRepo?.getLatest().toMutableJSON();
    splitter = document.querySelector(".team-splitter .splitpanes__splitter");

    await _viewModel.fetchGithubRepo();
    githubRepo = await _viewModel.getGithubRepo();
    githubRepoData = githubRepo?.getLatest().toMutableJSON();
    isGuestUser = await _viewModel.getGuestUser();
    isTrialExhausted = await _viewModel.getUserTrialExhaustedStatus();
  });

  const startTrial = async () => {
    await _viewModel.handleStartTrial();
  };

  let splitter: HTMLElement | null;

  const handleCollapseCollectionList = () => {
    leftPanelCollapse.set(!$leftPanelCollapse);
  };

  $: {
    if (splitter && $leftPanelCollapse === true) {
      splitter.style.display = "none";
    }
    if (splitter && $leftPanelCollapse === false) {
      splitter.style.display = "unset";
    }
  }

  let isWelcomePopupOpen = false;
  const isUserFirstSignUpSubscriber = isUserFirstSignUp.subscribe((value) => {
    if (value) {
      isWelcomePopupOpen = value;
    }
  });

  const launchSparrowWebApp = () => {
    let appDetected = false;

    // Handle when window loses focus (app opens)
    const handleBlur = () => {
      appDetected = true;
      window.removeEventListener("blur", handleBlur);
      clearTimeout(detectAppTimeout);
    };

    window.addEventListener("blur", handleBlur);

    // Try to open the app
    _viewModel.setupRedirect();

    // Check if app opened after a short delay
    const detectAppTimeout = setTimeout(() => {
      window.removeEventListener("blur", handleBlur);

      // Only show popup if app wasn't detected
      if (!appDetected) {
        isPopupOpen = true;
      }
    }, 500);
  };

  let openTeamData: TeamDocType;
  const openTeamSubscriber = openTeam.subscribe((_team) => {
    if (_team) {
      const teamJSON = _team?.toMutableJSON();
      setTimeout(() => {
        openTeamData = teamJSON;
      }, 0);
    }
  });

  onDestroy(() => {
    openTeamSubscriber.unsubscribe();
    userSubscriber();
    isUserFirstSignUpSubscriber();
  });

  let isPopupOpen = false;
</script>

<Motion {...pagesMotion} let:motion>
  <div class="h-100" use:motion>
    <Splitpanes
      class="team-splitter h-100"
      style="width: calc(100vw - 54px)"
      on:resize={(e) => {
        leftPanelWidth.set(e.detail[0].size);
        rightPanelWidth.set(e.detail[1].size);
      }}
    >
      <Pane
        size={$leftPanelCollapse ? 0 : $leftPanelWidth}
        minSize={20}
        class="bg-secondary-900-important sidebar-left-panel"
      >
        {#if $leftPanelCollapse}
          <div>
            <span
              class="d-flex align-items-center justify-content-center border-0 angleRight w-16 position-absolute {$leftPanelCollapse
                ? 'd-block'
                : 'd-none'}"
              style="left:57px; bottom: 20px; width: 20px; height:20px ; background-color: transparent; z-index: {$leftPanelCollapse
                ? '2'
                : '0'}"
              on:click={() => {
                handleCollapseCollectionList();
              }}
            >
              <Tooltip title={"Expand"} placement={"right-center"}>
                <Button
                  type="teritiary-regular"
                  size="extra-small"
                  customWidth="24px"
                  startIcon={ChevronDoubleRightRegular}
                />
              </Tooltip>
            </span>
          </div>
        {/if}
        {#if !$leftPanelCollapse}
          <div
            class="d-flex flex-column sidebar h-100 d-flex flex-column justify-content-between"
            style="background-color: var(--bg-ds-surface-700);"
          >
            <div style="flex:1; overflow:auto;">
              <!--Teams list-->
              <TeamList
                bind:isCreateTeamModalOpen
                {isGuestUser}
                {setOpenTeam}
                teamList={$teamList}
                {disableNewInviteTag}
                {modifyTeam}
              />
              <!-- Recent APIs-->
              {#if !isGuestUser}
                <section class="d-flex flex-column" style="max-height:33%;">
                  <RecentApis
                    tabList={$tabList}
                    data={workspaces}
                    collectionList={$collectionList}
                    {onApiClick}
                  />
                </section>

                <!-- Recent Workspace Section -->
                <section class="d-flex flex-column" style="max-height:33%;">
                  <RecentWorkspace
                    data={workspaces}
                    {openTeam}
                    {OnWorkspaceSwitch}
                  />
                </section>
              {/if}
            </div>

            <!-- github repo section -->
            <section class="d-flex p-2 flex-column">
              {#if !isGuestUser && isTrialExhausted == false}
                <div class="d-flex flex-column" style="gap: 12px">
                  <div class="d-flex align-items-start">
                    <div>
                      <SparkleRegular />
                    </div>
                    <div class="d-flex flex-column text-ds-font-size-12">
                      <div style="color: var(--text-ds-neutral-50);">
                        Unlock trial Access
                      </div>
                      <div style="color: var(--text-ds-neutral-200);">
                        Unlock advanced features for 14 days, no charges until
                        trial ends.
                      </div>
                    </div>
                  </div>
                  <Button
                    title="Start Free Trial"
                    size="medium"
                    type="outline-primary"
                    onClick={startTrial}
                    disable={false}
                    loader={false}
                  />
                </div>
                <div
                  style="border-bottom: 1px solid var(--bg-ds-surface-100); margin: 8px 0 0 0;"
                ></div>
              {/if}
              <div
                class="p-2 d-flex align-items-center justify-content-between"
                style="z-index: 4;"
              >
                <Tooltip title={"Star Us On GitHub"} placement={"top-center"}>
                  <GithubStarRedirect
                    onClick={async () => {
                      await open(externalSparrowGithub);
                    }}
                    count={githubRepoData?.stargazers_count || ""}
                  />
                </Tooltip>

                <div class="d-flex align-items-center">
                  <Button
                    type="teritiary-regular"
                    size="extra-small"
                    customWidth="24px"
                    startIcon={ChevronDoubleLeftRegular}
                    onClick={() => {
                      handleCollapseCollectionList();
                    }}
                    disable={false}
                    loader={false}
                  />
                </div>
              </div>
            </section>
            <!-- Launch sparrow desktop -->
            <LaunchDesktop {launchSparrowWebApp} />
          </div>
        {/if}
      </Pane>
      <Pane
        size={$leftPanelCollapse ? 100 : $rightPanelWidth}
        minSize={60}
        class="bg-secondary-800-important"
      >
        <TeamExplorerPage
          activeTeamTab={$activeTeamTab}
          onUpdateActiveTab={_viewModel.updateActiveTeamTab}
          bind:isPopupOpen
        />
      </Pane>
    </Splitpanes>
  </div>
</Motion>

<Modal
  title=""
  type="dark"
  width="45%"
  zIndex={1000}
  isOpen={isPopupOpen}
  handleModalState={() => {
    isPopupOpen = false;
  }}
>
  <DownloadApp
    onInstallRedirect={() => {
      window.open(constants.MARKETING_URL, "_blank");
    }}
    onGithubRedirect={() => {
      window.open(constants.SPARROW_GITHUB, "_blank");
    }}
    onDocsRedirect={() => {
      window.open(constants.INTRO_DOCS_URL, "_blank");
    }}
  />
</Modal>

<Modal
  title={""}
  type={"dark"}
  width={"40%"}
  zIndex={1000}
  isOpen={isWelcomePopupOpen}
  handleModalState={() => {
    isUserFirstSignUp.set(false);
    isWelcomePopupOpen = false;
  }}
>
  <WelcomePopUpWeb />
</Modal>

<Modal
  title={"New Hub"}
  type={"dark"}
  width={"35%"}
  zIndex={1000}
  isOpen={isCreateTeamModalOpen}
  handleModalState={(flag) => {
    isCreateTeamModalOpen = flag;
  }}
>
  <CreateTeam
    handleModalState={(flag = false) => {
      isCreateTeamModalOpen = flag;
    }}
    onCreateTeam={_viewModel.createTeam}
  />
</Modal>

<style>
  :global(.team-splitter .splitpanes__splitter) {
    width: 6px !important;
    height: auto !important;
    background-color: var(--bg-ds-surface-700) !important;
    border-left: 5px solid var(--border-ds-surface-700) !important;
    border-right: 0px solid var(--border-ds-surface-700) !important;
    border-top: 0 !important;
    border-bottom: 0 !important;
  }
  :global(
    .team-splitter .splitpanes__splitter:active,
    .team-splitter .splitpanes__splitter:hover
  ) {
    background-color: var(--bg-ds-primary-200) !important;
  }

  .sidebar-teams-list::-webkit-scrollbar-thumb {
    background-color: var(--bg-secondary-330);
  }

  .sidebar-teams-list::-webkit-scrollbar-button {
    color: var(--bg-secondary-330);
  }
  .teams-heading {
    padding: 6px;
    padding-left: 15px;
    font-size: 14px;
    font-weight: 700;
    line-height: 21px;
  }
  .teams-outer {
    padding: 6px 5px;
    background-color: transparent;
  }
  .teams-outer.active {
    background-color: var(--text-tertiary-750);
  }
  .new-team-btn {
    background-color: transparent;
  }
  .new-team-btn:hover {
    background-color: var(--border-color);
  }
  .teams-outer:hover {
    background-color: var(--bg-tertiary-750);
  }

  .teams-outer:active {
    background-color: var(--bg-secondary-320);
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

  .sidebar-recentapi-list {
    max-height: 30vh;
  }
  .new-invite {
    font-size: 12px !important;
  }
  .teams-title {
    width: calc(100% - 40px);
    text-align: left;
  }

  .title {
    width: calc(100% - 40px);
    text-align: left;
  }
  .not-found-text {
    color: var(--request-arc);
    font-size: 12px;
  }

  .github-icon {
    padding-bottom: 50px !important;
  }
</style>
