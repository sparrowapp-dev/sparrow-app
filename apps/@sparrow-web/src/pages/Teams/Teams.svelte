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

  import { Pane, Splitpanes } from "svelte-splitpanes";
  import TeamExplorerPage from "../TeamExplorerPage/TeamExplorerPage.svelte";
  import { TeamsViewModel } from "./Teams.ViewModel";
  import { Modal, Tooltip, Dropdown } from "@sparrow/library/ui";
  import { pagesMotion } from "../../constants";
  import { version } from "../../../package.json";

  const _viewModel = new TeamsViewModel();
  const teamList: Observable<TeamDocument[]> = _viewModel.teams;
  const tabList: Observable<TabDocument[]> = _viewModel.tabs;

  export let isCreateTeamModalOpen;

  let workspaces: Observable<WorkspaceDocument[]> = _viewModel.workspaces;
  const openTeam: Observable<TeamDocument> = _viewModel.openTeam;
  const activeTeamTab: Observable<string> = _viewModel.activeTeamTab;
  import { onMount } from "svelte";
  import { Motion } from "svelte-motion";
  import { isUserFirstSignUp } from "src/store/user.store";
  import { user } from "src/store/auth.store";
  import { WithButton } from "@sparrow/workspaces/hoc";
  import {
    DoubleArrowIcon,
    GithubIcon,
    MacIcon,
    WindowsIcon,
  } from "@sparrow/library/icons";
  import { ListTeamNavigation } from "@sparrow/teams/features";
  import { TeamTabsEnum } from "@sparrow/teams/constants/TeamTabs.constants";
  import constants from "../../constants/constants";
  import { navigate } from "svelte-navigator";
  import type { TeamDocType } from "src/models/team.model";
  import { WelcomePopUpWeb } from "@sparrow/common/components";
  import type { GithubRepoDocType } from "src/models/github-repo.model";
  import { DownloadApp } from "@sparrow/common/features";

  let githubRepoData: GithubRepoDocType;
  let isGuestUser = false;

  const externalSparrowGithub = constants.SPARROW_GITHUB;

  let userId = "";
  user.subscribe(async (value) => {
    if (value) {
      userId = value._id;
    }
  });

  onMount(async () => {
    let githubRepo = await _viewModel.getGithubRepo();
    githubRepoData = githubRepo?.getLatest().toMutableJSON();
    splitter = document.querySelector(".team-splitter .splitpanes__splitter");

    await _viewModel.fetchGithubRepo();
    githubRepo = await _viewModel.getGithubRepo();
    githubRepoData = githubRepo?.getLatest().toMutableJSON();
    isGuestUser = await _viewModel.getGuestUser();
  });

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
  isUserFirstSignUp.subscribe((value) => {
    if (value) {
      isWelcomePopupOpen = value;
    }
  });
  let isGithubStarHover = false;

  let activeIndex;

  const refreshTabs = () => {
    return [
      {
        name: "Workspaces",
        id: TeamTabsEnum.WORKSPACES,
        count: $openTeam?.workspaces?.length,
        visible: true,
        disabled: isGuestUser === true ? true : false,
      },
      {
        name: "Members",
        id: TeamTabsEnum.MEMBERS,
        count: $openTeam?.users?.length,
        visible: true,
        disabled: isGuestUser === true ? true : false,
      },
      {
        name: "Settings",
        id: TeamTabsEnum.SETTINGS,
        count: 0,
        visible: $openTeam?.owner === userId,
        disabled: isGuestUser === true ? true : false,
      },
    ];
  };

  let teamTabs = [];
  $: {
    if ($openTeam) {
      setTimeout(() => {
        activeIndex = $openTeam?.teamId;
        teamTabs = refreshTabs();
      }, 0);
    }
  }

  $: {
    if (isGuestUser) {
      teamTabs = refreshTabs();
    }
  }

  let isExpandLoginButton = false;
  let isHovered = false;
  const handleMouseOver = () => {
    isHovered = true;
  };
  const handleMouseOut = () => {
    isHovered = false;
  };
  let windowOs = true;
  function getOS() {
    let userAgent = window.navigator.userAgent;
    if (userAgent.indexOf("Mac") != -1) {
      windowOs = true;
    } else if (userAgent.indexOf("Windows") != -1) {
      windowOs = false;
    }
  }
  onMount(() => {
    getOS();
  });

  function launchSparrowWebApp() {
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
  }

  let openTeamData: TeamDocType;
  openTeam.subscribe((_team) => {
    if (_team) {
      const teamJSON = _team?.toMutableJSON();
      setTimeout(() => {
        openTeamData = teamJSON;
      }, 0);
    }
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
            <button
              class="d-flex align-items-center justify-content-center border-0 angleRight w-16 position-absolute {$leftPanelCollapse
                ? 'd-block'
                : 'd-none'}"
              style="left:52px; bottom: 20px; width: 20px; height:20px ; background-color:var(--blackColor); z-index: {$leftPanelCollapse
                ? '2'
                : '0'}"
              on:click={() => {
                handleCollapseCollectionList();
              }}
            >
              <span
                style="transform: rotate(180deg); "
                class="position-relative d-flex align-items-center justify-content-center"
              >
                <DoubleArrowIcon
                  height={"10px"}
                  width={"10px"}
                  color={"var(--text-primary-200)"}
                />
              </span>
            </button>
          </div>
        {/if}
        {#if !$leftPanelCollapse}
          <div
            class="d-flex flex-column sidebar h-100 d-flex flex-column justify-content-between bg-secondary-900"
          >
            <div style="flex:1; overflow:auto;">
              <!--Teams list-->
              <section class="d-flex flex-column" style="max-height:33%;">
                <ListTeamNavigation
                  tabs={teamTabs}
                  onUpdateActiveTab={_viewModel.updateActiveTeamTab}
                  activeTeamTab={$activeTeamTab}
                  openTeam={openTeamData}
                />
              </section>
            </div>

            <!-- github repo section -->
            <section class="px-2">
              <div
                class="p-2 d-flex align-items-center justify-content-between"
                style="z-index: 4;"
              >
                <Tooltip title={"Star Us On GitHub"} placement={"top"}>
                  <div
                    class=" px-2 py-1 border-radius-2 d-flex align-items-center {isGithubStarHover
                      ? 'bg-secondary-600'
                      : ''}"
                    role="button"
                    on:mouseenter={() => {
                      isGithubStarHover = true;
                    }}
                    on:mouseleave={() => {
                      isGithubStarHover = false;
                    }}
                    on:click={async () => {
                      await open(externalSparrowGithub);
                    }}
                  >
                    <GithubIcon
                      height={"18px"}
                      width={"18px"}
                      color={isGithubStarHover
                        ? "var(--bg-secondary-100)"
                        : "var(--bg-secondary-200)"}
                    />
                    <span
                      class="ps-2 text-fs-14 {isGithubStarHover
                        ? 'text-secondary-100'
                        : 'text-secondary-200'}"
                    >
                      {githubRepoData?.stargazers_count || ""}
                    </span>
                  </div>
                </Tooltip>

                <div class="d-flex align-items-center">
                  <!-- <span class="text-fs-14 text-secondary-200 pe-2"
                    >v{version}</span
                  > -->
                  <WithButton
                    icon={DoubleArrowIcon}
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
            <section class="px-3 pb-3">
              <button
                id="isExpandLoginButton"
                class="d-flex align-items-center rounded-1 me-0 mb-0 p-2"
                style="border:none; cursor:pointer; justify-content:center; height:32px; background-color:var(  --bg-primary-300) ; width:100%; "
                on:mouseover={handleMouseOver}
                on:mouseout={handleMouseOut}
                on:click={launchSparrowWebApp}
              >
                <div class="d-flex align-items-center justify-content-center">
                  {#if windowOs}
                    <MacIcon height={"12px"} width={"12px"} color={"white"} />
                  {:else}
                    <WindowsIcon
                      height={"12px"}
                      width={"12px"}
                      color={"white"}
                    />
                  {/if}

                  <p class="ms-2 mb-0 text-fs-12" style="font-weight: 500;">
                    Launch Sparrow App
                  </p>
                </div>
              </button>
            </section>
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
  <DownloadApp />
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

<style>
  .warning-text {
    color: var(--colors-neutral-text-3, #ccc);
    font-size: 14px;
    font-weight: 400;
    line-height: 150%;
  }
  :global(.team-splitter .splitpanes__splitter) {
    width: 6px !important;
    height: auto !important;
    background-color: var(--bg-secondary-500) !important;
    border-left: 5px solid var(--border-secondary-900) !important;
    border-right: 0px solid var(--blackColor) !important;
    border-top: 0 !important;
    border-bottom: 0 !important;
  }
  :global(
      .team-splitter .splitpanes__splitter:active,
      .team-splitter .splitpanes__splitter:hover
    ) {
    background-color: var(--bg-primary-200) !important;
  }

  .sidebar-teams-list::-webkit-scrollbar-thumb {
    background-color: var(--bg-secondary-330);
  }

  .sidebar-teams-list::-webkit-scrollbar-button {
    color: var(--bg-secondary-330);
  }
  .teams-heading {
    margin-left: 5px;
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
