<script lang="ts">
  import type { Observable } from "rxjs";
  import {
    TeamExplorer,
    TeamInvite,
    WorkspaceMembers,
  } from "@sparrow/teams/features";
  import { TeamExplorerPageViewModel } from "./TeamExplorerPage.ViewModel";
  import type { TeamDocument, WorkspaceDocument } from "@app/database/database";
  import { user } from "@app/store/auth.store";
  import { Modal } from "@sparrow/library/ui";
  import { LeaveTeam } from "@sparrow/teams/features";
  import { DeleteWorkspace } from "@sparrow/common/features";
  import { onDestroy, onMount } from "svelte";
  import { InviteToWorkspace } from "@sparrow/workspaces/features";
  import { BackIcon } from "@sparrow/library/icons";
  import { navigate } from "svelte-navigator";

  export let activeTeamTab;
  export let onUpdateActiveTab;

  let isDeleteWorkspaceModalOpen = false;
  let selectedWorkspace: WorkspaceDocument;
  const _viewModel = new TeamExplorerPageViewModel();

  let isWorkspaceInviteModalOpen = false;
  let isWebEnvironment = true;

  const activeTeam: Observable<TeamDocument> = _viewModel.openTeam;
  const workspaces: Observable<WorkspaceDocument[]> = _viewModel.workspaces;
  const activeWorkspace: Observable<WorkspaceDocument> =
    _viewModel.activeWorkspace;
  const OnleaveTeam = _viewModel.leaveTeam;
  let userId = "";
  let userRole = "";
  user.subscribe(async (value) => {
    if (value) {
      userId = value._id;
    }
  });

  let currentTeam = {
    name: "",
    users: [],
  };
  let currentWorkspace = {
    id: "",
    name: "",
    users: [],
    description: "",
    team: {},
  };

  /**
   * Find the role of user in active workspace
   */
  const findUserRole = async () => {
    currentWorkspace?.users?.forEach((value) => {
      if (value.id === userId) {
        userRole = value.role;
      }
    });
  };

  const activeWorkspaceSubscribe = activeWorkspace.subscribe(
    async (value: WorkspaceDocument) => {
      if (value?._data) {
        currentWorkspace = {
          id: value._data._id || "",
          name: value._data.name || "",
          users: value._data.users || [],
          description: value._data.description || "",
          team: value._data.team || {},
        };
        findUserRole();
      }
    },
  );

  activeTeam.subscribe((value) => {
    if (value) {
      currentTeam.name = value.name;
      currentTeam.users = value.users;
      isWorkspaceOpen = false;
    }
  });

  let isTeamInviteModalOpen = false;
  let isLeaveTeamModelOpen = false;
  let isGuestUser;
  let isWorkspaceOpen = false;

  const handleDeleteWorkspace = (workspace: WorkspaceDocument) => {
    selectedWorkspace = workspace;
    isDeleteWorkspaceModalOpen = true;
  };

  onMount(async () => {
    _viewModel.refreshTeams(userId);
    _viewModel.refreshWorkspaces(userId);
    isGuestUser = await _viewModel.getGuestUser();
  });

  let workspaceDetails = {
    id: "",
    name: "",
    users: [],
  };

  $: {
    if (activeTeamTab) {
      isWorkspaceOpen = false;
    }
  }

  const handleWorkspaceDetails = ({ workspaceID, workspaceName, users }) => {
    workspaceDetails.id = workspaceID;
    workspaceDetails.name = workspaceName;
    workspaceDetails.users = users;
    isWorkspaceInviteModalOpen = true;
  };

  export let isPopupOpen = false;

  function openInDesktop(workspaceID: string) {
    let appDetected = false;

    // Handle when window loses focus (app opens)
    const handleBlur = () => {
      appDetected = true;
      window.removeEventListener("blur", handleBlur);
      clearTimeout(detectAppTimeout);
    };

    window.addEventListener("blur", handleBlur);

    // Try to open the app
    _viewModel.setupRedirect(workspaceID);

    // Check if app opened after a short delay
    const detectAppTimeout = setTimeout(() => {
      window.removeEventListener("blur", handleBlur);

      // Only show popup if app wasn't detected
      if (!appDetected) {
        isPopupOpen = true;
      }
    }, 500);
  }

  onDestroy(() => {
    activeWorkspaceSubscribe.unsubscribe();
  });
</script>

