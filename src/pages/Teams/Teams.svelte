<script lang="ts">
  import type { WorkspaceMethods } from "$lib/utils/interfaces/workspace.interface";

  import WorkspaceContent from "../../lib/components/workspace/WorkspaceContent.svelte";
  import WorkspaceList from "../../lib/components/workspace/workspace-list/WorkspaceList.svelte";
  import { TeamViewModel } from "./team.viewModel";
  import { scaleMotionProps } from "$lib/utils/animations";
  import { Motion } from "svelte-motion";
  import { user } from "$lib/store/auth.store";
  import { onDestroy } from "svelte";
  import type { Observable } from "rxjs";
  import type { TeamDocument } from "$lib/database/app.database";
  import { openedTeam, setOpenedTeam } from "$lib/store/team.store";
  import type { CurrentTeam } from "$lib/utils/interfaces";
  export let data: any,
    handleWorkspaceSwitch: any,
    handleWorkspaceTab: any,
    activeSideBarTabMethods: any,
    collectionsMethods: any,
    currentTeam: CurrentTeam;
  let allTeams: any[] = [],
    userId: string | undefined = undefined,
    currOpenedTeam: CurrentTeam;
  const _viewModel = new TeamViewModel();
  const teams: Observable<TeamDocument[]> = _viewModel.teams;
  const activeTeam: Observable<TeamDocument> = _viewModel.activeTeam;
  const workspaceMethods: WorkspaceMethods = {
    handleCreateTab: _viewModel.handleCreateTab,
  };

  const userSubscribe = user.subscribe(async (value) => {
    if (value) {
      userId = value._id;
    }
  });

  const openedTeamSubscribe = openedTeam.subscribe((value) => {
    if (value) currOpenedTeam = value;
  });
  const tabList = _viewModel.tabs;
  const collectionList = _viewModel.collection;
  let activeTeamRxDoc: TeamDocument;

  const activeTeamSubscribe = activeTeam.subscribe((value: TeamDocument) => {
    if (value) {
      activeTeamRxDoc = value;
      setOpenedTeam(
        currOpenedTeam.id ? currOpenedTeam.id : value.get("teamId"),
        currOpenedTeam.name ? currOpenedTeam.name : value.get("name"),
        currOpenedTeam.base64String
          ? currOpenedTeam.base64String
          : value.get("logo"),
      );
    }
  });
  const teamSubscribe = teams.subscribe((value: TeamDocument[]) => {
    if (value && value.length > 0) {
      const teamArr = value.map((teamDocument: TeamDocument) => {
        const teamObj = _viewModel.getTeamDocument(teamDocument);
        return teamObj;
      });
      allTeams = teamArr;
    }
  });

  onDestroy(() => {
    userSubscribe();
    openedTeamSubscribe();
    teamSubscribe.unsubscribe();
    activeTeamSubscribe.unsubscribe();
  });
</script>

<Motion {...scaleMotionProps} let:motion>
  <div class="workspace bg-backgroundColor" use:motion>
    <WorkspaceList
      teams={allTeams}
      {userId}
      {data}
      tabList={$tabList}
      collectionList={$collectionList}
      {handleWorkspaceSwitch}
      {handleWorkspaceTab}
      {activeSideBarTabMethods}
      {collectionsMethods}
    />
    <WorkspaceContent
      {currentTeam}
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
    left: calc(21vw + 70px);
    width: calc(79vw - 72px);
    position: fixed;
    height: calc(100% - 44px);
    overflow: auto;
  }

  @media only screen and (max-width: 900px) {
    .workspace {
      left: calc(31vw + 72px);
      width: calc(69vw - 72px);
    }
  }
  .workspace::-webkit-scrollbar {
    width: 2px;
  }
  .workspace::-webkit-scrollbar-thumb {
    background: #888;
  }
</style>
