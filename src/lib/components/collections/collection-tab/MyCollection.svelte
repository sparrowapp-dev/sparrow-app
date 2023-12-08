<script lang="ts">
  import { onDestroy } from "svelte";

  import { CollectionService } from "$lib/services/collection.service";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";

  import { MyCollectionViewModel } from "./MyCollection.viewModel";
  import { collapsibleState } from "$lib/store/request-response-section";
  import type { NewTab } from "$lib/utils/interfaces/request.interface";
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  export let loaderColor = "default";
  export let activeTab;
  export let collectionsMethods: CollectionsMethods;
  let isLoading: boolean = false;

  let tabName: string = "";
  let componentData: NewTab;
  const collectionService = new CollectionService();
  let totalFolder: number = 0;
  let totalRequest: number = 0;
  let newCollectionName: string = "";
  const _myColllectionViewModel = new MyCollectionViewModel();

  const tabSubscribe = activeTab.subscribe((event: NewTab) => {
    tabName = event?.name;
    componentData = event;
    totalRequest = event?.property?.collection?.requestCount;
    totalFolder = event?.property?.collection?.folderCount;
  });

  const handleCollectionInput = (event) => {
    newCollectionName = event.target.value;
    collectionsMethods.updateTab(
      false,
      "save",
      componentData.path.collectionId,
    );
  };

  const modifyCollectionData = async () => {
    await _myColllectionViewModel.modifyCollection(
      componentData,
      newCollectionName,
      collectionsMethods,
      tabName,
    );
  };

  const handleApiRequest = async () => {
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

  onDestroy(() => {
    tabSubscribe();
    collapsibleStateUnsubscribe();
  });
  onDestroy(() => {});

  let isClickOnEnter: boolean = false;
</script>

<div class="main-container d-flex">
  <div
    class="my-workspace d-flex flex-column"
    style="width:calc(100% - 280px); margin-top: 15px;"
  >
    <div class="d-flex align-items-center w-100 justify-content-between mb-4">
      <div class="d-flex align-items-center justify-content-start w-50">
        <input
          type="text"
          required
          value={tabName}
          class="form-control text-center bg-backgroundColor"
          on:input={(event) => {
            handleCollectionInput(event);
          }}
          on:keydown={(event) => {
            if (event.key === "Enter") {
              isClickOnEnter = true;
              modifyCollectionData();
            }
          }}
        />
      </div>
      <button
        class="d-flex align-items-center justify-content-center btn btn-primary text-whiteColor"
        style="font-size: 15px;font-weight:400"
        on:click={handleApiRequest}
        >{#if isLoading}
          <span
            class="me-1 ms-0 d-flex align-item-center justify-content-start"
          >
            {#if loaderColor === "default"}
              <Spinner size={"8px"} />
            {/if}
          </span>
        {/if}New Request</button
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
    <div class="d-flex align-items-start ps-0">
      <input
        type="text"
        style="font-size: 12px; "
        class="form-control bg-backgroundColor border-0 text-textColor"
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

  .my-workspace {
    padding: 20px;
  }

  .btn-primary {
    background-color: var(--send-button);
  }
</style>
