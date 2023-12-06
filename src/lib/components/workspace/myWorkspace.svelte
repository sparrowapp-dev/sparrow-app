<script lang="ts">
  import { WorkspaceService } from "$lib/services/workspace.service";
  import { currentTab } from "$lib/store/request-response-section";
  import { currentWorkspace } from "$lib/store/workspace.store";
  import { onDestroy } from "svelte";
  import { setCurrentWorkspace } from "$lib/store/workspace.store";

  interface workspace {
    id: string;
    name: string;
  }
  let selectedWorkspace: Partial<workspace> = {};
  let currentWorkSpaceTabId: string;
  let newWorkspaceName: string;
  const workspaceService = new WorkspaceService();
  const workspaceUnSubscribe = currentWorkspace.subscribe((value) => {
    selectedWorkspace = value;
  });
  const currentTabUnsubscribe = currentTab.subscribe((value) => {
    if (value && value.id) {
      currentWorkSpaceTabId = value.id;
    }
  });

  const handleWorkspaceInput = (event) => {
    // handleTabUpdate({save:false},currentWorkSpaceTabId)
    newWorkspaceName = event.target.value;
  };

  const modifyWorkspace = async () => {
    const workspace = await workspaceService.updateWorkspace(
      selectedWorkspace.id,
      { name: newWorkspaceName },
    );

    const { _id: id, name } = workspace?.data?.data;
    setCurrentWorkspace(id, name);
    // handleTabUpdate({save:true,name},id)
  };
  onDestroy(() => {
    workspaceUnSubscribe();
    currentTabUnsubscribe();
  });
</script>

<div class="main-container">
  <div class="my-workspace d-flex flex-column">
    <div class="d-flex w-100 justify-content-between">
      <input
        type="text"
        value={selectedWorkspace.name}
        class="workspace-input border-0 text-center"
        on:input={(event) => {
          handleWorkspaceInput(event);
        }}
        on:blur={() => {
          modifyWorkspace();
        }}
        on:keydown={(event) => {
          if (event.key == "Enter") {
            modifyWorkspace();
          }
        }}
      />
      <button class="invite-btn border-0">Invite</button>
    </div>
    <div class="my-workspace-info">
      <p class="workspace-info">
        This is your personal workspace.Start Typing. Describe the Objective of
        your workspace and how it is meant to be used. Or create a comprehensive
        API documentaion by including links to your collection and requests
      </p>
    </div>
  </div>
</div>

<style>
  .main-container {
    margin-top: 44px;
    position: fixed;
    left: 352px;
    width: calc(100vw - 352px - 280px);
    height: calc(100vh - 44px);
    background-color: var(--background-color);
  }
  .my-workspace {
    width: 100%;
    padding: 20px;
  }
  .workspace-input {
    background-color: linear-gradient(0deg, #313233, #313233);
    border-bottom: 1px solid #85c2ff;
  }
  .invite-btn {
    background-color: #1193f0;
    padding: 5px 20px;
    border-radius: 5px;
  }
  .workspace-info {
    font-size: 15px;
    margin-top: 15px;
    font-family: Roboto;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0em;
    text-align: left;
    color: #8a9299;
  }
</style>
