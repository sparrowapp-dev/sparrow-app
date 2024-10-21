<script lang="ts">
  import type { Observable } from "rxjs";
  import type { TabDocument, TeamDocument } from "@app/database/database";

  import {
    leftPanelWidth,
    rightPanelWidth,
    leftPanelCollapse,
  } from "@sparrow/teams/stores";

  import { Pane, Splitpanes } from "svelte-splitpanes";
  import TeamExplorerPage from "./sub-pages/TeamExplorerPage/TeamExplorerPage.svelte";
  import { TeamsViewModel } from "./Teams.ViewModel";
  import { Modal, Tooltip } from "@sparrow/library/ui";
  import {
    RecentApis,
    RecentWorkspace,
    TeamList,
  } from "@sparrow/teams/features";
  import { pagesMotion } from "../../constants";
  import { version } from "../../../src-tauri/tauri.conf.json";

  import { onMount } from "svelte";
  import { Motion } from "svelte-motion";
  import { user } from "../../store/auth.store";
  import { WithButton } from "@sparrow/workspaces/hoc";
  import { DoubleArrowIcon, GithubIcon } from "@sparrow/library/icons";
  import constants from "../../constants/constants";
  import { TeamTabsEnum } from "@sparrow/teams/constants/TeamTabs.constants";
  import { CreateTeam } from "@sparrow/common/features";

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

  let githubRepoData: GithubRepoDocType;
  let isGuestUser = false;
  let userId = "";
  user.subscribe(async (value) => {
    if (value) {
      userId = value._id;
    }
  });

  const externalSparrowGithub = constants.SPARROW_GITHUB;

  onMount(async () => {
    _viewModel.refreshTeams(userId);
    _viewModel.refreshWorkspaces(userId);

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

  let isGithubStarHover = false;

  let activeIndex = "";

  $: {
    if ($openTeam) {
      activeIndex = $openTeam.teamId;
    }
  }
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
              <TeamList
                bind:isCreateTeamModalOpen
                {isGuestUser}
                {setOpenTeam}
                teamList={$teamList}
                {disableNewInviteTag}
                {modifyTeam}
                bind:activeIndex
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
            <section>
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
                  <span class="text-fs-14 text-secondary-200 pe-2"
                    >v{version}</span
                  >
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
          </div>
        {/if}
      </Pane>
      <Pane
        size={$leftPanelCollapse ? 100 : $rightPanelWidth}
        minSize={60}
        class="bg-secondary-800-important"
      >
        <TeamExplorerPage />
      </Pane>
    </Splitpanes>
  </div>
</Motion>

<Modal
  title={"New Team"}
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
</style>
