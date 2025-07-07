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
  import { Button, Modal, Tooltip } from "@sparrow/library/ui";
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
  import {
    ChevronDoubleLeftRegular,
    ChevronDoubleRightRegular,
    DoubleArrowIcon,
    GithubIcon,
  } from "@sparrow/library/icons";
  import constants from "../../constants/constants";
  import { TeamTabsEnum } from "@sparrow/teams/constants/TeamTabs.constants";
  import { CreateTeam } from "@sparrow/common/features";
  import { open } from "@tauri-apps/plugin-shell";
  import {
    GithubStarRedirect,
    UpgradePlanBanner,
    UpgradePlanPopUp,
  } from "@sparrow/common/components";

  const _viewModel = new TeamsViewModel();
  const teamList: Observable<TeamDocument[]> = _viewModel.teams;
  const tabList: Observable<TabDocument[]> = _viewModel.tabs;
  const setOpenTeam = _viewModel.setOpenTeam;
  const disableNewInviteTag = _viewModel.disableNewInviteTag;
  const modifyTeam = _viewModel.modifyTeam;

  let isCreateTeamModalOpen: boolean = false;
  let isUpgradePlanModelOpen: boolean = false;
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

  const sparrowAdminUrl = constants.ADMIN_URL;

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

  const formatVersion = (version) => {
    try {
      const parts = version.split(".");
      const major = parts[0];
      const minor = parts[1];
      const patch = parts[2];

      return patch === "0" ? `${major}.${minor}` : `${major}.${minor}.${patch}`;
    } catch (error) {
      return version;
    }
  };
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
            <section>
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
                  <span class="text-ds-font-size-14 text-secondary-200 pe-2"
                    >v{formatVersion(version)}</span
                  >
                  <Button
                    size="extra-small"
                    type="teritiary-regular"
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
          </div>
        {/if}
      </Pane>
      <Pane
        size={$leftPanelCollapse ? 100 : $rightPanelWidth}
        minSize={60}
        class="bg-secondary-800-important"
      >
        <TeamExplorerPage {sparrowAdminUrl} />
      </Pane>
    </Splitpanes>
  </div>
</Motion>

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
    background-color: var(--bg-ds-primary-300) !important;
  }
</style>
