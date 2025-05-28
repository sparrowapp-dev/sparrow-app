<script lang="ts">
  import {
    InviteToWorkspace,
    WorkspaceExplorer,
  } from "@sparrow/workspaces/features";
  import WorkspaceExplorerViewModel from "./WorkspaceExplorerPage.ViewModel";
  import { Modal } from "@sparrow/library/ui";
  import type { Observable } from "rxjs";
  import { onDestroy, onMount } from "svelte";
  import {
    DeleteWorkspace,
    PublicWorkspace,
    PublishedWorkspace,
    SharedWorkspace,
    FailedPublishedWorkspace,
  } from "@sparrow/common/features";
  import type { TeamDocument, WorkspaceDocument } from "@app/database/database";
  import type { UpdatesDocType } from "../../../../models/updates.model";
  import { user } from "@app/store/auth.store";
  import constants from "@app/constants/constants";
  import { open } from "@tauri-apps/plugin-shell";

  export let collectionList;
  export let tab;

  const _viewModel = new WorkspaceExplorerViewModel(tab);
  const activeWorkspace: Observable<WorkspaceDocument> =
    _viewModel.activeWorkspace;

  const onRemoveUserFromWorkspace = _viewModel.removeUserFromWorkspace;
  const onChangeUserRoleAtWorkspace = _viewModel.changeUserRoleAtWorkspace;

  let isWorkspaceInviteModalOpen = false;
  let isDeleteWorkspaceModalOpen = false;
  let selectedWorkspace: WorkspaceDocument;
  let selectedTeam: TeamDocument;
  let workspaceID = tab._data.path.workspaceId;
  let workspaceType = "";
  let isWorkspacePublicModalOpen = false;
  let isPublishedModalOpen = false;
  let isShareModalOpen = false;
  let isFailedPublishedModalOpen = false;

  const workspaceUpdatesList: Observable<UpdatesDocType[]> =
    _viewModel.getWorkspaceUpdatesList(workspaceID);

  const updateSelectedWorkspace = async () => {
    selectedWorkspace = await _viewModel.getWorkspaceById(workspaceID);
  };

  $: {
    if (workspaceID) {
      updateSelectedWorkspace();
    }
  }
  let userId = "";
  let userRole = "";
  user.subscribe((value) => {
    if (value) {
      userId = value._id;
    }
  });
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

  let currentTeam;
  let currentWorkspace = {
    id: "",
    name: "",
    users: [],
    description: "",
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
          description: value._data.description,
        };
        const currentTeamDetails = {
          id: value._data?.team.teamId,
        };
        findUserRole();
        currentTeam = await _viewModel.readTeam(currentTeamDetails.id);
        workspaceType = value._data?.workspaceType || "PRIVATE";
      }
    },
  );

  const handleDeleteWorkspace = async () => {
    selectedWorkspace = await _viewModel.getWorkspaceById(workspaceID);
    selectedTeam = await _viewModel.getTeamById(selectedWorkspace.team?.teamId);
    isDeleteWorkspaceModalOpen = true;
  };

  const handleWorkspaceUpdatesScroll = () => {
    _viewModel.refetchPreviousUpdates(workspaceID);
  };
  const workspaceLink = `${constants.SPARROW_WEB_APP_URL}/app/collections?workspaceId=${currentWorkspace.id}`;

  // $:{
  //   if(userId )
  // }
  onDestroy(() => {
    activeWorkspaceSubscribe.unsubscribe();
  });
  onMount(async () => {
    await _viewModel.fetchWorkspaceUpdates(workspaceID);
    // findUserRole();
  });
</script>

<WorkspaceExplorer
  bind:userRole
  bind:isShareModalOpen
  tab={_viewModel.tab}
  {workspaceUpdatesList}
  {workspaceType}
  collectionLength={$collectionList?.filter(
    (value) => value.workspaceId === currentWorkspace?.id,
  )?.length}
  bind:isWorkspaceInviteModalOpen
  onDeleteWorkspace={handleDeleteWorkspace}
  onUpdateWorkspaceDescription={_viewModel.handleUpdateDescription}
  onUpdateWorkspaceName={_viewModel.handleUpdateName}
  onWorkspaceUpdateScroll={handleWorkspaceUpdatesScroll}
  onSaveWorkspace={_viewModel.handleSaveWorkspace}
  {currentWorkspace}
  {onRemoveUserFromWorkspace}
  {onChangeUserRoleAtWorkspace}
  onMakeWorkspacePublic={() => (isWorkspacePublicModalOpen = true)}
  onShareWorkspace={_viewModel.handleShareWorkspace}
  activeWorkspace={$activeWorkspace}
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
  width={"40%"}
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

<Modal
  title={"Publish Workspace"}
  type={"dark"}
  width={"40%"}
  zIndex={1000}
  isOpen={isWorkspacePublicModalOpen}
  handleModalState={(flag) => {
    isWorkspacePublicModalOpen = flag;
  }}
>
  <PublicWorkspace
    bind:isWorkspacePublicModalOpen
    workspace={currentWorkspace}
    onMakePublicWorkspace={async () => {
      const response = await _viewModel.handleWorkspaceVisibility();
      if (response?.isSuccessful) {
        isWorkspacePublicModalOpen = false;
        isPublishedModalOpen = true;
      } else {
        isFailedPublishedModalOpen = true;
      }
    }}
    onRedirectTermsService={() => {
      open(`${constants.MARKETING_URL}/terms-of-service`);
    }}
    onRedirectPrivacyPolicy={() => {
      open(`${constants.MARKETING_URL}/privacy-policy`);
    }}
    onRedirectDocs={() => {
      open(`${constants.INTRO_DOCS_URL}`);
    }}
  />
</Modal>

<Modal
  title={""}
  type={"dark"}
  width={"40%"}
  zIndex={1000}
  isOpen={isPublishedModalOpen}
  handleModalState={(flag) => {
    isPublishedModalOpen = flag;
  }}
>
  <PublishedWorkspace
    workspaceName={currentWorkspace.name}
    onCopyLink={_viewModel.handleShareWorkspace}
    {workspaceLink}
  />
</Modal>

<Modal
  title={`Share ${currentWorkspace.name}`}
  type={"dark"}
  width={"40%"}
  zIndex={1000}
  isOpen={isShareModalOpen}
  handleModalState={(flag) => {
    isShareModalOpen = flag;
  }}
>
  <SharedWorkspace
    {workspaceLink}
    onCopyLink={_viewModel.handleShareWorkspace}
  />
</Modal>

<Modal
  title={""}
  type={"dark"}
  width={"40%"}
  zIndex={1000}
  isOpen={isFailedPublishedModalOpen}
  handleModalState={(flag) => {
    isFailedPublishedModalOpen = flag;
  }}
>
  <FailedPublishedWorkspace
    bind:isFailedPublishedModalOpen
    workspaceName={currentWorkspace.name}
  />
</Modal>
