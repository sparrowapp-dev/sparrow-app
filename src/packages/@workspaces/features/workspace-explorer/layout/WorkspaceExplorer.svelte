<script lang="ts">
  import {
    CollectionCount,
    WorkspaceAbout,
    WorkspaceHeader,
    WorkspaceNavigator,
    WorkspaceSetting,
    WorkspaceUpdates,
  } from "../components";

  export let modifiedUser;
  export let collectionList;
  export let tab;
  export let onUpdateWorkspaceName;
  export let onUpdateWorkspaceDescription;
  export let isWorkspaceInviteModalOpen: boolean = false;
  export let onDeleteWorkspace;

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
        <WorkspaceSetting {modifiedUser} />
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
