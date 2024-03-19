<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import { MyCollectionViewModel } from "./MyCollection.viewModel";
  import {
    collapsibleState,
    isApiCreatedFirstTime,
  } from "$lib/store/request-response-section";
  import type { NewTab } from "$lib/utils/interfaces/request.interface";
  import { isCollectionCreatedFirstTime } from "$lib/store/collection";
  import type { CollectionListViewModel } from "../collections-list/CollectionList.ViewModel";
  import type { CollectionDocument } from "$lib/database/app.database";
  import type { Observable } from "rxjs";
  import { ResponseStatusCode, WorkspaceRole } from "$lib/utils/enums";
  import {
    PERMISSION_NOT_FOUND_TEXT,
    workspaceLevelPermissions,
  } from "$lib/utils/constants/permissions.constant";
  import { hasWorkpaceLevelPermission } from "$lib/utils/helpers";
  import Tooltip from "$lib/components/tooltip/Tooltip.svelte";
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import { CollectionService } from "$lib/services/collection.service";
  import { ImportCollectionViewModel } from "../collections-list/import-collection/ImportCollection.viewModel";
  import { notifications } from "$lib/components/toast-notification/ToastNotification";
  import Button from "$lib/components/buttons/Button.svelte";
  import { invoke } from "@tauri-apps/api/core";

  export let loaderColor = "default";
  export let activeTab;
  export let collectionsMethods: CollectionsMethods;
  export let _collectionListViewModel: CollectionListViewModel;
  export let loggedUserRoleInWorkspace: WorkspaceRole;
  export let currentWorkspaceId: "";

  const _collectionService = new CollectionService();
  const _viewImportCollection = new ImportCollectionViewModel();
  const collections: Observable<CollectionDocument[]> =
    _collectionListViewModel.collection;
  let activeTabId: string;

  let tabName: string = "";
  let componentData: NewTab;
  let totalFolder: number = 0;
  let totalRequest: number = 0;
  let tabDescription = "";
  let isSynced = false;
  const _myColllectionViewModel = new MyCollectionViewModel();

  const tabSubscribe = activeTab.subscribe(async (event: NewTab) => {
    if (event) {
      tabName = event?.name;
      tabDescription = event?.description;
      componentData = event;
      activeTabId = event.id;
    }
  });
  let collectionCountArr = [];
  let currentCollection;
  const refreshCount = () => {
    if (collectionCountArr && activeTabId) {
      collectionCountArr.forEach(async (collection) => {
        if (collection._data.id === activeTabId) {
          const collectionData =
            await collectionsMethods.getNoOfApisandFolders(collection);
          totalRequest = collectionData.requestCount;
          totalFolder = collectionData.folderCount;
          currentCollection = collection;
          const response = await _collectionService.switchCollectionBranch(
            currentCollection?.id,
            currentCollection?.currentBranch
              ? currentCollection?.currentBranch
              : currentCollection?.PrimaryBranch,
          );
          if (response.isSuccessful) {
            isSynced = true;
          } else {
            isSynced = false;
          }
          return;
        }
      });
    }
  };

  const collectionSubscribe = collections.subscribe(
    (value: CollectionDocument[]) => {
      if (value) {
        collectionCountArr = value;
        refreshCount();
      }
    },
  );

  $: {
    if (activeTabId) {
      refreshCount();
    }
  }
  const onUpdate = async (property: string, event) => {
    const value = event.target.value;
    await _myColllectionViewModel.modifyCollection(
      componentData,
      property,
      value,
      collectionsMethods,
    );
  };

  const onDescInputKeyPress = (event) => {
    if (event.shiftKey && event.key === "Enter") {
      const inputField = document.getElementById(
        "updateCollectionDescField",
      ) as HTMLInputElement;
      inputField.blur();
    }
  };

  const handleApiRequest = async () => {
    isApiCreatedFirstTime.set(true);

    const response = await _myColllectionViewModel.createApiRequest(
      componentData,
      collectionsMethods,
    );
    if (response.isSuccessful) {
      isLoading = false;
    }
  };
  let refreshCollectionLoader = false;
  const handleSyncCollection = async () => {
    if (refreshCollectionLoader) return;
    const errMessage = `Failed to sync the collection. Local reposisitory branch is not set to ${currentCollection?.currentBranch}.`;
    try {
      const activeResponse = await invoke("get_git_active_branch", {
        path: currentCollection?.localRepositoryPath,
      });
      if (activeResponse) {
        let currentBranch = activeResponse;
        if (currentCollection?.currentBranch) {
          if (currentBranch !== currentCollection?.currentBranch) {
            notifications.error(errMessage);
            return;
          }
        } else {
          if (currentBranch !== currentCollection?.primaryBranch) {
            notifications.error(errMessage);
            return;
          }
        }
      } else {
        notifications.error(errMessage);
        return;
      }
    } catch (e) {
      notifications.error(errMessage);
      return;
    }
    refreshCollectionLoader = true;
    const responseJSON = await _collectionService.validateImportCollectionURL(
      currentCollection.activeSyncUrl,
    );
    if (responseJSON?.data?.status === ResponseStatusCode.OK) {
      const response = await _viewImportCollection.importCollectionData(
        currentWorkspaceId,
        {
          url: currentCollection?.activeSyncUrl,
          urlData: {
            data: JSON.parse(responseJSON.data.response),
            headers: responseJSON.data.headers,
          },
          primaryBranch: currentCollection?.primaryBranch,
          currentBranch: currentCollection?.currentBranch
            ? currentCollection?.currentBranch
            : currentCollection?.primaryBranch,
        },
        currentCollection.activeSync,
      );

      if (response.isSuccessful) {
        await collectionsMethods.updateCollection(
          currentCollection?.id,
          response.data.data.collection,
        );
        notifications.success("Collection synced.");
      } else {
        notifications.error("Failed to sync the collection. Please try again.");
      }
    } else {
      notifications.error(
        `Unable to detect ${currentCollection?.activeSyncUrl.replace(
          "-json",
          "",
        )}.`,
      );
    }
    refreshCollectionLoader = false;
  };

  let collapsExpandToggle: boolean = false;

  const collapsibleStateUnsubscribe = collapsibleState.subscribe((value) => {
    collapsExpandToggle = value;
  });

  let isCollectionNameVisibility: boolean;

  const unsubscribeisCollectionCreatedFirstTime =
    isCollectionCreatedFirstTime.subscribe((value) => {
      isCollectionNameVisibility = value;
    });

  onDestroy(() => {
    tabSubscribe();
    collapsibleStateUnsubscribe();
    unsubscribeisCollectionCreatedFirstTime();
    collectionSubscribe.unsubscribe();
  });

  let autofocus = isCollectionNameVisibility;

  let inputElement;

  onMount(() => {
    // When autofocus is true, select the text in the input element
    if (autofocus) {
      inputElement.select();
    }
  });
  const handleBranchChange = async (branch: string) => {
    const response = await _collectionService.switchCollectionBranch(
      currentCollection?.id,
      branch,
    );
    var result = window.confirm(
      "Switching branch will close all the open tabs!",
    );
    if (result) {
      await collectionsMethods.clearTabs();
    } else {
      return;
    }
    if (response.isSuccessful) {
      collectionsMethods.updateCollection(currentCollection?.id, {
        currentBranch: branch,
        items: response.data.data.items,
      });
    } else {
      collectionsMethods.updateCollection(currentCollection?.id, {
        currentBranch: branch,
        items: [],
      });
    }
    notifications.success("Branch switched successfully.");
  };
  const onRenameInputKeyPress = (event) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(
        "renameInputFieldCollection",
      ) as HTMLInputElement;
      inputField.blur();
    }
  };
