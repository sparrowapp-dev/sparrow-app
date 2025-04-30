<script lang="ts">
  import type { Observable } from "rxjs";
  import {
    CollectionCount,
    WorkspaceAbout,
    WorkspaceHeader,
    WorkspaceNavigator,
    WorkspaceSetting,
    WorkspaceUpdates,
  } from "../components";
  import { WorkspaceType } from "@sparrow/common/enums";

  /**
   * The length of collections related to the workspace.
   */
  export let collectionLength = 0;

  /**
   * The current active tab or section within the workspace.
   */
  export let tab;

  /**
   * Function to update the workspace name.
   */
  export let onUpdateWorkspaceName;

  /**
   * Function to update the workspace description.
   */
  export let onUpdateWorkspaceDescription;

  /**
   * Boolean flag to indicate if the workspace invite modal is open.
   */
  export let isWorkspaceInviteModalOpen: boolean = false;

  /**
   * Function to delete the workspace.
   */
  export let onDeleteWorkspace;

  /**
   * The current active workspace object.
   */
  export let currentWorkspace;

  export let onRemoveUserFromWorkspace;
  export let onChangeUserRoleAtWorkspace;

  /**
   * List of updates of a workspace
   */
  export let workspaceUpdatesList: Observable<any[]>;

  /**
   * Function to be called on end of scroll
   */
  export let onWorkspaceUpdateScroll;

  /**
   * Role of user in active workspace
   */
  export let userRole: any;

  let workspaceID = $tab?.id;

  let workspaceNavigatorId: string = "about";

  export let onSaveWorkspace;
  export let workspaceType: WorkspaceType = WorkspaceType.PRIVATE;
  export let isSharedWorkspace = false;
  export let onMakeWorkspacePublic;
  export let onShareWorkspace;
</script>

<div class="d-flex h-100" style="width: 100%;">
  <div
    class="h-100 d-flex flex-column p-3"
    style="border-right:2px solid #000000; width: calc(100% - 280px);"
  >
    <WorkspaceHeader
      {userRole}
      {isSharedWorkspace}
      bind:isWorkspaceInviteModalOpen
      {onDeleteWorkspace}
      {onUpdateWorkspaceName}
      workspaceName={$tab?.name}
      {workspaceID}
      {onSaveWorkspace}
      isSaved={$tab?.isSaved}
    />
    <hr />
    <section style="flex:1; overflow:auto;">
      {#if workspaceNavigatorId === "about"}
        <WorkspaceAbout
          {userRole}
          workspaceName={$tab?.name}
          {onUpdateWorkspaceDescription}
          workspaceDescription={$tab?.description}
          {workspaceType}
          {onMakeWorkspacePublic}
          {onShareWorkspace}
        />
      {:else if workspaceNavigatorId === "settings"}
        <WorkspaceSetting
          users={currentWorkspace?.users}
          {currentWorkspace}
          {onRemoveUserFromWorkspace}
          {onChangeUserRoleAtWorkspace}
        />
      {/if}
    </section>
  </div>

  <div class="d-flex flex-column h-100 p-3" style=" width:280px;">
    <WorkspaceNavigator bind:workspaceNavigatorId {userRole} />
    <WorkspaceUpdates
      workspaceUpdatesList={$workspaceUpdatesList}
      {onWorkspaceUpdateScroll}
      {isSharedWorkspace}
    />
    <hr />
    <CollectionCount {collectionLength} />
  </div>
</div>
