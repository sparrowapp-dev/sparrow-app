<script lang="ts">
  import doubleangleLeft from "$lib/assets/doubleangleLeft.svg";
  import doubleangleRight from "$lib/assets/doubleangleRight.svg";
  import searchIcon from "$lib/assets/search.svg";
  import filterIcon from "$lib/assets/filter.svg";
  import Folder from "./Folder.svelte";
  import FilterDropDown from "$lib/components/dropdown/FilterDropDown.svelte";
  import RequestDropdown from "$lib/components/dropdown/RequestDropdown.svelte";
  import { collapsibleState } from "$lib/store/request-response-section";
  import SearchTree from "$lib/components/collections/collections-list/searchTree/SearchTree.svelte";
  import { useTree } from "./collectionList";
  import { v4 as uuidv4 } from "uuid";
  import { onDestroy } from "svelte";
  import { slide } from "svelte/transition";
  import {
    selectMethodsStore,
    selectedMethodsCollectionStore,
  } from "$lib/store/methods";

  import DefaultCollection from "./DefaultCollection.svelte";
  import {
    type CollectionDocument,
    type WorkspaceDocument,
  } from "$lib/database/app.database";
  import { CollectionListViewModel } from "./CollectionList.ViewModel";
  import type { Observable } from "rxjs";

  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import { ItemType, UntrackedItems } from "$lib/utils/enums/item-type.enum";
  import type { Path } from "$lib/utils/interfaces/request.interface";
  import { generateSampleCollection } from "$lib/utils/sample/collection.sample";
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import { isCollectionCreatedFirstTime } from "$lib/store/collection";
  export let deleteCollectionData;
  export let collectionsMethods: CollectionsMethods;
  export let activeTabId: string;
  export let activePath;

  const _colllectionListViewModel = new CollectionListViewModel();
  const _workspaceViewModel = new HeaderDashboardViewModel();

  import { HeaderDashboardViewModel } from "$lib/components/header/header-dashboard/HeaderDashboard.ViewModel";
  import { username } from "$lib/store/auth.store";
  import { notifications } from "$lib/utils/notifications";

  const [, , searchNode] = useTree();
  let collection: any[] = [];
  let currentWorkspaceId: string = "";
  let showfilterDropdown = false;
  let searchData: string = "";
  let userName: string = "";

  const usernameUnsubscribe = username.subscribe((value) => {
    if (value) {
      userName = value;
    }
  });

  let selectedApiMethods: string[] = [];
  let filteredSelectedMethodsCollection = [];
  let collapsExpandToggle: boolean = false;

  const collections: Observable<CollectionDocument[]> =
    _colllectionListViewModel.collection;
  const activeWorkspace: Observable<WorkspaceDocument> =
    collectionsMethods.getActiveWorkspace();
  let activeWorkspaceRxDoc: WorkspaceDocument;

  const collectionSubscribe = collections.subscribe(
    (value: CollectionDocument[]) => {
      if (value) {
        const collectionArr = value.map(
          (collectionDocument: CollectionDocument) => {
            const collectionObj =
              collectionsMethods.getCollectionDocument(collectionDocument);
            return collectionObj;
          },
        );
        collection = collectionArr;
      }
      if (searchData || selectedApiMethods.length > 0) {
        handleSearch();
      }
    },
  );
  const selectedMethodUnsubscibe = selectMethodsStore.subscribe((value) => {
    if (value && value.length > 0) {
      selectedApiMethods = value;
    }
  });

  const selectedMethodsCollectionUnsubscribe =
    selectedMethodsCollectionStore.subscribe((value) => {
      if (value) {
        filteredSelectedMethodsCollection = value;
      }
    });

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
  let currentWorkspaceName: string;
  const activeWorkspaceSubscribe = activeWorkspace.subscribe(
    async (value: WorkspaceDocument) => {
      activeWorkspaceRxDoc = value;
      if (activeWorkspaceRxDoc) {
        currentWorkspaceName = activeWorkspaceRxDoc.get("name");
        currentWorkspaceId = activeWorkspaceRxDoc.get("_id");
        const workspaceId = activeWorkspaceRxDoc.get("_id");
        const response =
          await collectionsMethods.getAllCollections(workspaceId);
        if (response.isSuccessful && response.data.data) {
          const collections = response.data.data;
          collectionsMethods.bulkInsert(collections);
          return;
        }
      }
    },
  );
  let collectionUnderCreation: boolean = false;
  const handleCreateCollection = async () => {
    collectionUnderCreation = true;
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
      collectionUnderCreation = false;
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
      return;
    }
    return;
  };

  const handleFilterDropdown = () => {
    const filterBtn = document.getElementById("filter-btn");
    showfilterDropdown = !showfilterDropdown;
    filterBtn.style.backgroundColor = showfilterDropdown
      ? "#85C2FF"
      : "#000000";
    if (!showfilterDropdown) {
      selectMethodsStore.update(() => []);
      handleSearch();
    }
  };

  const collapsibleStateUnsubscribe = collapsibleState.subscribe((value) => {
    collapsExpandToggle = value;
  });

  const setcollapsExpandToggle = () => {
    collapsExpandToggle = !collapsExpandToggle;
    collapsibleState.set(collapsExpandToggle);

    if (collapsExpandToggle) {
      document
        .getElementsByClassName("sidebar")[0]
        .classList.add("decrease-width");
      document
        .getElementsByClassName("sidebar")[0]
        .classList.remove("increase-width");
    } else {
      document
        .getElementsByClassName("sidebar")[0]
        .classList.add("increase-width");
      document
        .getElementsByClassName("sidebar")[0]
        .classList.remove("decrease-width");
    }
  };

  let filteredCollection = [];
  let filteredFolder = [];
  let filteredFile = [];
  function handleSearch() {
    filteredCollection.length = 0;
    filteredFolder.length = 0;
    filteredFile.length = 0;
    searchNode(
      searchData,
      filteredCollection,
      filteredFolder,
      filteredFile,
      collection,
    );
  }

  onDestroy(() => {
    collapsibleStateUnsubscribe();
    selectedMethodsCollectionUnsubscribe();
    selectedMethodUnsubscibe();
  });

  const handleResize = () => {
    const windowWidth = window.innerWidth;

    if (windowWidth <= 800) {
      // Programmatically trigger a click on the button
      //@ts-ignore
      document.querySelector("#doubleAngleButton").click();
      collapsibleState.set(true);
    } else {
      collapsibleState.set(false);
    }
  };

  // Add a window resize event listener
  window.addEventListener("resize", handleResize);

  onDestroy(() => {
    // Remove the window resize event listener when the component is destroyed
    window.removeEventListener("resize", handleResize);
    collectionSubscribe.unsubscribe();
    collapsibleStateUnsubscribe();
    activeWorkspaceSubscribe.unsubscribe();
    usernameUnsubscribe();
  });

  let selectedView: string = "grid";
