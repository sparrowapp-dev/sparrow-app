<script lang="ts">
  import { InviteToWorkspace, WorkspaceExplorer } from "@workspaces/features";
  import WorkspaceExplorerViewModel from "./WorkspaceExplorerPage.ViewModel";
  import { Modal } from "@library/ui";
  import type { WorkspaceDocument } from "@app/database/database";
  import type { Observable } from "rxjs";
  import { onDestroy } from "svelte";

  export let modifiedUser;
  export let collectionList;
  export let tab;

  const _viewModel = new WorkspaceExplorerViewModel();
  const activeWorkspace: Observable<WorkspaceDocument> =
    _viewModel.activeWorkspace;

  let isWorkspaceInviteModalOpen: boolean = false;
  let currentWorkspaceDetails = {
    id: "",
    name: "",
    users: [],
  };

  let currentTeam;
  const activeWorkspaceSubscribe = activeWorkspace.subscribe(
    async (value: WorkspaceDocument) => {
      if (value) {
        currentWorkspaceDetails = {
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

  // const activeTeamsSubscribe = activeTeam.subscribe(
  //   async (team: TeamDocument) => {
  //     if (team) {
  //       currentActiveTeam = team;
  //       team._data.users.forEach((user) => {
  //         // if (user.id === loggedInUser?.id) {
  //         //   loggedUserRole = user.role as TeamRole;
  //         // }
  //       });
  //     }
  //   },
  // );
  onDestroy(() => {
    activeWorkspaceSubscribe.unsubscribe();
  });
</script>

<WorkspaceExplorer
  {tab}
  {modifiedUser}
  {collectionList}
  bind:isWorkspaceInviteModalOpen
  onUpdateWorkspaceDescription={_viewModel.updateWorkspaceDescription}
  onUpdateWorkspaceName={_viewModel.updateWorkspaceName}
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
    {currentWorkspaceDetails}
    users={currentTeam?.users}
    teamName={currentTeam?.name}
    addUsersInWorkspace={() => {}}
    addUsersInWorkspaceInRxDB={() => {}}
  />
</Modal>
