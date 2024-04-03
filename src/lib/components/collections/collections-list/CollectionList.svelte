<script lang="ts">
  import doubleangleLeft from "$lib/assets/doubleangleLeft.svg";
  import doubleangleRight from "$lib/assets/doubleangleRight.svg";
  import SearchIcon from "$lib/assets/search.svelte";
  import filterIcon from "$lib/assets/filter.svg";
  import FilterIcon from "$lib/assets/filter.svelte";
  import plusIcon from "$lib/assets/plus.svg";
  import Collection from "./collection/Collection.svelte";
  import FilterDropDown from "$lib/components/dropdown/FilterDropDown.svelte";
  import RequestDropdown from "$lib/components/dropdown/RequestDropdown.svelte";
  import {
    collapseAnimationAppliedStore,
    collapsibleState,
    isApiCreatedFirstTime,
  } from "$lib/store/request-response-section";
  import SearchTree from "$lib/components/collections/collections-list/searchTree/SearchTree.svelte";
  import { useTree } from "./collectionList";
  import { v4 as uuidv4 } from "uuid";
  import { onDestroy } from "svelte";
  import {
    selectMethodsStore,
    selectedMethodsCollectionStore,
  } from "$lib/store/methods";

  import EmptyCollection from "./empty-collection/EmptyCollection.svelte";
  import {
    type CollectionDocument,
    type EnvironmentDocument,
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
  export let environments = [];
  export let runAnimation: boolean = false;
  export let refreshEnv;
  let isImportCollectionPopup = false;
  let isImportCurlPopup = false;
  export let changeAnimation: () => void;
  const _colllectionListViewModel = new CollectionListViewModel();
  const _workspaceViewModel = new HeaderDashboardViewModel();

  import { HeaderDashboardViewModel } from "$lib/components/header/header-dashboard/HeaderDashboard.ViewModel";
  import { username } from "$lib/store/auth.store";
  import { notifications } from "$lib/components/toast-notification/ToastNotification";
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  import EnvironmentDropdown from "$lib/components/dropdown/EnvironmentDropdown.svelte";
  import { environmentType } from "$lib/utils/enums/environment.enum";
  import { createCollectionSource } from "$lib/store/event-source.store";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import { Events } from "$lib/utils/enums/mixpanel-events.enum";
  import type { WorkspaceRole } from "$lib/utils/enums";
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import { generateSampleRequest } from "$lib/utils/sample";
  import ImportCollection from "../../collections/collections-list/import-collection/ImportCollection.svelte";
  import { workspaceLevelPermissions } from "$lib/utils/constants/permissions.constant";
  import { hasWorkpaceLevelPermission } from "$lib/utils/helpers/common.helper";
  import List from "$lib/components/list/List.svelte";
  import ImportCurl from "./import-curl/ImportCurl.svelte";

  const [, , searchNode] = useTree();
  let collection: any[];
  let currentWorkspaceId: string = "";
  let showfilterDropdown = false;
  let searchData: string = "";
  let userName: string = "";
  export let loggedUserRoleInWorkspace: WorkspaceRole;
  let isComponentRenderedFirstTime = false;
  let showDefault = false;
  let isLoading = true;
  const workspacesArr = _workspaceViewModel.workspaces;

  const usernameUnsubscribe = username.subscribe((value) => {
    if (value) {
      userName = value;
    }
  });

  let selectedApiMethods: string[] = [];
  let filteredSelectedMethodsCollection = [];
  let collapsExpandToggle: boolean = false;

  let collapseAnimationApplied: boolean = false;
  const collections: Observable<CollectionDocument[]> =
    _colllectionListViewModel.collection;
  const activeWorkspace: Observable<WorkspaceDocument> =
    collectionsMethods.getActiveWorkspace();
  let activeWorkspaceRxDoc: WorkspaceDocument;

  const mapCollectionsWithWorkspace = (_documents, _workspaceId) => {
    if (_documents) {
      const collectionArr = _documents
        .map((collectionDocument: CollectionDocument) => {
          const collectionObj =
            collectionsMethods.getCollectionDocument(collectionDocument);
          return collectionObj;
        })
        .filter((collectionDocument: CollectionDocument) => {
          return collectionDocument.workspaceId === _workspaceId;
        });
      collection = collectionArr;
    }
    if (searchData || selectedApiMethods.length > 0) {
      handleSearch();
    }
  };
  let collectionRxDoc = [];
  const collectionSubscribe = collections.subscribe(
    (value: CollectionDocument[]) => {
      collectionRxDoc = value;
      mapCollectionsWithWorkspace(collectionRxDoc, currentWorkspaceId);
    },
  );
  const workspaceUnsubscribe = workspacesArr.subscribe((workspaces) => {
    workspaces.map((workspace) => {
      if (workspace._data.isActiveWorkspace) {
        showDefault = true;
        if (workspace._data.collections && workspace._data.collections.length) {
          showDefault = false;
        }
        return;
      }
    });
  });
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
  let currentEnvironment;
  let trackWorkspaceId: string;
  const activeWorkspaceSubscribe = activeWorkspace.subscribe(
    async (value: WorkspaceDocument) => {
      activeWorkspaceRxDoc = value;
      if (activeWorkspaceRxDoc) {
        await refreshEnv(activeWorkspaceRxDoc?._id);
        const env: EnvironmentDocument =
          await collectionsMethods.currentEnvironment(
            activeWorkspaceRxDoc.get("environmentId"),
          );
        if (env) {
          currentEnvironment = env.toMutableJSON();
        } else {
          currentEnvironment = {
            name: "None",
            id: "none",
          };
        }
        if (isComponentRenderedFirstTime) {
          isLoading = true;
          isComponentRenderedFirstTime = false;
        }
        currentWorkspaceName = activeWorkspaceRxDoc?.name;
        currentWorkspaceId = activeWorkspaceRxDoc?._id;
        const workspaceId = activeWorkspaceRxDoc?._id;
        if (trackWorkspaceId !== workspaceId) {
          mapCollectionsWithWorkspace(collectionRxDoc, workspaceId);
          const response =
            await collectionsMethods.getAllCollections(workspaceId);
          if (response.isSuccessful && response.data.data) {
            const collections = response.data.data;
            isLoading = false;
            collections.forEach((element) => {
              element.workspaceId = workspaceId;
            });
            collectionsMethods.bulkInsert(collections);
          }
        }
        trackWorkspaceId = workspaceId;
      }
    },
  );

  const handleImportCollectionPopup = (flag: boolean) => {
    createCollectionSource.set("AddIcon");
    isImportCollectionPopup = flag;
  };
  let collectionSource = "";
  createCollectionSource.subscribe((value) => {
    collectionSource = value;
  });

  const handleImportCurlPopup = (flag: boolean) => {
    isImportCurlPopup = flag;
  };

  let collectionUnderCreation: boolean = false;
  const handleCreateCollection = async () => {
    showDefault = false;
    collectionUnderCreation = true;

    let tempActivePath = activePath;
    activePath = null;

    isCollectionCreatedFirstTime.set(true);
    let totalFolder: number = 0;
    let totalRequest: number = 0;
    const newCollection = {
      id: UntrackedItems.UNTRACKED + uuidv4(),
      name: getNextCollection(collection, "New collection"),
      items: [],
      createdAt: new Date().toISOString(),
    };

    const response = await _colllectionListViewModel.addCollection({
      name: newCollection.name,
      workspaceId: currentWorkspaceId,
    });

    if (response.isSuccessful && response.data.data) {
      const res = response.data.data;
      collectionsMethods.addCollection({
        ...res,
        id: res._id,
        workspaceId: currentWorkspaceId,
      });
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

      _workspaceViewModel.updateCollectionInWorkspace(currentWorkspaceId, {
        id: Samplecollection.id,
        name: newCollection.name,
      });
      notifications.success("New Collection Created");
      MixpanelEvent(Events.CREATE_COLLECTION, {
        source: collectionSource,
        collectionName: response.data.data.name,
        collectionId: response.data.data._id,
      });
      return;
    } else {
      activePath = tempActivePath;
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
    collapseAnimationApplied = true;
    changeAnimation();
    collapsExpandToggle = !collapsExpandToggle;
    collapsibleState.set(collapsExpandToggle);
    if (collapsExpandToggle) {
      document
        .getElementsByClassName("sidebar")[0]
        .classList.add("decrease-width");
      document
        .getElementsByClassName("sidebar")[0]
        .classList.remove("increase-width");
      collapseAnimationAppliedStore.set(true);
    } else {
      document
        .getElementsByClassName("sidebar")[0]
        .classList.add("increase-width");
      document
        .getElementsByClassName("sidebar")[0]
        .classList.remove("decrease-width");
      collapseAnimationAppliedStore.set(true);
    }
  };

  const addApiRequest = () => {
    isApiCreatedFirstTime.set(true);
    collectionsMethods.handleCreateTab(
      generateSampleRequest("UNTRACKED-" + uuidv4(), new Date().toString()),
    );
    moveNavigation("right");
    MixpanelEvent(Events.ADD_NEW_API_REQUEST, { source: "Side Panel TopBar" });
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

  let handleDropdown = (tabId: string) => {
    collectionsMethods.initActiveEnvironmentToWorkspace(
      currentWorkspaceId,
      tabId,
    );
  };

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
    workspaceUnsubscribe.unsubscribe();
  });

  const handleRequestClick = (id: string) => {
    if (id === "apiRequest") {
      addApiRequest();
    } else if (id === "importcURL") {
      isImportCurlPopup = true;
    } else {
      isImportCollectionPopup = true;
    }
  };

  let selectedView: string = "grid";
</script>

{#if collapsExpandToggle}
  <div>
    <button
      class="border-0 pb-5 angleRight"
      style="display: {collapsExpandToggle
        ? 'block'
        : 'none'};position: absolute;left:72px;top: 95px;width:16px;height:92px;z-index:{collapsExpandToggle
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
      <div
        style="transform: rotate(270deg);font-size:10px; color:var(--sparrow-text-color)"
        class="mt-3 ml-2"
      >
        Collections
      </div>
    </button>
  </div>
{/if}
{#if !collapsExpandToggle}
  <div
    style="border-right: {collapsExpandToggle
      ? '0px'
      : '1px solid #313233'};overflow:auto; width: {collapsExpandToggle
      ? '100%'
      : '100%'}"
    class={`sidebar overflow-y-auto  ${
      collapsExpandToggle && runAnimation
        ? "decrease-width"
        : runAnimation && " increase-width"
    } d-flex flex-column bg-backgroundColor scroll`}
  >
    <div
      class="d-flex justify-content-between align-items-center align-self-stretch ps-3 pe-3 pt-3"
    >
      <p class="mb-0 text-whiteColor ellipsis" style="font-size: 18px;">
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
    <div class="px-3 pt-2">
      <Dropdown
        dropdownId={"hash129"}
        data={[
          {
            name: "None",
            id: "none",
            type: environmentType.LOCAL,
          },
          ...environments,
        ].filter((elem) => {
          elem["dynamicClasses"] = "text-whiteColor";
          return elem.type === environmentType.LOCAL;
        })}
        additionalType={"environment"}
        onclick={handleDropdown}
        dropDownType={{ type: "text", title: currentEnvironment?.id }}
        staticClasses={[
          {
            id: "hash129-options-container",
            classToAdd: ["start-0", "end-0", "bg-backgroundDropdown"],
          },
        ]}
        hoverClasses={[
          {
            id: "hash129-btn-div",
            classToAdd: ["border-bottom", "border-labelColor"],
          },
        ]}
      ></Dropdown>
    </div>
    <div
      class="d-flex align-items-center justify-content-between ps-3 pe-3 pt-3 gap-2"
    >
      <div
        style="height:32px; "
        class="inputField w-100 bg-backgroundDark ps-2 pe-1 gap-2 d-flex align-items-center justify-content-center rounded"
      >
        <SearchIcon />
        <input
          type="search"
          style="  font-size: 12px;font-weight:500;"
          class="inputField searchField border-0 w-100 h-100 bg-backgroundDark"
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
          class="filter-btn btn bg-backgroundDark d-flex align-items-center justify-content-center p-2
        {showfilterDropdown ? 'filter-active' : ''}"
          style="width: 32px; height:32px; position:relative"
          on:click={handleFilterDropdown}
        >
          <!-- <img src={filterIcon} alt="" /> -->
          <FilterIcon width={300} height={30} color="gray" />
          {#if showfilterDropdown}
            <span
              class="position-absolute"
              style="right:4px; top:5px; height:4px; width:4px; background-color:#FF7878; border-radius: 50%;"
            />
          {/if}
        </button>
      </div>
      <div>
        <!-- <RequestDropdown
      <RequestDropdown
        {loggedUserRoleInWorkspace}
        {collectionsMethods}
        {handleCreateCollection}
        {collectionUnderCreation}
        {currentWorkspaceId}
      /> -->
        <Dropdown
          dropdownId={"collectionDropdown"}
          disabled={!hasWorkpaceLevelPermission(
            loggedUserRoleInWorkspace,
            workspaceLevelPermissions.ADD_COLLECTIONS,
          )}
          dropDownType={{ type: "img", title: plusIcon }}
          staticCustomStyles={[
            {
              id: "collectionDropdown-options-container",
              styleKey: "minWidth",
              styleValue: "160px",
            },
          ]}
          data={[
            {
              name: "Collection",
              id: "collection",
              dynamicClasses: "text-whiteColor",
            },
            {
              name: "API Request",
              id: "apiRequest",
              dynamicClasses: "text-whiteColor mt-1",
            },
            {
              name: "Import via cURL",
              id: "importcURL",
              dynamicClasses: "text-whiteColor mt-1",
            },
          ]}
          onclick={handleRequestClick}
          staticClasses={[
            {
              id: "collectionDropdown-img",
              classToAdd: ["btn", "bg-backgroundDark", "p-1", "rounded"],
            },
            {
              id: "collectionDropdown-options-container",
              classToAdd: ["end-0", "mt-1"],
            },
          ]}
        ></Dropdown>
      </div>
    </div>
    <div
      class="d-flex flex-column collections-list"
      style="overflow:hidden; margin-top:5px;"
    >
      <div class="d-flex flex-column justify-content-center">
        {#if false}
          <div class="spinner">
            <Spinner size={`32px`} />
          </div>
        {:else}
          {#if showfilterDropdown}
            <FilterDropDown {handleSearch} />
          {/if}
          {#if searchData.length > 0}
            <List height={"calc(100vh - 180px)"} classProps={"p-3"}>
              {#if filteredFile.length > 0}
                {#each filteredFile as exp}
                  <SearchTree
                    activeSync={exp.activeSync}
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
                    activeSync={exp.activeSync}
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
                    activeSync={exp.activeSync}
                    editable={true}
                    collectionId={exp.collectionId}
                    workspaceId={currentWorkspaceId}
                    explorer={exp.tree}
                    {searchData}
                  />
                {/each}
              {/if}
            </List>
          {:else if selectedApiMethods.length > 0}
            <List height={"calc(100vh - 180px)"} classProps={"p-3"}>
              {#each filteredSelectedMethodsCollection as col}
                <Collection
                  {loggedUserRoleInWorkspace}
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
            </List>
          {:else if collection && collection.length > 0}
            <List height={"calc(100vh - 180px)"} classProps={"p-3"}>
              {#each collection as col}
                <Collection
                  {loggedUserRoleInWorkspace}
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
            </List>
          {:else}
            <EmptyCollection
              {loggedUserRoleInWorkspace}
              {handleCreateCollection}
              {collectionsMethods}
              {currentWorkspaceId}
              {showDefault}
            />
          {/if}
        {/if}
        {#if searchData !== "" && !filteredCollection.length && !filteredFolder.length && !filteredFile.length}
          <span class="not-found-text mx-auto ellipsis">No results found</span>
        {/if}
      </div>
    </div>
  </div>
{/if}
{#if isImportCollectionPopup}
  <ImportCollection
    onClick={handleImportCollectionPopup}
    {handleCreateCollection}
    {currentWorkspaceId}
    {collectionsMethods}
  />
{/if}
{#if isImportCurlPopup}
  <ImportCurl onClick={handleImportCurlPopup} {collectionsMethods} />
{/if}

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
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
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
    border: 1px solid transparent;
  }
  .inputField:hover {
    border: 1px solid var(--workspace-hover-color);
  }
  /* 
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
  } */

  .decrease-width {
    animation: decreaseWidth 0.3s;
    /* width: 0; */
    /* max-width: 280px; */
  }
  .increase-width {
    animation: increaseWidth 0.3s;
    /* max-width: 280px; */
  }
  .spinner {
    width: 100%;
    height: 70vh;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }
  .searchField {
  }
  .filter-btn {
    /* border: 1px solid var(--border-color) !important; */
  }
  .filter-active {
    background-color: var(--send-button) !important;
  }
</style>