</script>

<div class="main-container d-flex">
  <div
    class="my-collection d-flex flex-column"
    style="width:calc(100% - 280px); margin-top: 15px;"
  >
    <Tooltip
      title={PERMISSION_NOT_FOUND_TEXT}
      show={!hasWorkpaceLevelPermission(
        loggedUserRoleInWorkspace,
        workspaceLevelPermissions.SAVE_REQUEST,
      )}
    >
      <div class="d-flex aling-items-center gap-2 mb-4">
        <div class="d-flex flex-column flex-grow-1">
          <input
            type="text"
            required
            {autofocus}
            maxlength={100}
            id="renameInputFieldCollection"
            value={tabName}
            class="bg-backgroundColor input-outline form-control border-0 text-left w-100 ps-2 py-0 fs-5"
            disabled={!hasWorkpaceLevelPermission(
              loggedUserRoleInWorkspace,
              workspaceLevelPermissions.SAVE_REQUEST,
            ) || currentCollection?.activeSync}
            on:blur={(event) => onUpdate("name", event)}
            on:keydown={onRenameInputKeyPress}
            bind:this={inputElement}
          />
          {#if currentCollection?.activeSync}
            <div class="d-flex">
              <Dropdown
                dropdownId={"hashfref128"}
                data={[
                  ...currentCollection.branches.map((elem) => {
                    elem.id = elem.name;
                    return elem;
                  }),
                  {
                    name: currentCollection?.primaryBranch,
                    id: currentCollection?.primaryBranch,
                  },
                ].filter(
                  (value, index, self) =>
                    index === self.findIndex((t) => t.id === value.id),
                )}
                additionalType={"branch"}
                onclick={handleBranchChange}
                dropDownType={{
                  type: "text",
                  title: currentCollection?.currentBranch
                    ? currentCollection?.currentBranch
                    : currentCollection?.primaryBranch,
                }}
                staticClasses={[
                  {
                    id: "hashfref128-options-container",
                    classToAdd: ["start-0", "end-0", "bg-backgroundDropdown"],
                  },
                ]}
                hoverClasses={[
                  {
                    id: "hashfref128-btn-div",
                    classToAdd: ["border-bottom", "border-labelColor"],
                  },
                ]}
                staticCustomStyles={[
                  {
                    id: "hashfref128-options-container",
                    styleKey: "maxHeight",
                    styleValue: "140px",
                  },
                  {
                    id: "hashfref128-options-container",
                    styleKey: "overflowY",
                    styleValue: "auto",
                  },
                ]}
              ></Dropdown>
            </div>
          {/if}
        </div>
        <div class="d-flex flex-row">
          {#if currentCollection?.activeSync}
            <div class="d-flex flex-column justify-content-center">
              <Button
                disable={!hasWorkpaceLevelPermission(
                  loggedUserRoleInWorkspace,
                  workspaceLevelPermissions.SAVE_REQUEST,
                ) || refreshCollectionLoader}
                title={`Sync Collection`}
                type="dark"
                loader={refreshCollectionLoader}
                buttonClassProp={`me-2`}
                onClick={handleSyncCollection}
              />
            </div>
          {/if}

          <div class="d-flex flex-column justify-content-center">
            <button
              disabled={!hasWorkpaceLevelPermission(
                loggedUserRoleInWorkspace,
                workspaceLevelPermissions.SAVE_REQUEST,
              )}
              class="btn btn-primary rounded m-1 border-0 text-align-right py-1"
              style="max-height:40px"
              on:click={handleApiRequest}>New Request</button
            >
          </div>
        </div>
      </div>
    </Tooltip>
    {#if currentCollection?.activeSync && !isSynced}
      <div
        class={`"d-flex"
        } flex-column align-items-center flex-grow-1 justify-content-center pt-5`}
      >
        <div class="d-flex flex-column align-items-center">
          <div class="text-secondary pb-3 sparrow-fs-16">
            Branch Information Unavailable
          </div>
          <div class="text-secondary pb-3 sparrow-fs-12">
            the current branch {currentCollection?.currentBranch
              ? currentCollection?.currentBranch
              : currentCollection?.currentBranch} is not available
          </div>
          <div class="text-secondary sparrow-fs-12">
            To resolve this issue, please follow these steps:
          </div>
          <ol type="1">
            <li class="text-secondary sparrow-fs-12">
              Run the project to initialize the development environment.
            </li>
            <li class="text-secondary sparrow-fs-12">
              Click on ‘Sync Collection’ button to synchronize the branch
              information.
            </li>
          </ol>
          <Button
            disable={!hasWorkpaceLevelPermission(
              loggedUserRoleInWorkspace,
              workspaceLevelPermissions.SAVE_REQUEST,
            ) || refreshCollectionLoader}
            title={`Sync Collection`}
            type="primary"
            loader={refreshCollectionLoader}
            buttonClassProp={`me-2`}
            onClick={handleSyncCollection}
          />
        </div>
      </div>
    {/if}
    <div
      class={`${
        !isSynced && currentCollection?.activeSync ? "d-none" : "d-block"
      } align-items-center`}
    >
      <div class="d-flex gap-4 mb-4 ps-2">
        <div class="d-flex align-items-center gap-2">
          <span class="fs-4 text-plusButton">{totalRequest}</span>
          <p style="font-size: 12px;" class="mb-0">API Requests</p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class="fs-4 text-plusButton">{totalFolder}</span>
          <p style="font-size: 12px;" class="mb-0">Folder</p>
        </div>
      </div>
      <div class="d-flex align-items-start ps-0 h-100">
        <textarea
          disabled={!hasWorkpaceLevelPermission(
            loggedUserRoleInWorkspace,
            workspaceLevelPermissions.EDIT_COLLECTION_DESC,
          ) || currentCollection?.activeSync}
          id="updateCollectionDescField"
          style="font-size: 12px;"
          value={tabDescription}
          class="form-control bg-backgroundColor border-0 text-textColor fs-6 h-50 input-outline"
          placeholder="Describe the collection. Add code examples and tips for your team to effectively use the APIs."
          on:blur={(event) => onUpdate("description", event)}
          on:keydown={onDescInputKeyPress}
        />
      </div>
    </div>
  </div>
  <div
    class="d-flex flex-column align-items-left justify-content-start"
    style="width: 280px;border-left:2px solid #313233"
  >
    <div
      style="text-align:left;font-size:16px; font-weigh:400;"
      class="mt-5 ps-3 text-whiteColor"
    >
      <p>Index</p>
    </div>
    <div class="mt-2 ps-3" style="font-size:12px; font-weight:400">
      <p class="text-textColor">
        Begin adding content, and the Index will automatically populate here.
        This will help you easily navigate and organize your documentation as it
        grows.
      </p>
    </div>
  </div>
</div>

<style>
  .main-container {
    height: calc(100vh - 80px);
    background-color: var(--background-color);
  }

  .my-collection {
    padding: 20px;
  }

  .input-outline {
    border-radius: 0%;
  }
  textarea::placeholder {
    font-size: 12px;
    color: var(--text-color);
  }

  .input-outline:focus {
    outline: 2px solid var(--sparrow-blue);
  }
</style>
