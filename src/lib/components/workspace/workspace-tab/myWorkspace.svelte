<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { NewTab } from "$lib/utils/interfaces/request.interface";
  import { HeaderDashboardViewModel } from "../../header/header-dashboard/HeaderDashboard.ViewModel";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import { user, userWorkspaceLevelRole } from "$lib/store/auth.store";
  import { isWorkspaceCreatedFirstTime } from "$lib/store/workspace.store";
  import type { Observable } from "rxjs";
  import InviteToWorkspace from "$lib/components/workspace/invite-to-workspace/InviteToWorkspace.svelte";
  import type {
    CollectionDocument,
    TeamDocument,
    WorkspaceDocument,
  } from "$lib/database/app.database";
  import type { CollectionListViewModel } from "$lib/components/collections/collections-list/CollectionList.ViewModel";
  import WorkspaceSetting from "../workspaceSetting.svelte";
  import WorkspaceSidebar from "../workspaceSidebar.svelte";
  import type {
    TeamRepositoryMethods,
    TeamServiceMethods,
    userDetails,
    workspaceInviteMethods,
  } from "$lib/utils/interfaces";
  import { TeamRole, WorkspaceRole } from "$lib/utils/enums";
  import { TeamViewModel } from "@app/pages/Teams/team.viewModel";
  import { hasWorkpaceLevelPermission } from "$lib/utils/helpers";
  import { workspaceLevelPermissions } from "$lib/utils/constants/permissions.constant";
  import ModalWrapperV1 from "$lib/components/Modal/Modal.svelte";
  import { notifications } from "$lib/components/toast-notification/ToastNotification";

  export let collectionsMethods: CollectionsMethods;
  export let activeTab;
  const _viewModel = new HeaderDashboardViewModel();
  const _teamViewModel = new TeamViewModel();
  const currentTeamworkspaces: Observable<WorkspaceDocument[]> =
    _viewModel.workspaces;
  let tabName: string = "";
  let workspaceDescription: string = "";
  let currentTeamWorkspacesArr: WorkspaceDocument[] = [];
  let componentData: NewTab;
  let workspaceName: string;
  let newWorkspaceName: string;
  let noOfCollections = 0;
  let isActiveInvitePopup: boolean = false;
  let currentTeamDetails: { id: string; name: string };
  const activeWorkspace: Observable<WorkspaceDocument> =
    _viewModel.activeWorkspace;
  const tabSubscribe = activeTab.subscribe((event: NewTab) => {
    if (event) {
      tabName = event?.name;
      workspaceDescription = event.description ?? "";
      componentData = event;
    }
  });

  const activeTeam: Observable<TeamDocument> = _viewModel.getActiveteam();
  let currentActiveTeam: TeamDocument;
  let currentWorkspaceDetails = {
    id: "",
    name: "",
  };
  type currentTabType = "ABOUT" | "SETTING";
  let currentTab: currentTabType = "ABOUT";
  let users: userDetails[] = [];
  let hasPermission = false;
  let hasEditPermission = false;
  let loggedInUser: userDetails;
  let loggedUserRole: TeamRole;

  const collections: Observable<CollectionDocument[]> =
    collectionsMethods.collection;

  const handleWorkspaceInput = (event: any) => {
    newWorkspaceName = event.target.value;
    collectionsMethods.updateTab(false, "save", componentData.id);
  };

  const unsubscribeRegisterUser = userWorkspaceLevelRole.subscribe(
    (value: WorkspaceRole) => {
      if (value) {
        hasPermission = hasWorkpaceLevelPermission(
          value,
          workspaceLevelPermissions.SEND_INVITE,
        );
        hasEditPermission = hasWorkpaceLevelPermission(
          value,
          workspaceLevelPermissions.EDIT_WORKSPACE,
        );
      }
    },
  );

  const handleWorkspaceDescription = (event: any) => {
    workspaceDescription = event.target.value;
    collectionsMethods.updateTab(
      workspaceDescription,
      "description",
      componentData.id,
    );
  };

  const onRenameBlur = async () => {
    const response = await _viewModel.modifyWorkspace(
      componentData.id,
      collectionsMethods,
      newWorkspaceName,
      tabName,
    );
    if (!response.isSuccessful && response.message === "Network Error") {
      tabName = currentWorkspaceDetails.name;
      notifications.error(response.message);
    } else {
      tabName = currentWorkspaceDetails.name;
      notifications.error("Failed to rename workspace!");
    }
  };

  const onUpdateBlur = async () => {
    await _viewModel.modifyWorkspaceDescription(
      componentData.id,
      collectionsMethods,
      workspaceDescription,
    );
  };
  const collectionSubscribe = collections.subscribe(
    (collectionArr: CollectionDocument[]) => {
      if (collectionArr) {
        noOfCollections = collectionArr.length;
      }
    },
  );

  const currentTeamWorkspaceSubscribe = currentTeamworkspaces.subscribe(
    (workspacesArr: WorkspaceDocument[]) => {
      if (workspacesArr) {
        currentTeamWorkspacesArr = workspacesArr;
      }
    },
  );

  const teamWorkspaceMethods: Pick<
    TeamServiceMethods,
    | "demoteToMemberAtTeam"
    | "promoteToAdminAtTeam"
    | "removeMembersAtTeam"
    | "refreshWorkspace"
  > &
    Pick<TeamRepositoryMethods, "updateUserRoleInTeam" | "removeUserFromTeam"> =
    {
      demoteToMemberAtTeam: _teamViewModel.demoteToMemberAtTeam,
      promoteToAdminAtTeam: _teamViewModel.promoteToAdminAtTeam,
      updateUserRoleInTeam: _teamViewModel.updateUserRoleInTeam,
      removeUserFromTeam: _teamViewModel.removeUserFromTeam,
      refreshWorkspace: _viewModel.refreshWorkspaces,
      removeMembersAtTeam: _teamViewModel.removeMembersAtTeam,
    };
  const workspaceInvitePermissonMethods: workspaceInviteMethods = {
    deleteWorkspace: _viewModel.deleteWorkspace,
    updateRoleInWorkspace: _viewModel.updateUserRoleInWorkspace,
    updateUsersInWorkspaceInRXDB: _viewModel.updateUserRoleInWorkspaceInRXDB,
    checkIfUserIsPartOfMutipleWorkspaces: _viewModel.isUserInMultipleWorkspaces,
    deleteUserFromWorkspace: _viewModel.deleteUserFromWorkspace,
    deleteUserFromWorkspaceRxDB: _viewModel.removeUserFromWorkspaceRxDB,
    activateWorkspace: _viewModel.activateWorkspace,
    handleWorkspaceDeletion: _viewModel.handleWorkspaceDeletion,
  };

  let name: string = "";
  let email: string = "";
  let firstLetter;
  const unsubscribeUser = user.subscribe((value) => {
    if (value) {
      name = value?.name;
      if (name) {
        firstLetter = name[0];
      }
      email = value?.email;
    }
  });
  const getUserDetails = async () => {
    const response = await _viewModel.getUserDetailsOfWorkspace(
      currentWorkspaceDetails.id,
    );
    if (response?.data && response?.data?.data) {
      users = response.data.data;
      const indexToRemove = users.findIndex(
        (dataObj: any) => dataObj.email === email,
      );
      loggedInUser = users.splice(indexToRemove, 1)[0];
      users.sort((a, b) => a.role.localeCompare(b.role));
      return users;
    }
  };

  const activeWorkspaceSubscribe = activeWorkspace.subscribe(
    (value: WorkspaceDocument) => {
      if (value) {
        (currentWorkspaceDetails = {
          id: value._data._id,
          name: value._data.name,
          users: value._data.users,
        }),
          (currentTeamDetails = {
            name: value._data?.team?.teamName,
            id: value._data?.team.teamId,
          });
        getUserDetails();
      }
    },
  );

  const activeTeamsSubscribe = activeTeam.subscribe(
    async (team: TeamDocument) => {
      if (team) {
        await getUserDetails();
        currentActiveTeam = team;
        team._data.users.forEach((user) => {
          if (user.id === loggedInUser?.id) {
            loggedUserRole = user.role as TeamRole;
          }
        });
        currentTeamWorkspacesArr = currentTeamWorkspacesArr.filter(
          (workspace) => {
            return (
              workspace._data.team.teamId === currentActiveTeam._data.teamId
            );
          },
        );
      }
    },
  );
  // Not required for now may be used in future if things breaks
  // const userUnsubscribe = user.subscribe(async (value) => {
  //   if (value) {
  //     await _viewModel.refreshWorkspaces(value._id);
  //   }
  // });

  const handleWorkspaceTab = (tab: currentTabType) => {
    currentTab = tab;
    getUserDetails();
  };

  let isWorkspaceNameVisibility: boolean;
  const unsubscribeisWorkspaceCreatedFirstTime =
    isWorkspaceCreatedFirstTime.subscribe((value) => {
      isWorkspaceNameVisibility = value;
    });

  onDestroy(() => {
    unsubscribeisWorkspaceCreatedFirstTime();
    unsubscribeUser();
    tabSubscribe();
    activeTeamsSubscribe.unsubscribe();
    // Not required for now may be used in future if things breaks
    // userUnsubscribe();
  });
  let autofocus = isWorkspaceNameVisibility;

  let inputElement;
  onMount(() => {
    if (autofocus) {
      inputElement.select();
    }
  });

  const onRenameInputKeyPress = (event) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(
        "renameInputFieldWorkspace",
      ) as HTMLInputElement;
      inputField.blur();
    }
  };
  const handleInvitePopup = (showPopup: boolean) => {
    isActiveInvitePopup = showPopup;
  };

  const onUpdateWorkspaceDescription = (event) => {
    if (event.shiftKey && event.key === "Enter") {
      const inputField = document.getElementById(
        "workspaceDescription",
      ) as HTMLInputElement;
      inputField.blur();
    }
  };
