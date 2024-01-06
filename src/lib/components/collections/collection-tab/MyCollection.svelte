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

  export let loaderColor = "default";
  export let activeTab;
  export let collectionsMethods: CollectionsMethods;
  export let _collectionListViewModel: CollectionListViewModel;
  const collections: Observable<CollectionDocument[]> =
    _collectionListViewModel.collection;
  let isLoading: boolean = false;
  let activeTabId: string;

  let tabName: string = "";
  let componentData: NewTab;
  let totalFolder: number = 0;
  let totalRequest: number = 0;
  let newCollectionName: string = "";
  const _myColllectionViewModel = new MyCollectionViewModel();

  const tabSubscribe = activeTab.subscribe(async (event: NewTab) => {
    if (event) {
      tabName = event?.name;
      componentData = event;
      activeTabId = event.id;
    }
  });
  const collectionSubscribe = collections.subscribe(
    (collectionArr: CollectionDocument[]) => {
      if (collectionArr) {
        collectionArr.forEach(async (collection) => {
          if (collection._data.id === activeTabId) {
            const collectionData =
              await collectionsMethods.getNoOfApisandFolders(collection);
            totalRequest = collectionData.requestCount;
            totalFolder = collectionData.folderCount;
            return;
          }
        });
      }
    },
  );

  const handleCollectionInput = (event) => {
    newCollectionName = event.target.value;
    collectionsMethods.updateTab(
      false,
      "save",
      componentData.path.collectionId,
    );
  };

  const onRenameBlur = async () => {
    await _myColllectionViewModel.modifyCollection(
      componentData,
      newCollectionName,
      collectionsMethods,
      tabName,
    );
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
  });
  onDestroy(() => {});
  let autofocus = isCollectionNameVisibility;

  let inputElement;

  onMount(() => {
    // When autofocus is true, select the text in the input element
    if (autofocus) {
      inputElement.select();
    }
  });

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
    <div class="d-flex aling-items-center justify-content-between gap-2 mb-4">
      <input
        type="text"
        required
        {autofocus}
        maxlength={100}
        id="renameInputFieldCollection"
        value={tabName}
        class="bg-backgroundColor input-outline form-control border-0 text-left w-100 ps-2 py-0 fs-5"
        on:input={(event) => {
          handleCollectionInput(event);
        }}
        on:blur={onRenameBlur}
        on:keydown={onRenameInputKeyPress}
        bind:this={inputElement}
      />

      <button
        class="btn w-25 btn-primary rounded border-0 text-align-right py-1"
        on:click={handleApiRequest}>New Request</button
      >
    </div>

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
        type="text"
        style="font-size: 12px; "
        class="form-control bg-backgroundColor border-0 text-textColor fs-6 h-50 input-outline"
        placeholder="Describe the collection. Add code examples and tips for your team to effectively use the APIs."
      />
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
