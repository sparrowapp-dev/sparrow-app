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
  import type { UpdatesDocType } from "@app/models/updates.model";

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
  export let workspaceUpdatesList: Observable<UpdatesDocType[]>;

  /**
   * Function to be called on end of scroll
   */
  export let onWorkspaceUpdateScroll;

  /**
   * Role of user in active workspace
   */
  export let userRole;

  let workspaceName = tab.name;
  let workspaceDescription = tab.description;
  let workspaceID = tab._data.path.workspaceId;

  let workspaceNavigatorId: string = "about";
</script>

<div class="d-flex h-100" style="width: 100%;">
  <div
    class="h-100 d-flex flex-column"
    style="border-right:2px solid #000000; width: calc(100% - 280px);  padding:24px;"
  >
    <WorkspaceHeader
      bind:userRole
      bind:isWorkspaceInviteModalOpen
      {onDeleteWorkspace}
      {onUpdateWorkspaceName}
      workspaceName={currentWorkspace.name}
      {workspaceID}
    />
    <section style="flex:1; overflow:auto;">
      {#if workspaceNavigatorId === "about"}
        <WorkspaceAbout
          bind:userRole
          {onUpdateWorkspaceDescription}
          workspaceDescription={currentWorkspace.description}
          {workspaceID}
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

  <div
    class="d-flex flex-column h-100"
    style=" width:280px; padding: 24px 16px 24px 16px ;"
  >
    <WorkspaceNavigator bind:workspaceNavigatorId bind:userRole />
    <WorkspaceUpdates
      workspaceUpdatesList={$workspaceUpdatesList}
      {onWorkspaceUpdateScroll}
    />
    <CollectionCount {collectionLength} />
  </div>
</div>
