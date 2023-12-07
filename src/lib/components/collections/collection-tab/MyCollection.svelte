<script lang="ts">
  import { onDestroy } from "svelte";

  import { CollectionService } from "$lib/services/collection.service";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import { currentCollectionWorkspaceId } from "$lib/store/collection";
  import { generateSampleRequest } from "$lib/utils/sample/request.sample";
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import { v4 as uuidv4 } from "uuid";
  import { UntrackedItems } from "$lib/utils/enums/item-type.enum";
  import { MyCollectionViewModel } from "./MyCollection.viewModel";
  import { collapsibleState } from "$lib/store/request-response-section";
  import type { NewTab } from "$lib/utils/interfaces/request.interface";
  import { notifications } from "$lib/utils/notifications";

  export let activeTab;
  export let collectionsMethods: CollectionsMethods;

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

  let currentWorkspaceCollectionName;
  const unsubscribecurrentCollectionWorkspaceId =
    currentCollectionWorkspaceId.subscribe((value) => {
      currentWorkspaceCollectionName = value;
    });

  const handleCollectionInput = (event) => {
    newCollectionName = event.target.value;


    collectionsMethods.updateTab(false, "save");
  };

  const modifyCollection = async () => {
    if (newCollectionName) {
      const updateCollectionName = await collectionService.updateCollectionData(
        componentData.path.collectionId,
        componentData.path.workspaceId,
        { name: newCollectionName },
      );

      tabName = updateCollectionName.data.data.name;

      collectionsMethods.updateCollection(
        componentData.path.collectionId,
        updateCollectionName.data.data,
      );

      collectionsMethods.updateTab(tabName, "name");
      collectionsMethods.updateTab(true, "save");

      Promise.resolve().then(() => {
        moveNavigation("right");
      });
    }

    if (newCollectionName === "") {
      notifications.error("Please enter text before save");
    }
    // handleTabUpdate({save:true,name},id)
  };

  const handleApiRequest = async () => {
    const request = generateSampleRequest(
      UntrackedItems.UNTRACKED + uuidv4(),
      new Date().toString(),
    );
    const requestObj = {
      collectionId: componentData.path.collectionId,
      workspaceId: componentData.path.workspaceId,
      items: {
        name: request.name,
        type: request.type,
        request: {
          method: request.property.request.method,
        },
      },
    };
    collectionsMethods.addRequestOrFolderInCollection(
      componentData.path.collectionId,
      {
        ...requestObj.items,
        id: request.id,
      },
    );
    const response = await _myColllectionViewModel.addRequest(requestObj);
    if (response.isSuccessful && response.data.data) {
      const res = response.data.data;
      collectionsMethods.updateRequestOrFolderInCollection(
        componentData.path.collectionId,
        request.id,
        res,
      );
      request.id = res.id;
      request.path.workspaceId = componentData.path.workspaceId;
      request.path.collectionId = componentData.path.collectionId;
      collectionsMethods.handleCreateTab(request);
      moveNavigation("right");
      return;
    }
  };

  let collapsExpandToggle: boolean = false;

  const collapsibleStateUnsubscribe = collapsibleState.subscribe((value) => {
    collapsExpandToggle = value;
  });

  onDestroy(() => {
    tabSubscribe();
    collapsibleStateUnsubscribe();
    unsubscribecurrentCollectionWorkspaceId();
  });
  onDestroy(() => {});

  let isClickOnEnter: boolean = false;
</script>

<div
  class="main-container d-flex"
  style="width:{collapsExpandToggle
    ? 'calc(100% - 104px)'
    : 'calc(100% - 384px)'};"
>
  <div
    class="my-workspace d-flex flex-column"
    style="width:{collapsExpandToggle
      ? 'calc(100% - 384px)'
      : 'calc(100% - 280px)'}; margin-top: 15px;"
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
              modifyCollection();
            }
          }}
        />
      </div>
      <button class="btn btn-primary border-0" on:click={handleApiRequest}
        >New Request</button
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
      class="mt-5 ps-2 text-whiteColor"
    >
      <p>Index</p>
    </div>
    <div class="mt-2 ps-2" style="font-size:12px; font-weight:400">
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
    position: fixed;

    height: 100vh;
    background-color: var(--background-color);
  }
  .my-workspace {
    padding: 20px;
  }

  .invite-btn {
    background-color: #1193f0;
    padding: 5px 20px;
    border-radius: 5px;
  }
</style>
