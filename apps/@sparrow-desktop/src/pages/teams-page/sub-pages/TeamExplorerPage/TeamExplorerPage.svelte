<script lang="ts">
  import type { Observable } from "rxjs";
  import { TeamExplorer, TeamInvite } from "@sparrow/teams/features";
  import { TeamExplorerPageViewModel } from "./TeamExplorerPage.ViewModel";
  import type { TeamDocument, WorkspaceDocument } from "@app/database/database";
  import { user } from "@app/store/auth.store";
  import { Modal, notifications } from "@sparrow/library/ui";
  import { LeaveTeam } from "@sparrow/teams/features";
  import { DeleteWorkspace } from "@sparrow/common/features";
  import { onDestroy, onMount } from "svelte";
  import { InviteToWorkspace } from "@sparrow/workspaces/features";
  import { copyToClipBoard } from "@sparrow/common/utils";
  import constants from "@app/constants/constants";
  import type { InviteBody } from "@sparrow/common/dto/team-dto";
  import { ResponseMessage } from "@sparrow/common/enums";
  import type { addUsersInWorkspacePayload } from "@sparrow/common/dto";

  export let sparrowAdminUrl: string;

  let isWebEnvironment = false;

  let isDeleteWorkspaceModalOpen = false;
  let selectedWorkspace: WorkspaceDocument;
  const _viewModel = new TeamExplorerPageViewModel();

  let isWorkspaceInviteModalOpen = false;

  const activeTeam: Observable<TeamDocument> = _viewModel.openTeam;
  const workspaces: Observable<WorkspaceDocument[]> = _viewModel.workspaces;
  const activeTeamTab: Observable<string> = _viewModel.activeTeamTab;
  let upgradePlanModalInvite = false;
  let upgradePlanModal = false;
  let usersInvitePlanCount: number = 5;

  const OnleaveTeam = _viewModel.leaveTeam;
  let userId = "";
  const userSubscriber = user.subscribe(async (value) => {
    if (value) {
      userId = value._id;
    }
  });

  let currentTeam = {
    name: "",
    users: [],
    plan: {},
  };

  const activeTeamSubscriber = activeTeam.subscribe((value) => {
    if (value) {
      currentTeam.name = value.name;
      currentTeam.users = value.users;
      currentTeam.plan = value.plan;
      usersInvitePlanCount = value?._data?.users?.length || 5;
    }
  });

  let isTeamInviteModalOpen = false;
  let isLeaveTeamModelOpen = false;
  let invitedCount = 0;
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
  const handleCopyPublicWorkspaceLink = async (workspaceId: string) => {
    await copyToClipBoard(
      `${constants.SPARROW_WEB_APP_URL}/app/collections?workspaceId=${workspaceId}`,
    );
    notifications.success("Link copied to clipboard.");
  };

  const handleSendInvite = async (
    teamId: string,
    teamName: string,
    inviteBody: InviteBody,
    userId: string,
  ) => {
    invitedCount = inviteBody?.users.length;
    const response = await _viewModel.handleTeamInvite(
      teamId,
      teamName,
      inviteBody,
      userId,
    );
    if (response?.message === "Plan limit reached") {
      upgradePlanModalInvite = true;
    }
    return response;
  };

  const handleUserLimits = async () => {
    const data = await _viewModel.userPlanLimits($activeTeam?.teamId);
    usersInvitePlanCount = data?.usersPerHub.value || 5;
    return data;
  };

  const handleRequestPlan = async () => {
    await _viewModel.requestToUpgradePlan($activeTeam?.teamId);
  };

  const handleRedirectAdminPanel = async () => {
    await _viewModel.handleRedirectToAdminPanel($activeTeam?.teamId);
  };

  const handleCreateWorkspace = async (teamId: string) => {
    const response = await _viewModel.handleCreateWorkspace(teamId);
    if (response?.data?.message === ResponseMessage.PLAN_LIMIT_MESSAGE) {
      upgradePlanModal = true;
    }
  };

  const handleAddWorkspace = async (
    workspaceId: string,
    workspaceName: string,
    data: addUsersInWorkspacePayload,
    invitedUserCount: number,
  ) => {
    invitedCount = invitedUserCount;
    const response = await _viewModel.inviteUserToWorkspace(
      workspaceId,
      workspaceName,
      data,
      invitedUserCount,
    );
    if (response?.data.message === ResponseMessage.PLAN_LIMIT_MESSAGE) {
      isWorkspaceInviteModalOpen = false;
      upgradePlanModalInvite = true;
    }
    return response;
  };

  onDestroy(() => {
    userSubscriber();
    activeTeamSubscriber.unsubscribe();
  });
</script>

<TeamExplorer
  bind:isGuestUser
  bind:userId
  bind:isTeamInviteModalOpen
  bind:isLeaveTeamModelOpen
  bind:upgradePlanModalInvite
  bind:upgradePlanModal
  bind:invitedCount
  onAddMember={handleWorkspaceDetails}
  openTeam={$activeTeam}
  workspaces={$workspaces}
  activeTeamTab={$activeTeamTab}
  onDeleteWorkspace={handleDeleteWorkspace}
  onUpdateActiveTab={_viewModel.updateActiveTeamTab}
  onCreateWorkspace={handleCreateWorkspace}
  onSwitchWorkspace={_viewModel.handleSwitchWorkspace}
  onRemoveMembersAtTeam={_viewModel.removeMembersAtTeam}
  onDemoteToMemberAtTeam={_viewModel.demoteToMemberAtTeam}
  onPromoteToAdminAtTeam={_viewModel.promoteToAdminAtTeam}
  onPromoteToOwnerAtTeam={_viewModel.promoteToOwnerAtTeam}
  onRemoveUserFromWorkspace={_viewModel.removeUserFromWorkspace}
  onChangeUserRoleAtWorkspace={_viewModel.changeUserRoleAtWorkspace}
  onUpdateTeam={_viewModel.updateTeam}
  onWithDrawInvite={_viewModel.withdrawInvite}
  onResendInvite={_viewModel.resendInvite}
  onAcceptInvite={_viewModel.acceptInvite}
  onIgnoreInvite={_viewModel.ignoreInvite}
  {isWebEnvironment}
  onCopyLink={handleCopyPublicWorkspaceLink}
  {sparrowAdminUrl}
  planLimits={handleUserLimits}
  contactOwner={handleRequestPlan}
  {handleRedirectAdminPanel}
  handleContactSales={_viewModel.handleContactSales}
/>

<Modal
  title={"Add People to Hub"}
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
    onInviteClick={handleSendInvite}
    teamName={$activeTeam?.name}
    users={$activeTeam?.users}
    teamId={$activeTeam?.teamId}
    plan={$activeTeam?.plan}
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
  title={"Leave Hub?"}
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
    plan={currentTeam?.plan}
    onInviteUserToWorkspace={handleAddWorkspace}
  />
</Modal>
