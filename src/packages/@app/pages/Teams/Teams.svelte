<script lang="ts">
  import type { Observable } from "rxjs";
  import type { TabDocument, TeamDocument } from "@app/database/database";

  import {
    workspaceLeftPanelWidth,
    workspaceRightPanelWidth,
  } from "$lib/store";
  import { Pane, Splitpanes } from "svelte-splitpanes";
  import TeamExplorerPage from "../TeamExplorerPage/TeamExplorerPage.svelte";
  import TeamSidePanel from "@teams/features/team-sidepanel/layout/TeamSidePanel.svelte";
  import { TeamsViewModel } from "./Teams.ViewModel";

  const _viewModel = new TeamsViewModel();
  const teamList: Observable<TeamDocument[]> = _viewModel.teams;
  const tabList: Observable<TabDocument[]> = _viewModel.tabs;
</script>

<Splitpanes
  class="team-splitter h-100"
  style="width: calc(100vw - 54px)"
  on:resize={(e) => {
    workspaceLeftPanelWidth.set(e.detail[0].size);
    workspaceRightPanelWidth.set(e.detail[1].size);
  }}
>
  <Pane class="sidebar-left-panel" minSize={20} size={$workspaceLeftPanelWidth}>
    <TeamSidePanel teamList={$teamList} tabList={$tabList} />
  </Pane>
  <Pane
    class="sidebar-right-panel"
    minSize={60}
    size={$workspaceRightPanelWidth}
  >
    <TeamExplorerPage />
  </Pane>
</Splitpanes>

<style>
  .warning-text {
    color: var(--colors-neutral-text-3, #ccc);
    font-size: 14px;
    font-weight: 400;
    line-height: 150%;
  }
  :global(.splitter-sidebar.splitpanes) {
    width: calc(100vw - 72px);
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
