<script lang="ts">
  import { InviteToWorkspace, WorkspaceExplorer } from "@workspaces/features";
  import WorkspaceExplorerViewModel from "./WorkspaceExplorerPage.ViewModel";
  import { Modal } from "@library/ui";
  import type { Observable } from "rxjs";
  import { onDestroy } from "svelte";
  import { DeleteWorkspace } from "@common/features";
  import type { TeamDocument, WorkspaceDocument } from "@app/database/database";

  export let modifiedUser;
  export let collectionList;
  export let tab;

  const _viewModel = new WorkspaceExplorerViewModel();
  const activeWorkspace: Observable<WorkspaceDocument> =
    _viewModel.activeWorkspace;

  let isWorkspaceInviteModalOpen = false;
  let isDeleteWorkspaceModalOpen = false;
  let selectedWorkspace: WorkspaceDocument;
  let selectedTeam: TeamDocument;
  let workspaceID = tab._data.path.workspaceId;

  const updateSelectedWorkspace = async () => {
    selectedWorkspace = await _viewModel.getWorkspaceById(workspaceID);
  };

  $: {
    if (workspaceID) {
      updateSelectedWorkspace();
    }
  }

  let currentTeam;
  let currentWorkspace = {
    id: "",
    name: "",
    users: [],
  };
  /**
   * Subscribes to the active workspace and updates the current workspace details
   * and also updates current team details associated with that workspace.
   */
  const activeWorkspaceSubscribe = activeWorkspace.subscribe(
    async (value: WorkspaceDocument) => {
      if (value) {
        currentWorkspace = {
          id: value._data._id,
          name: value._data.name,
          users: value._data.users,
        };
        const currentTeamDetails = {
          id: value._data?.team.teamId,
        };
        currentTeam = await _viewModel.readTeam(currentTeamDetails.id);
      }
    },
  );

  const handleDeleteWorkspace = async () => {
    selectedWorkspace = await _viewModel.getWorkspaceById(workspaceID);
    selectedTeam = await _viewModel.getTeamById(selectedWorkspace.team?.teamId);
    isDeleteWorkspaceModalOpen = true;
  };
  onDestroy(() => {
    activeWorkspaceSubscribe.unsubscribe();
  });
</script>

<WorkspaceExplorer
  {tab}
  {modifiedUser}
  {collectionList}
  bind:isWorkspaceInviteModalOpen
  onDeleteWorkspace={handleDeleteWorkspace}
  onUpdateWorkspaceDescription={_viewModel.updateWorkspaceDescription}
  onUpdateWorkspaceName={_viewModel.updateWorkspaceName}
  {currentWorkspace}
/>

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
    openTeam={selectedTeam}
    onDeleteWorkspace={async () => {
      const response =
        await _viewModel.handleDeleteWorkspace(selectedWorkspace);
      if (response?.isSuccessful) {
        isDeleteWorkspaceModalOpen = false;
      }
    }}
  />
</Modal>
