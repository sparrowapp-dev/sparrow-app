<script lang="ts">
  import type {
    TeamRepositoryMethods,
    TeamServiceMethods,
    WorkspaceMethods,
  } from "$lib/utils/interfaces/workspace.interface";

  import WorkspaceContent from "../../lib/components/workspace/WorkspaceContent.svelte";
  import WorkspaceList from "../../lib/components/workspace/workspace-list/WorkspaceList.svelte";
  import { TeamViewModel } from "./team.viewModel";
  import { scaleMotionProps } from "$lib/utils/animations";
  import { Motion } from "svelte-motion";
  import { user } from "$lib/store/auth.store";
  import { onDestroy } from "svelte";
  import type { Observable } from "rxjs";
  import type {
    TeamDocument,
    WorkspaceDocument,
  } from "$lib/database/app.database";
  import { openedTeam, setOpenedTeam } from "$lib/store/team.store";
  import type { CurrentTeam } from "$lib/utils/interfaces";
  import { isWorkspaceCreatedFirstTime, isWorkspaceLoaded } from "$lib/store";
  import { generateSampleWorkspace } from "$lib/utils/sample/workspace.sample";
  import { UntrackedItems } from "$lib/utils/enums/item-type.enum";
  import type { Path } from "$lib/utils/interfaces/request.interface";
  import { moveNavigation } from "$lib/utils/helpers";
  import { navigate } from "svelte-navigator";
  import { notification } from "@tauri-apps/api";
  import { notifications } from "$lib/utils/notifications";
  import { HeaderDashboardViewModel } from "$lib/components/header/header-dashboard/HeaderDashboard.ViewModel";
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
  const _viewModelWorkspace = new HeaderDashboardViewModel();
  const teams: Observable<TeamDocument[]> = _viewModel.teams;
  const activeTeam: Observable<TeamDocument> = _viewModel.activeTeam;
  const workspaces: Observable<WorkspaceDocument[]> = _viewModel.workspaces;

  const workspaceMethods: WorkspaceMethods = {
    handleCreateTab: _viewModel.handleCreateTab,
  };
  const teamRepositoryMethods: TeamRepositoryMethods = {
    modifyTeam: _viewModel.modifyTeam,
  };
  const teamServiceMethods: TeamServiceMethods = {
    inviteMembersAtTeam: _viewModel.inviteMembersAtTeam,
    removeMembersAtTeam: _viewModel.removeMembersAtTeam,
    promoteToAdminAtTeam: _viewModel.promoteToAdminAtTeam,
    demoteToMemberAtTeam: _viewModel.demoteToMemberAtTeam,
  };

  // const userSubscribe = user.subscribe(async (value) => {
  // if (value) await _viewModel.refreshTeams(value._id);
  // });

  const userSubscribe = user.subscribe(async (value) => {
    if (value) {
      userId = value._id;
      // await _viewModel.refreshTeams(value._id);
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
  const handleCreateWorkspace = async () => {
    isWorkspaceCreatedFirstTime.set(true);
    isWorkspaceLoaded.set(false);
    const workspaceObj = generateSampleWorkspace(
      UntrackedItems.UNTRACKED,
      new Date().toString(),
    );

    const workspaceData = {
      name: workspaceObj.name,
      id: currOpenedTeam.id,
    };
    _viewModel.addWorkspace(workspaceObj);

    const response = await _viewModel.createWorkspace(workspaceData);

    if (response.isSuccessful) {
      _viewModel.addWorkspace(response.data.data);

      let totalCollection: number = 0;
      let totalRequest: number = 0;

      $data.map((item) => {
        if (item) {
          if (item._data._id === response.data.data._id) {
            // totalCollection = item?._data?.collections?.length;
            totalCollection = 0;
          } else {
            totalRequest = 0;
          }
        }
      });

      let path: Path = {
        workspaceId: response.data.data._id,
        collectionId: "",
      };

      workspaceObj._id = response.data.data._id;
      workspaceObj.name = response.data.data.name;
      workspaceObj.description = response.data.data?.description;
      workspaceObj.team = response.data.data?.team;
      workspaceObj.owner = response.data.data?.owner;
      workspaceObj.users = response.data.data?.users;
      workspaceObj.createdAt = response.data.data?.createdAt;
      workspaceObj.createdBy = response.data.data?.createdBy;
      workspaceObj.isActiveWorkspace = false;
      workspaceObj.environments = response.data.data?.environemnts;
      workspaceObj.path = path;
      workspaceObj.property.workspace.requestCount = totalRequest;
      workspaceObj.property.workspace.collectionCount = 0;
      workspaceObj.save = true;
      _viewModel.addWorkspace(workspaceObj);
      if (userId) _viewModelWorkspace.refreshWorkspaces(userId);
      collectionsMethods.handleCreateTab(workspaceObj);
      moveNavigation("right");
      navigate("/collections");
      isWorkspaceCreatedFirstTime.set(true);
      notifications.success("New Workspace Created");
      isWorkspaceLoaded.set(true);
    }
  };

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
      {handleCreateWorkspace}
      {userId}
      {handleWorkspaceSwitch}
      {handleWorkspaceTab}
      {data}
      {workspaceMethods}
      {activeSideBarTabMethods}
      activeTeam={$activeTeam}
      {teamServiceMethods}
      {teamRepositoryMethods}
      workspaces={$workspaces}
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
