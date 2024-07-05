<script lang="ts">
  import type { Observable } from "rxjs";
  import { TeamExplorer, TeamInvite } from "@teams/features";
  import { TeamExplorerPageViewModel } from "./TeamExplorerPage.ViewModel";
  import type { TeamDocument, WorkspaceDocument } from "@app/database/database";
  import { user } from "$lib/store";
  import { Modal } from "@library/ui";
    import LeaveTeam from "@teams/features/leave-team/layout/LeaveTeam.svelte";
    import { notifications } from "@library/ui/toast/Toast";
    import TeamActions from "@teams/features/create-team/components/team-actions/TeamActions.svelte";
  import { TeamViewModel } from "../Teams/Teams.ViewModel.old";
    import TeamDescription from "@teams/features/create-team/components/team-description/TeamDescription.svelte";
    import { HeaderDashboardViewModel } from "$lib/components/header/header-dashboard/HeaderDashboard.ViewModel";
    const _viewModelWorkspace = new HeaderDashboardViewModel();

  const _viewModel = new TeamExplorerPageViewModel();
  const _viewModel1 = new TeamViewModel();

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
  let isLeaveTeamModelOpen=false;


  const handleLeaveTeam = async () => {
    if (!$activeTeam?.teamId) return;
    const teamId = $activeTeam?.teamId;
    const response = await _viewModel1.leaveTeam($activeTeam?.teamId);
    if (response.isSuccessful) {
      setTimeout(async () => {
        const activeTeam = await _viewModel1.checkActiveTeam();
        if (activeTeam) {
          const teamIdToActivate = await _viewModel1.activateInitialWorkspace();
          if (teamIdToActivate) {
            await _viewModel1.activateTeam(teamIdToActivate);
          }
        }
        setTimeout(async () => {
          await _viewModel1.refreshTeams(userId);
          await _viewModelWorkspace.refreshWorkspaces(userId);
          notifications.success("You left a team.");
        
        }, 500);
      }, 500);
    } else {
      notifications.error(
        response.message ?? "Failed to leave the team. Please try again.",
      );
  
    }
  };



</script>

<TeamExplorer
  bind:userId
  bind:isTeamInviteModalOpen 
  bind:isLeaveTeamModelOpen
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
<LeaveTeam openTeam={$activeTeam } {handleLeaveTeam}

handleModalState={(flag) => {
  isLeaveTeamModelOpen = flag;
}}/>
</Modal>
