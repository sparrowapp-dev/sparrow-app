<script lang="ts">
  import type { Observable } from "rxjs";
  import { TeamExplorer, TeamInvite } from "@sparrow/teams/features";
  import { TeamExplorerPageViewModel } from "./TeamExplorerPage.ViewModel";
  import type { TeamDocument, WorkspaceDocument } from "@app/database/database";
  import { user } from "@app/store/auth.store";
  import { Modal } from "@sparrow/library/ui";
  import { LeaveTeam } from "@sparrow/teams/features";
  import { DeleteWorkspace } from "@sparrow/common/features";
  import { onMount } from "svelte";
  import { InviteToWorkspace } from "@sparrow/workspaces/features";

  let isWebEnvironment = false;

  let isDeleteWorkspaceModalOpen = false;
  let selectedWorkspace: WorkspaceDocument;
  const _viewModel = new TeamExplorerPageViewModel();

  let isWorkspaceInviteModalOpen = false;

  const activeTeam: Observable<TeamDocument> = _viewModel.openTeam;
  const workspaces: Observable<WorkspaceDocument[]> = _viewModel.workspaces;
  const activeTeamTab: Observable<string> = _viewModel.activeTeamTab;
  const OnleaveTeam = _viewModel.leaveTeam;
  let userId = "";
  user.subscribe(async (value) => {
    if (value) {
      userId = value._id;
    }
  });

  let currentTeam = {
    name: "",
    users: [],
  };

  activeTeam.subscribe((value) => {
    if (value) {
      currentTeam.name = value.name;
      currentTeam.users = value.users;
    }
  });

  let isTeamInviteModalOpen = false;
  let isLeaveTeamModelOpen = false;
  let isGuestUser;

  const handleDeleteWorkspace = (workspace: WorkspaceDocument) => {
    selectedWorkspace = workspace;
    isDeleteWorkspaceModalOpen = true;
  };
  onMount(async () => {
    isGuestUser = await _viewModel.getGuestUser();
  });

  let workspaceDetails = {
    id: "",
    name: "",
    users: [],
  };

  const handleWorkspaceDetails = ({ workspaceID, workspaceName, users }) => {
    workspaceDetails.id = workspaceID;
    workspaceDetails.name = workspaceName;
    workspaceDetails.users = users;
    isWorkspaceInviteModalOpen = true;
  };
</script>

<TeamExplorer
  bind:isGuestUser
  bind:userId
  bind:isTeamInviteModalOpen
  bind:isLeaveTeamModelOpen
  onAddMember={handleWorkspaceDetails}
  openTeam={$activeTeam}
  workspaces={$workspaces}
  activeTeamTab={$activeTeamTab}
  onDeleteWorkspace={handleDeleteWorkspace}
  onUpdateActiveTab={_viewModel.updateActiveTeamTab}
  onCreateWorkspace={_viewModel.handleCreateWorkspace}
  onSwitchWorkspace={_viewModel.handleSwitchWorkspace}
  onRemoveMembersAtTeam={_viewModel.removeMembersAtTeam}
  onDemoteToMemberAtTeam={_viewModel.demoteToMemberAtTeam}
  onPromoteToAdminAtTeam={_viewModel.promoteToAdminAtTeam}
  onPromoteToOwnerAtTeam={_viewModel.promoteToOwnerAtTeam}
  onRemoveUserFromWorkspace={_viewModel.removeUserFromWorkspace}
  onChangeUserRoleAtWorkspace={_viewModel.changeUserRoleAtWorkspace}
  onUpdateTeam={_viewModel.updateTeam}
  {isWebEnvironment}
/>

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
    currentWorkspaceDetails={workspaceDetails}
    users={currentTeam?.users}
    teamName={currentTeam?.name}
    onInviteUserToWorkspace={_viewModel.inviteUserToWorkspace}
  />
</Modal>