</script>

{#if collapsExpandToggle}
  <div>
    <button
      class="border-0 rounded pb-3 pe-1 angleRight"
      style="display: {collapsExpandToggle
        ? 'block'
        : 'none'};position: absolute;left:72px;top: 100px;width:16px;height:86px;z-index:{collapsExpandToggle
        ? '2'
        : '0'}"
      on:click={setcollapsExpandToggle}
    >
      <img
        src={doubleangleRight}
        alt="Expand"
        class="mb-4 mt-2"
        on:click={() => {
          selectedView = "grid";
        }}
        class:view-active={selectedView === "grid"}
      />
      <div style="transform: rotate(270deg);font-size:10px;" class="mt-3 mb-2">
        Collections
      </div>
    </button>
  </div>
{/if}

<div
  style="border-right: {collapsExpandToggle
    ? '0px'
    : '1px solid #313233'};overflow:auto"
  class={`sidebar ${
    collapsExpandToggle ? "decrease-width" : "increase-width"
  } d-flex flex-column bg-backgroundColor scroll`}
>
  <div
    class="d-flex justify-content-between align-items-center align-self-stretch ps-3 pe-3 pt-3"
  >
    <p class="mb-0 text-whiteColor" style="font-size: 18px;">
      {currentWorkspaceName || ""}
    </p>
    <button
      class=" border-0 rounded px-2 angleButton"
      on:click={setcollapsExpandToggle}
      id="doubleAngleButton"
    >
      <img
        src={doubleangleLeft}
        alt=""
        class="filter-green"
        on:click={() => {
          selectedView = "grid";
        }}
        class:view-active={selectedView === "grid"}
      />
    </button>
  </div>
  <div
    class="d-flex align-items-center justify-content-between ps-3 pe-3 pt-3 gap-2"
  >
    <div
      style="height:32px; width:180px "
      class="inputField bg-blackColor ps-2 pe-1 gap-2 d-flex align-items-center justify-content-center rounded"
    >
      <img src={searchIcon} alt="" />
      <input
        type="search"
        style="  font-size: 12px;font-weight:500;"
        class="inputField border-0 w-100 h-100 bg-blackColor"
        placeholder="Search APIs in {currentWorkspaceName || ''}"
        bind:value={searchData}
        on:input={() => {
          handleSearch();
        }}
      />
    </div>

    <div class="d-flex align-items-center justify-content-center">
      <button
        id="filter-btn"
        class="btn btn-blackColor d-flex align-items-center justify-content-center"
        style="width: 32px; height:32px; position:relative"
        on:click={handleFilterDropdown}
      >
        <img src={filterIcon} alt="" />
        {#if showfilterDropdown}
          <span
            class="position-absolute"
            style="right:4px; top:5px; height:4px; width:4px; background-color:#FF7878; border-radius: 50%;"
          />
        {/if}
      </button>
    </div>
    <div>
      <RequestDropdown
        {collectionsMethods}
        {handleCreateCollection}
        {collectionUnderCreation}
      />
    </div>
  </div>

  <div
    class="d-flex flex-column pt-3 ps-3 pe-3 collections-list pb-4"
    style="overflow:auto;margin-top:5px;"
  >
    <div class="d-flex flex-column justify-content-center">
      {#if showfilterDropdown}
        <FilterDropDown {handleSearch} />
      {/if}
      {#if searchData.length > 0}
        <div class="p-4 pt-0">
          {#if filteredFile.length > 0}
            {#each filteredFile as exp}
              <SearchTree
                editable={true}
                collectionId={exp.collectionId}
                workspaceId={currentWorkspaceId}
                path={exp.path}
                explorer={exp.tree}
                {searchData}
                folderDetails={exp.folderDetails}
              />
            {/each}
          {/if}
          {#if filteredFolder.length > 0}
            {#each filteredFolder as exp}
              <SearchTree
                editable={true}
                collectionId={exp.collectionId}
                workspaceId={currentWorkspaceId}
                explorer={exp.tree}
                {searchData}
              />
            {/each}
          {/if}
          {#if filteredCollection.length > 0}
            {#each filteredCollection as exp}
              <SearchTree
                editable={true}
                collectionId={exp.collectionId}
                workspaceId={currentWorkspaceId}
                explorer={exp.tree}
                {searchData}
              />
            {/each}
          {/if}
        </div>
      {:else if selectedApiMethods.length > 0}
        {#each filteredSelectedMethodsCollection as col}
          <Folder
            collectionList={collection}
            collectionId={col.id}
            {currentWorkspaceId}
            collection={col}
            title={col.name}
            {collectionsMethods}
            {activeTabId}
            {activePath}
          />
        {/each}
      {:else if collection.length > 0}
        {#each collection as col}
          <Folder
            collectionList={collection}
            collectionId={col.id}
            {currentWorkspaceId}
            collection={col}
            title={col.name}
            {collectionsMethods}
            {activeTabId}
            {activePath}
          />
        {/each}
      {:else if collection && collection.length === 0}
        <DefaultCollection {handleCreateCollection} {collectionsMethods} />
      {/if}
    </div>
  </div>
</div>

<style>
  .view-active {
    filter: invert(98%) sepia(99%) saturate(24%) hue-rotate(160deg)
      brightness(107%) contrast(100%);
  }

  .view-active:hover {
    filter: invert(100%) sepia(100%) saturate(14%) hue-rotate(212deg)
      brightness(104%) contrast(104%);
  }

  .angleRight {
    background-color: var(--blackColor);
  }
  .angleRight:hover {
    color: var(--blackColor);
    font-weight: 600;
    background-color: var(--workspace-hover-color);
  }

  .angleRight:active {
    color: var(--white-color);
    background-color: var(--button-pressed);
  }
  .angleButton {
    background-color: var(--background-color);
    cursor: pointer;
  }

  .angleButton:hover {
    background-color: var(--workspace-hover-color);
  }

  .angleButton:active {
    background-color: var(--button-pressed);
  }
  .sidebar {
    height: calc(100vh - 44px);
    overflow-y: auto;
  }
  .inputField {
    outline: none;
  }
  .inputField:hover {
    border: 1px solid var(--workspace-hover-color);
  }
  .collections-list::-webkit-scrollbar {
    width: 2px;
  }
  .collections-list::-webkit-scrollbar-thumb {
    background: #888;
  }

  @keyframes increaseWidth {
    0% {
      width: 0;
    }

    100% {
      width: 280px;
    }
  }
  @keyframes decreaseWidth {
    0% {
      width: 280px;
    }
    100% {
      width: 0px;
    }
  }

  .decrease-width {
    animation: decreaseWidth 0.3s;
    width: 0;
    max-width: 280px;
  }
  .increase-width {
    animation: increaseWidth 0.3s;
    max-width: 280px;
  }
</style>