{#if isWorkspaceOpen}
  <div class="d-flex h-100" style="width: 100%;">
    <div
      class="h-100 d-flex flex-column"
      style="border-right:2px solid #000000; width: 100%;  padding:24px;"
    >
      <div style="align-items:center; margin-left:10px" class="d-flex ellipsis">
        <div
          style="cursor: pointer; align-items:center;"
          on:click={() => (isWorkspaceOpen = false)}
        >
          <BackIcon
            height={"12px"}
            width={"7px"}
            color={"var(--icon-secondary-200)"}
          />
          <span
            color="var(--text-secondary-200)"
            style="font-size: 12px; margin-left:11px;">{$activeTeam?.name}</span
          >
        </div>
        <div>
          <span
            style="font-size: 12px; margin-left:10px; color=var(--text-secondary-200)"
            >/</span
          >
          <span
            style="font-size: 12px; margin-left:6px; color:var(--text-secondary-100); font-weight:400"
            >{currentWorkspace.name}</span
          >
        </div>
      </div>
      <WorkspaceMembers
        bind:isWorkspaceInviteModalOpen
        users={currentWorkspace.users}
        workspaceName={currentWorkspace.name}
        {userRole}
        onDeleteWorkspace={handleDeleteWorkspace}
        onChangeUserRoleAtWorkspace={_viewModel.changeUserRoleAtWorkspace}
        onRemoveUserFromWorkspace={_viewModel.removeUserFromWorkspace}
        activeWorkspace={$activeWorkspace}
        {user}
      />
    </div>
  </div>
{:else}
  <TeamExplorer
    bind:isGuestUser
    bind:userId
    bind:isTeamInviteModalOpen
    bind:isLeaveTeamModelOpen
    onAddMember={handleWorkspaceDetails}
    openTeam={$activeTeam}
    workspaces={$workspaces}
    {activeTeamTab}
    onDeleteWorkspace={handleDeleteWorkspace}
    {onUpdateActiveTab}
    onCreateWorkspace={_viewModel.handleCreateWorkspace}
    onSwitchWorkspace={async (item) => {
      await _viewModel.handleSwitchWorkspace(item);
      isWorkspaceOpen = true;
    }}
    onRemoveMembersAtTeam={_viewModel.removeMembersAtTeam}
    onDemoteToMemberAtTeam={_viewModel.demoteToMemberAtTeam}
    onPromoteToAdminAtTeam={_viewModel.promoteToAdminAtTeam}
    onPromoteToOwnerAtTeam={_viewModel.promoteToOwnerAtTeam}
    onRemoveUserFromWorkspace={_viewModel.removeUserFromWorkspace}
    onChangeUserRoleAtWorkspace={_viewModel.changeUserRoleAtWorkspace}
    onUpdateTeam={_viewModel.updateTeam}
    {openInDesktop}
    {isWebEnvironment}
    isWebApp={true}
  />
{/if}

<Modal
  title={"Invite Team Members"}
  type={"dark"}
  width={"35%"}
  zIndex={1000}
  isOpen={isTeamInviteModalOpen}
  handleModalState={(flag) => {
    isTeamInviteModalOpen = flag;
  }}
>
  <TeamInvite
    {userId}
    teamLogo={$activeTeam?.logo}
    onInviteClick={_viewModel.handleTeamInvite}
    teamName={$activeTeam?.name}
    users={$activeTeam?.users}
    teamId={$activeTeam?.teamId}
    workspaces={$workspaces.filter((elem) => {
      return elem?.team?.teamId === $activeTeam?.teamId;
    })}
    handleModalState={(flag) => {
      isTeamInviteModalOpen = flag;
    }}
    onValidateEmail={_viewModel.validateUserEmail}
  />
</Modal>

<Modal
  title={"Delete Workspace?"}
  type={"dark"}
  width={"35%"}
  zIndex={1000}
  isOpen={isDeleteWorkspaceModalOpen}
  handleModalState={(flag) => {
    isDeleteWorkspaceModalOpen = flag;
  }}
>
  <DeleteWorkspace
    bind:isDeleteWorkspaceModalOpen
    workspace={selectedWorkspace}
    openTeam={$activeTeam}
    onDeleteWorkspace={async () => {
      const response =
        await _viewModel.handleDeleteWorkspace(selectedWorkspace);
      if (response?.isSuccessful) {
        isDeleteWorkspaceModalOpen = false;
        isWorkspaceOpen = false;
      }
    }}
  />
</Modal>

<Modal
  title={"Leave Team?"}
  type={"dark"}
  width={"35%"}
  zIndex={1000}
  isOpen={isLeaveTeamModelOpen}
  handleModalState={(flag) => {
    isLeaveTeamModelOpen = flag;
  }}
>
  <LeaveTeam
    {userId}
    {OnleaveTeam}
    bind:isLeaveTeamModelOpen
    openTeam={$activeTeam}
    handleModalState={(flag) => {
      isLeaveTeamModelOpen = flag;
    }}
  />
</Modal>

<Modal
  title={"Invite to Workspace"}
  type={"dark"}
  width={"35%"}
  zIndex={1000}
  isOpen={isWorkspaceInviteModalOpen}
  handleModalState={(flag = false) => {
    isWorkspaceInviteModalOpen = flag;
  }}
>
  <InviteToWorkspace
    handleInvitePopup={(flag = false) => {
      isWorkspaceInviteModalOpen = flag;
    }}
    currentWorkspaceDetails={currentWorkspace}
    users={currentTeam?.users}
    teamName={currentTeam?.name}
    onInviteUserToWorkspace={_viewModel.inviteUserToWorkspace}
  />
</Modal>