</script>

<div class="main-container d-flex">
  {#if currentTab === "ABOUT"}
    <div
      class="my-workspace d-flex flex-column"
      style="width:calc(100% - 280px); margin-top: 15px;"
    >
      <div class="d-flex align-items-center justify-content-between gap-2 mb-5">
        <input
          type="text"
          value={tabName}
          id="renameInputFieldWorkspace"
          disabled={!hasEditPermission}
          {autofocus}
          class="bg-backgroundColor form-control border-0 text-left w-100 ps-2 py-0 fs-5 input-outline"
          on:input={(event) => {
            handleWorkspaceInput(event);
          }}
          on:blur={onRenameBlur}
          on:keydown={onRenameInputKeyPress}
          bind:this={inputElement}
        />

        {#if hasPermission}
          <button
            class="btn btn-primary rounded border-0 py-1"
            on:click={() => {
              handleInvitePopup(true);
            }}>Invite</button
          >
        {/if}
      </div>
      <div class="d-flex align-items-start ps-0 h-100">
        <textarea
          value={workspaceDescription}
          id="workspaceDescription"
          {autofocus}
          class="form-control bg-backgroundColor border-0 text-textColor fs-6 h-50 input-outline"
          on:input={(event) => {
            handleWorkspaceDescription(event);
          }}
          disabled={!hasEditPermission}
          on:blur={onUpdateBlur}
          on:keydown={onUpdateWorkspaceDescription}
          bind:this={inputElement}
          placeholder="This is your personal workspace.Start typing. Describe the objectives of the workspace and how it is meant to be used.  Or create a comprehensive API documentation by including links to your collections and requests."
        />
      </div>
    </div>
  {:else if currentTab === "SETTING"}
    <WorkspaceSetting
      {users}
      {hasPermission}
      {loggedUserRole}
      {loggedInUser}
      {handleInvitePopup}
      currentTeamworkspaces={currentTeamWorkspacesArr}
      {currentTeamDetails}
      loggedInUserEmail={email}
      {currentWorkspaceDetails}
      {workspaceInvitePermissonMethods}
      {teamWorkspaceMethods}
      {collectionsMethods}
      {currentActiveTeam}
    ></WorkspaceSetting>
  {/if}
  <WorkspaceSidebar {handleWorkspaceTab} {noOfCollections} {email}
  ></WorkspaceSidebar>

  <ModalWrapperV1
    title={"Invite Team Members"}
    type={"dark"}
    width={"35%"}
    zIndex={1000}
    isOpen={isActiveInvitePopup}
    handleModalState={handleInvitePopup}
  >
    <InviteToWorkspace
      {handleInvitePopup}
      {currentWorkspaceDetails}
      users={currentActiveTeam?.users}
      teamName={currentTeamDetails.name}
      addUsersInWorkspace={_viewModel.addUsersInWorkspace}
      addUsersInWorkspaceInRxDB={_viewModel.addUsersInWorkspaceInRxDB}
    />
  </ModalWrapperV1>
</div>

<style>
  .main-container {
    height: calc(100vh - 80px);
    background-color: var(--background-color);
  }
  .my-workspace {
    padding: 20px;
  }

  .btn-primary {
    z-index: 5;
    background-color: var(--primary-btn-color) !important;
  }

  .profile-circle {
    border-radius: 50%;
  }

  .info-setting-hover:hover {
    background-color: var(--border-color);
  }

  textarea::placeholder {
    font-size: 12px;
    color: var(--text-color);
  }

  .input-outline {
    border-radius: 0%;
  }

  .input-outline:focus {
    outline: 2px solid var(--sparrow-blue);
  }

  .workspace-info {
    position: fixed;
    bottom: 0;
    padding: 15px;
    display: flex;
    width: 100%;
    font-size: 12px;
  }
</style>
