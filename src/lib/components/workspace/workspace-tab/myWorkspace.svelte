<script lang="ts">
  import { WorkspaceService } from "$lib/services/workspace.service";
  import { onDestroy } from "svelte";
  import type { NewTab } from "$lib/utils/interfaces/request.interface";
  import { HeaderDashboardViewModel } from "../../header/header-dashboard/HeaderDashboard.ViewModel";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import Tooltip from "../../tooltip/Tooltip.svelte";
  import icons from "$lib/assets/app.asset";
  import { user } from "$lib/store/auth.store";
  export let collectionsMethods: CollectionsMethods;
  export let activeTab;
  const _viewModel = new HeaderDashboardViewModel();
  const workspaceService = new WorkspaceService();
  let tabName: string = "";
  let componentData: NewTab;
  let newWorkspaceName: string;
  let createWorkspaceNameVisibility: boolean = false;

  const tabSubscribe = activeTab.subscribe((event: NewTab) => {
    tabName = event?.name;
    componentData = event;
  });

  const handleWorkspaceInput = (event) => {
    newWorkspaceName = event.target.value;
    collectionsMethods.updateTab(false, "save", componentData.path.workspaceId);
  };

  const modifyWorkspace = async () => {
    if (newWorkspaceName) {
      const workspace = await workspaceService.updateWorkspace(
        componentData.id,
        {
          name: newWorkspaceName,
        },
      );

      tabName = workspace?.data?.data.name;
      _viewModel.updateWorkspace(componentData.id, tabName);

      collectionsMethods.updateTab(
        tabName,
        "name",
        componentData.path.workspaceId,
      );
      collectionsMethods.updateTab(
        true,
        "save",
        componentData.path.workspaceId,
      );
    }
  };

  let name: string = "";
  let firstLetter;
  const unsubscribeUser = user.subscribe((value) => {
    if (value) {
      if (value.personalWorkspaces) {
        name = value?.personalWorkspaces[0]?.name;
      }
      if (name) {
        firstLetter = name[0];
      }
    }
  });

  onDestroy(() => {
    unsubscribeUser();
    tabSubscribe();
  });
</script>

<div class="main-container d-flex">
  <div
    class="my-workspace d-flex flex-column"
    style="width:calc(100% - 280px); margin-top: 15px;"
  >
    <div class="d-flex aling-items-center justify-content-between gap-2 mb-5">
      <input
        type="text"
        value={tabName}
        class="bg-backgroundColor form-control border-0 text-left w-100 ps-2 py-0 fs-5 input-outline"
        on:input={(event) => {
          handleWorkspaceInput(event);
        }}
        on:keydown={(event) => {
          if (event.key == "Enter") {
            modifyWorkspace();
          }
        }}
      />

      <Tooltip>
        <button class="btn btn-primary rounded border-0 text-align-right py-1"
          >Invite</button
        >
      </Tooltip>
    </div>
    <div class="d-flex align-items-start ps-0 h-100">
      <textarea
        type="text"
        class="form-control bg-backgroundColor border-0 text-textColor fs-6 h-50 input-outline"
        placeholder="Start typing. Describe the objectives of the workspace and how it is meant to be used.  Or create a comprehensive API documentation by including links to your collections and requests."
      />
    </div>
  </div>
  <div
    class="d-flex flex-column align-items-left justify-content-start"
    style="width: 280px;border-left:2px solid #313233"
  >
    <div
      class="d-flex flex-column text-whiteColor mt-4 ps-3 gap-1"
      style="font-size: 12px;"
    >
      <div
        class="d-flex align-items-center gap-2 mt-2 info-setting-hover rounded py-2 cursor-pointer"
      >
        <img src={icons.info} alt="info" class="ps-2" />
        <p class="mb-0">About</p>
      </div>
      <div
        class="d-flex align-items-center gap-2 info-setting-hover rounded py-2"
      >
        <img src={icons.setting} alt="settings" class="ps-2" />
        <p class="mb-0">Workspace Settings</p>
      </div>
      <div class="mb-3 mt-2">
        <img src={icons.line} alt="lineicon" />
      </div>
      <div class="d-flex flex-column">
        <p class="fw-bold fs-6 text-textColor ps-3">Last Activity by</p>
        <div class="d-flex align-items-center ps-3 gap-2">
          <button
            class="bg-backgroundColor border-0"
            id="profile-dropdown"
            style="width: 24px; height: 24px;"
          >
            <p
              class=" mb-0 profile-circle bg-plusButton text-black m-auto text-center align-items-center justify-content-center"
            >
              {firstLetter.toUpperCase()}
            </p>
          </button>
          <p class="mb-0">{name}</p>
        </div>
      </div>
    </div>
    <div class="workspace-info gap-3 text-defaultColor">
      <p><span class="me-1 fs-6 text-plusButton">{0}</span>API REQUESTS</p>
      <p>
        <span class="me-1 fs-6 text-plusButton">{0}</span>COLLECTION
      </p>
    </div>
  </div>
</div>

<style>
  .main-container {
    height: calc(100vh - 80px);
    background-color: var(--background-color);
  }
  .my-workspace {
    padding: 20px;
  }

  .profile-circle {
    border-radius: 70%;
  }

  .info-setting-hover:hover {
    background-color: var(--border-color);
  }

  textarea::placeholder {
    font-size: 12px;
    color: var(--text-color);
  }

  .input-outline {
    border-radius: 0%;
  }

  .input-outline:focus {
    outline: 2px solid var(--sparrow-blue);
  }

  .workspace-info {
    position: fixed;
    bottom: 0;
    padding: 15px;
    display: flex;
    width: 100%;
    font-size: 12px;
  }
</style>
