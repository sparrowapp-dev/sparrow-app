<script lang="ts">
  import about from "$lib/assets/about.svg";
  import collectionss from "$lib/assets/collections.svg";
  import apiRequest from "$lib/assets/apiRequest.svg";
  import { v4 as uuidv4 } from "uuid";
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import { generateSampleRequest } from "$lib/utils/sample/request.sample";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import { generateSampleWorkspace } from "$lib/utils/sample/workspace.sample";
  import { CollectionListViewModel } from "$lib/components/collections/collections-list/CollectionList.ViewModel";
  const _colllectionListViewModel = new CollectionListViewModel();
  import { ItemType, UntrackedItems } from "$lib/utils/enums/item-type.enum";
  import type { Path } from "$lib/utils/interfaces/request.interface";
  import { generateSampleCollection } from "$lib/utils/sample/collection.sample";
  import type {
    CollectionDocument,
    WorkspaceDocument,
  } from "$lib/database/app.database";
  import type { Observable } from "rxjs";
  import { onDestroy } from "svelte";
  import { isCollectionCreatedFirstTime } from "$lib/store/collection";
  import { isApiCreatedFirstTime } from "$lib/store/request-response-section";
  import { HeaderDashboardViewModel } from "$lib/components/header/header-dashboard/HeaderDashboard.ViewModel";
  import { notifications } from "$lib/utils/notifications";
  import ImportCollection from "$lib/components/collections/collections-list/ImportCollection.svelte";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import { createCollectionSource } from "$lib/store/event-source.store";
  import { Events } from "$lib/utils/enums/mixpanel-events.enum";
  export let collectionsMethods: CollectionsMethods;

  const collections: Observable<CollectionDocument[]> =
    _colllectionListViewModel.collection;

  let collection: any[] = [];
  let currentWorkspaceId: string = "";
  const activeWorkspace: Observable<WorkspaceDocument> =
    collectionsMethods.getActiveWorkspace();
  let activeWorkspaceRxDoc: WorkspaceDocument;
  const _workspaceViewModel = new HeaderDashboardViewModel();

  const collectionSubscribe = collections.subscribe(
    (value: CollectionDocument[]) => {
      if (value && value.length > 0) {
        const collectionArr = value.map(
          (collectionDocument: CollectionDocument) => {
            const collectionObj =
              collectionsMethods.getCollectionDocument(collectionDocument);
            return collectionObj;
          },
        );
        collection = collectionArr;
      }
    },
  );

  const getNextCollection: (list: any[], name: string) => any = (
    list,
    name,
  ) => {
    const isNameAvailable: (proposedName: string) => boolean = (
      proposedName,
    ) => {
      return list.some((element) => {
        return element.name === proposedName;
      });
    };

    if (!isNameAvailable(name)) {
      return name;
    }

    for (let i = 2; i < list.length + 10; i++) {
      const proposedName: string = `${name}${i}`;
      if (!isNameAvailable(proposedName)) {
        return proposedName;
      }
    }

    return null;
  };

  let collectionSource = "";
  createCollectionSource.subscribe((value) => {
    collectionSource = value;
  });

  let currentWorkspaceName: string;
  const activeWorkspaceSubscribe = activeWorkspace.subscribe(
    async (value: WorkspaceDocument) => {
      activeWorkspaceRxDoc = value;
      if (activeWorkspaceRxDoc) {
        currentWorkspaceName = activeWorkspaceRxDoc.get("name");
        currentWorkspaceId = activeWorkspaceRxDoc.get("_id");
      }
    },
  );

  const handleCreateCollection = async () => {
    isCollectionCreatedFirstTime.set(true);

    let totalFolder: number = 0;
    let totalRequest: number = 0;
    const newCollection = {
      id: UntrackedItems.UNTRACKED + uuidv4(),
      name: getNextCollection(collection, "New collection"),
      items: [],
      createdAt: new Date().toISOString(),
    };

    collectionsMethods.addCollection(newCollection);
    const response = await _colllectionListViewModel.addCollection({
      name: newCollection.name,
      workspaceId: currentWorkspaceId,
    });

    if (response.isSuccessful && response.data.data) {
      const res = response.data.data;

      let path: Path = {
        workspaceId: currentWorkspaceId,
        collectionId: response.data.data._id,
      };
      const Samplecollection = generateSampleCollection(
        response.data.data._id,
        new Date().toString(),
      );

      response.data.data.items.map((item) => {
        if (item.type === ItemType.REQUEST) {
          totalRequest++;
        } else {
          totalFolder++;
          totalRequest += item.items.length;
        }
      });

      Samplecollection.id = response.data.data._id;
      Samplecollection.path = path;
      Samplecollection.name = response.data.data.name;
      Samplecollection.property.collection.requestCount = totalRequest;
      Samplecollection.property.collection.folderCount = totalFolder;
      Samplecollection.save = true;
      collectionsMethods.handleCreateTab(Samplecollection);
      moveNavigation("right");

      collectionsMethods.updateCollection(newCollection.id, res);
      _workspaceViewModel.updateCollectionInWorkspace(currentWorkspaceId, {
        id: Samplecollection.id,
        name: newCollection.name,
      });
      notifications.success("New Collection Created");
      MixpanelEvent(Events.CREATE_COLLECTION, {
        source: collectionSource,
        collectionName: res.data.data.name,
        collectionId: res.data.data._id,
      });
      return;
    }
    return;
  };

  let isImportCollectionPopup: boolean = false;
  const handleImportCollectionPopup = (flag) => {
    createCollectionSource.set("ClosedTabView");
    isImportCollectionPopup = flag;
  };
  const handleWorkspaceClick = async () => {
    const workspace = generateSampleWorkspace(
      currentWorkspaceId,
      new Date().toString(),
      currentWorkspaceName,
    );
    workspace.path.workspaceId = currentWorkspaceId;
    workspace.name = currentWorkspaceName;
    collectionsMethods.handleCreateTab(workspace);
    moveNavigation("right");
  };

  onDestroy(() => {
    collectionSubscribe.unsubscribe();
    activeWorkspaceSubscribe.unsubscribe();
  });
