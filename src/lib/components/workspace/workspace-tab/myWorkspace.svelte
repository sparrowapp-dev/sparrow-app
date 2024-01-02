<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { NewTab } from "$lib/utils/interfaces/request.interface";
  import { HeaderDashboardViewModel } from "../../header/header-dashboard/HeaderDashboard.ViewModel";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import Tooltip from "../../tooltip/Tooltip.svelte";
  import icons from "$lib/assets/app.asset";
  import { user } from "$lib/store/auth.store";
  import { isWorkspaceCreatedFirstTime } from "$lib/store/workspace.store";
  import type { Observable } from "rxjs";
  import type {
    CollectionDocument,
    WorkspaceDocument,
  } from "$lib/database/app.database";
  import type { CollectionListViewModel } from "$lib/components/collections/collections-list/CollectionList.ViewModel";
  export let collectionsMethods: CollectionsMethods;
  export let activeTab;
  const _viewModel = new HeaderDashboardViewModel();
  let tabName: string = "";
  let workspaceDescription: string = "";
  let componentData: NewTab;
  let newWorkspaceName: string;
  let ownerName: string;
  let noOfCollections = 0;
  const activeWorkspace: Observable<WorkspaceDocument> =
    _viewModel.activeWorkspace;
  const tabSubscribe = activeTab.subscribe((event: NewTab) => {
    if (event) {
      tabName = event?.name;
      workspaceDescription = event.description ?? "";
      componentData = event;
    }
  });
  export let _collectionListViewModel: CollectionListViewModel;
  const collections: Observable<CollectionDocument[]> =
    _collectionListViewModel.collection;

  const handleWorkspaceInput = (event) => {
    newWorkspaceName = event.target.value;
    collectionsMethods.updateTab(false, "save", componentData.path.workspaceId);
  };

  const handleWorkspaceDescription = (event) => {
    workspaceDescription = event.target.value;
    collectionsMethods.updateTab(
      workspaceDescription,
      "description",
      componentData.path.workspaceId,
    );
  };

  const onRenameBlur = async () => {
    await _viewModel.modifyWorkspace(
      componentData,
      collectionsMethods,
      newWorkspaceName,
      tabName,
    );
  };

  const onUpdateBlur = async () => {
    await _viewModel.modifyWorkspaceDescription(
      componentData,
      collectionsMethods,
      tabName,
      workspaceDescription,
    );
  };
  const collectionSubscribe = collections.subscribe(
    (collectionArr: CollectionDocument[]) => {
      if (collectionArr) {
        noOfCollections = collectionArr.length;
      }
    },
  );

  let name: string = "";
  let email: string = "";
  let firstLetter;
  const unsubscribeUser = user.subscribe((value) => {
    if (value) {
      if (value.personalWorkspaces) {
        name = value?.personalWorkspaces[0]?.name;
      }
      if (name) {
        firstLetter = name[0];
      }
      email = value?.email;
    }
  });

  const activeWorkspaceSubscribe = activeWorkspace.subscribe(
    (value: WorkspaceDocument) => {
      if (value) {
        ownerName = value._data.owner.name;
        if (ownerName) {
          name = ownerName;
          firstLetter = name[0];
        } else {
          name = name;
        }
      }
    },
  );

  const userUnsubscribe = user.subscribe(async (value) => {
    if (value) {
      await _viewModel.refreshWorkspaces(value._id);
    }
  });

  let isWorkspaceNameVisibility: boolean;
  const unsubscribeisWorkspaceCreatedFirstTime =
    isWorkspaceCreatedFirstTime.subscribe((value) => {
      isWorkspaceNameVisibility = value;
    });

  onDestroy(() => {
    unsubscribeisWorkspaceCreatedFirstTime();
    unsubscribeUser();
    tabSubscribe();
    userUnsubscribe();
  });
  let autofocus = isWorkspaceNameVisibility;

  let inputElement;
  onMount(() => {
    if (autofocus) {
      inputElement.select();
    }
  });

  const onRenameInputKeyPress = (event) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(
        "renameInputFieldWorkspace",
      ) as HTMLInputElement;
      inputField.blur();
    }
  };

  const onUpdateWorkspaceDescription = (event) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(
        "updateDescriptionFieldWorkspace",
      ) as HTMLInputElement;
      inputField.blur();
    }
  };
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
        id="renameInputFieldWorkspace"
        {autofocus}
        class="bg-backgroundColor form-control border-0 text-left w-100 ps-2 py-0 fs-5 input-outline"
        on:input={(event) => {
          handleWorkspaceInput(event);
        }}
        on:blur={onRenameBlur}
        on:keydown={onRenameInputKeyPress}
        bind:this={inputElement}
      />

      <Tooltip>
        <button class="btn btn-primary rounded border-0 py-1">Invite</button>
      </Tooltip>
    </div>
    <div class="d-flex align-items-start ps-0 h-100">
      <textarea
        value={workspaceDescription}
        id="updateDescriptionFieldWorkspace"
        {autofocus}
        class="form-control bg-backgroundColor border-0 text-textColor fs-6 h-50 input-outline"
        on:input={(event) => {
          handleWorkspaceDescription(event);
        }}
        on:blur={onUpdateBlur}
        on:keydown={onUpdateWorkspaceDescription}
        bind:this={inputElement}
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
            style="width: 24px; height: 24px;border-radius:50%"
          >
            <p
              class="mb-0 profile-circle bg-plusButton text-black m-auto text-center d-flex align-items-center justify-content-center"
              style="width: 100%; height: 100%; margin: 0;"
            >
              {!firstLetter
                ? email[0]?.toUpperCase()
                : firstLetter?.toUpperCase()}
            </p>
          </button>
          <p class="mb-0">{!name ? email : name}</p>
        </div>
      </div>
    </div>
    <div class="workspace-info gap-3 text-defaultColor">
      <p>
        <span class="me-1 fs-6 text-plusButton">{noOfCollections}</span
        >COLLECTION
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

  .btn-primary {
    z-index: 5;
  }

  .profile-circle {
    border-radius: 50%;
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
