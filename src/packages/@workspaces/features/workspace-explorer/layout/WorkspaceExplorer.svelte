<script lang="ts">
  import {
    CollectionCount,
    WorkspaceAbout,
    WorkspaceHeader,
    WorkspaceNavigator,
    WorkspaceSetting,
    WorkspaceUpdates,
  } from "../components";

  /**
   * The object representing the last modified user of the workspace.
   */
  export let modifiedUser;

  /**
   * The list of collections related to the workspace.
   */
  export let collectionList;

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

  let workspaceName = tab.name;
  let collectionLength = 0;
  let workspaceDescription = tab.description;
  let workspaceID = tab._data.path.workspaceId;

  $: {
    if (collectionList) {
      collectionList.subscribe((value) => {
        collectionLength = value.length;
      });
    }
  }

  let workspaceNavigatorId: string = "about";
</script>

<div class="d-flex h-100" style="width: 100%;">
  <div
    class="h-100 d-flex flex-column"
    style="border-right:2px solid #000000; width: calc(100% - 280px);  padding:24px;"
  >
    <WorkspaceHeader
      bind:isWorkspaceInviteModalOpen
      {onDeleteWorkspace}
      {onUpdateWorkspaceName}
      {workspaceName}
      {workspaceID}
    />
    <section style="flex:1; overflow:auto;">
      {#if workspaceNavigatorId === "about"}
        <WorkspaceAbout
          {onUpdateWorkspaceDescription}
          {workspaceDescription}
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
    <WorkspaceNavigator bind:workspaceNavigatorId />
    <div style="flex:1; overflow:auto;">
      <WorkspaceUpdates {modifiedUser} />
    </div>
    <CollectionCount {collectionLength} />
  </div>
</div>