</script>

{#if isImportCollectionPopup}
  <ImportCollection
    onClick={handleImportCollectionPopup}
    {handleCreateCollection}
    {currentWorkspaceId}
    {collectionsMethods}
  />
{/if}

<div class="main-container">
  <div class="header-container">
    <h1 class="main-container-header">Check this Workspace's documentation</h1>
    <button
      class="about-btn"
      on:click={() => {
        handleWorkspaceClick();
      }}
    >
      <img src={about} alt="" style="font-size: 12px;" />
      About My Workspace</button
    >
  </div>
  <div class="create-container">
    <h1 class="create-container-header">Create New</h1>
    <div class="create-container-button">
      <button
        class="create-container-btn"
        on:click={() => {
          isApiCreatedFirstTime.set(true);

          collectionsMethods.handleCreateTab(
            generateSampleRequest(
              "UNTRACKED-" + uuidv4(),
              new Date().toString(),
            ),
          );
          moveNavigation("right");
          MixpanelEvent(Events.ADD_NEW_API_REQUEST, {
            source: "ClosedTabView",
          });
        }}
      >
        <img src={apiRequest} alt="" style="width: 20px;" />
        API Request</button
      >
      <button
        class="create-container-btn"
        on:click={() => {
          handleImportCollectionPopup(true);
        }}
      >
        <img src={collectionss} alt="" style="width: 26px;" />
        Collection</button
      >
    </div>
  </div>
</div>

<style>
  .main-container {
    height: calc(100vh - 80px);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 20px;
  }
  .header-container,
  .create-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 10px;
  }
  .create-container {
    margin-top: 35px;
  }

  .main-container-header,
  .create-container-header {
    font-size: 15px;
    color: gray;
  }
  .about-btn {
    display: flex;
    width: 150px;
    align-items: center;
    background-color: #313233;
    justify-content: space-around;
    font-size: 12px;
    padding: 8px 8px;
    border: none;
    border-radius: 4px;
  }
  .create-container-button {
    display: flex;
    justify-content: space-between;
    gap: 40px;
  }
  .create-container-btn {
    width: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: none;
    border: 1px solid #313233;
    border-radius: 10px;
    font-size: 12px;
    padding: 20px;
    height: 77px;
  }
</style>
