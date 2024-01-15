<script lang="ts">
  import type { WorkspaceMethods } from "$lib/utils/interfaces/workspace.interface";

  import WorkspaceContent from "../../lib/components/workspace/WorkspaceContent.svelte";
  import WorkspaceList from "../../lib/components/workspace/workspace-list/WorkspaceList.svelte";
  import { WorkspaceViewModel } from "./workspace.viewModel";
  import { scaleMotionProps } from "$lib/utils/animations";
  import { Motion } from "svelte-motion";
  import { user } from "$lib/store/auth.store";
  import { onDestroy } from "svelte";
  import type { Observable } from "rxjs";
  import type { TeamDocument } from "$lib/database/app.database";
  import { setCurrentTeam, setOpenedTeam } from "$lib/store/team.store";
  import { setCurrentWorkspace } from "$lib/store/workspace.store";
  export let data: any,
    handleWorkspaceSwitch: any,
    handleWorkspaceTab: any,
    activeSideBarTabMethods: any,
    collectionsMethods: any;
  let allTeams = [];
  const _viewModel = new WorkspaceViewModel();
  const teams: Observable<TeamDocument[]> = _viewModel.teams;
  const activeTeam: Observable<TeamDocument> = _viewModel.activeTeam;
  const workspaceMethods: WorkspaceMethods = {
    handleCreateTab: _viewModel.handleCreateTab,
  };

  const userSubscribe = user.subscribe(async (value) => {
    if (value) await _viewModel.refreshTeams(value._id);
  });

  const tabList = _viewModel.tabs;
  const collectionList = _viewModel.collection;
  let activeTeamRxDoc: TeamDocument;
  const teamSubscribe = teams.subscribe((value: TeamDocument[]) => {
    if (value && value.length > 0) {
      const teamArr = value.map((teamDocument: TeamDocument) => {
        const teamObj = _viewModel.getTeamDocument(teamDocument);
        return teamObj;
      });
      allTeams = teamArr;
      if (!activeTeamRxDoc) {
        _viewModel.activateTeamWorkspace(
          value[0].get("teamId"),
          value[0].get("workspaces")[0].workspaceId,
        );
        setCurrentTeam(value[0].get("teamId"), value[0].get("name"));
        setCurrentWorkspace(
          value[0].get("workspaces")[0].workspaceId,
          value[0].get("workspaces")[0].name,
        );
      }
      setOpenedTeam(value[0].get("teamId"), value[0].get("name"));
    }
  });

  const activeTeamSubscribe = activeTeam.subscribe((value: TeamDocument) => {
    if (value) {
      activeTeamRxDoc = value;
    }
  });

  onDestroy(() => {
    userSubscribe();
    teamSubscribe.unsubscribe();
    activeTeamSubscribe.unsubscribe();
  });
</script>

<Motion {...scaleMotionProps} let:motion>
  <div class="workspace bg-backgroundColor" use:motion>
    <WorkspaceList
      teams={allTeams}
      {data}
      tabList={$tabList}
      collectionList={$collectionList}
      {handleWorkspaceSwitch}
      {handleWorkspaceTab}
      {activeSideBarTabMethods}
      {collectionsMethods}
    />
    <WorkspaceContent
      {handleWorkspaceSwitch}
      {handleWorkspaceTab}
      {data}
      {workspaceMethods}
      {activeSideBarTabMethods}
    />
  </div>
</Motion>

<style>
  .workspace {
    font-size: 12px;
    top: 44px;
    left: 352px;
    width: calc(100% - 352px);
    position: fixed;
    height: calc(100% - 44px);
    overflow: auto;
  }
  .workspace::-webkit-scrollbar {
    width: 2px;
  }
  .workspace::-webkit-scrollbar-thumb {
    background: #888;
  }
</style>
