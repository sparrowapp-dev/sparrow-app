<script lang="ts">
  import type { Observable } from "rxjs";
  import type { TabDocument, TeamDocument } from "@app/database/database";

  import {
    isWorkspaceCreatedFirstTime,
    isWorkspaceLoaded,
  } from "@deprecate/store/workspace.store";

  import {
    leftPanelWidth,
    rightPanelWidth,
    leftPanelCollapse,
  } from "@sparrow/teams/common/stores";

  import { Pane, Splitpanes } from "svelte-splitpanes";
  import TeamExplorerPage from "../TeamExplorerPage/TeamExplorerPage.svelte";
  import { TeamSidePanel } from "@sparrow/teams/features";
  import { TeamsViewModel } from "./Teams.ViewModel";
  import { Modal } from "@sparrow/library/ui";
  import { CreateTeam } from "@sparrow/teams/features";
  import { pagesMotion } from "../../constants";
  import { version } from "../../../src-tauri/tauri.conf.json";

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
  import { onMount } from "svelte";
  import { Motion } from "svelte-motion";

  let githubRepoData: GithubRepoDocType;
  let isGuestUser = false;

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
        <TeamSidePanel
          bind:isGuestUser
          bind:isCreateTeamModalOpen
          teamList={$teamList}
          tabList={$tabList}
          data={workspaces}
          githubRepo={githubRepoData}
          leftPanelController={{
            leftPanelCollapse: $leftPanelCollapse,
            handleCollapseCollectionList,
          }}
          collectionList={$collectionList}
          openTeam={$openTeam}
          {onApiClick}
          {OnWorkspaceSwitch}
          {setOpenTeam}
          {disableNewInviteTag}
          {modifyTeam}
          appVersion={version}
        />
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
</style>
