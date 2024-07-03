<script lang="ts">
  import type { Observable } from "rxjs";
  import { TeamExplorer, TeamInvite } from "@teams/features";
  import { TeamExplorerPageViewModel } from "./TeamExplorerPage.ViewModel";
  import type { TeamDocument, WorkspaceDocument } from "@app/database/database";
  import { user } from "$lib/store";
  import { Modal } from "@library/ui";
  const _viewModel = new TeamExplorerPageViewModel();
  const activeTeam: Observable<TeamDocument> = _viewModel.openTeam;
  const workspaces: Observable<WorkspaceDocument[]> = _viewModel.workspaces;
  const activeTeamTab: Observable<string> = _viewModel.activeTeamTab;
  let userId = "";
  user.subscribe(async (value) => {
    if (value) {
      userId = value._id;
    }
  });
  let isTeamInviteModalOpen = false;
</script>

<TeamExplorer
  bind:userId
  bind:isTeamInviteModalOpen
  openTeam={$activeTeam}
  workspaces={$workspaces}
  activeTeamTab={$activeTeamTab}
  onUpdateActiveTab={_viewModel.updateActiveTeamTab}
  onCreateWorkspace={_viewModel.handleCreateWorkspace}
  onSwitchWorkspace={_viewModel.handleSwitchWorkspace}
  onRemoveMembersAtTeam={_viewModel.removeMembersAtTeam}
  onDemoteToMemberAtTeam={_viewModel.demoteToMemberAtTeam}
  onPromoteToAdminAtTeam={_viewModel.promoteToAdminAtTeam}
  onPromoteToOwnerAtTeam={_viewModel.promoteToOwnerAtTeam}
  onRemoveUserFromWorkspace={_viewModel.removeUserFromWorkspace}
  onChangeUserRoleAtWorkspace={_viewModel.changeUserRoleAtWorkspace}
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
