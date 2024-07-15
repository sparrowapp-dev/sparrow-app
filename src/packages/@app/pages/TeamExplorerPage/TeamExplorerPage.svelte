<script lang="ts">
  import type { Observable } from "rxjs";
  import { TeamExplorer, TeamInvite } from "@teams/features";
  import { TeamExplorerPageViewModel } from "./TeamExplorerPage.ViewModel";
  import type { TeamDocument, WorkspaceDocument } from "@app/database/database";
  import { user } from "$lib/store";
  import { Modal } from "@library/ui";
  import { LeaveTeam } from "@teams/features";

  import { DeleteWorkspace } from "@common/features";
  let isDeleteWorkspaceModalOpen = false;
  let selectedWorkspace: WorkspaceDocument;
  const _viewModel = new TeamExplorerPageViewModel();

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
  let isTeamInviteModalOpen = false;
  let isLeaveTeamModelOpen = false;

  // const handleLeaveTeam = async () => {
  //   if (!$activeTeam?.teamId) return;
  //   isLeavingTeam = true;
  //   const teamId = $activeTeam?.teamId;

  //   const response = await leaveTeam(userId, teamId);
  //   if (response.isSuccessful) {
  //     isLeaveTeamModelOpen = false;
  //     isLeavingTeam = false;
  //   }
  // };

  const handleDeleteWorkspace = (workspace: WorkspaceDocument) => {
    selectedWorkspace = workspace;
    isDeleteWorkspaceModalOpen = true;
  };
</script>

<TeamExplorer
  bind:userId
  bind:isTeamInviteModalOpen
  bind:isLeaveTeamModelOpen
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
    teamId={$activeTeam?.teamId}
    workspaces={$workspaces.filter((elem) => {
      return elem?.team?.teamId === $activeTeam?.teamId;
    })}
    handleModalState={(flag) => {
      isTeamInviteModalOpen = flag;
    }}
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
