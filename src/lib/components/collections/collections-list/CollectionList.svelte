<script lang="ts">
  import doubleangleLeft from "$lib/assets/doubleangleLeft.svg";
  import doubleangleRight from "$lib/assets/doubleangleRight.svg";

  import searchIcon from "$lib/assets/search.svg";
  import filterIcon from "$lib/assets/filter.svg";
  import Folder from "./Folder.svelte";
  import RequestDropdown from "$lib/components/dropdown/RequestDropdown.svelte";

  import { collapsibleState } from "$lib/store/request-response-section";

  import { fetchCollection, insertCollection } from "$lib/services/collection";
  import SearchTree from "$lib/components/collections/collections-list/searchTree/SearchTree.svelte";
  import {
    collectionList,
    setCollectionList,
    useCollectionTree,
  } from "$lib/store/collection";
  import { useTree } from "./collectionList";
  import type { CreateCollectionPostBody } from "$lib/utils/dto";
  const { insertHead, updateHeadId } = useCollectionTree();
  const [, , searchNode] = useTree();
  import { v4 as uuidv4 } from "uuid";
  import { currentWorkspace } from "$lib/store/workspace.store";
  import { onDestroy } from "svelte";
  import Collection from "$lib/components/file-types/collection/Collection.svelte";
  import DefaultCollection from "./DefaultCollection.svelte";
  import { rxdb, type CollectionDocument, type WorkspaceDocument } from "$lib/database/app.database";
    import { CollectionViewModel } from "./Collection.ViewModel";
    import { user } from "$lib/store/auth.store";
    import type { Observable } from "rxjs";
    import { HeaderDashboardViewModel } from "$lib/components/header/header-dashboard/HeaderDashboard.ViewModel";

  let collection: any[]=[];
  let currentWorkspaceId: string = "";
  const _colllectionViewModel = new CollectionViewModel();
  const _workspaceViewModel= new HeaderDashboardViewModel(); 
  const collections : Observable<CollectionDocument[]> = _colllectionViewModel.collection;
  const activeWorkspace : Observable<WorkspaceDocument> = _workspaceViewModel.activeWorkspace;
  let activeWorkspaceRxDoc: WorkspaceDocument;
  let getCollectionData = async (id: string) => {
    const res = await fetchCollection(id);
    if (res.isSuccessful) {
      setCollectionList(res.data.data);
    }
  };

  
  const collectionSubscribe = collections.subscribe(
    (value: CollectionDocument[]) => {
      if (value && value.length > 0) {
         const collectionArr=value.map((collectionDocument:CollectionDocument)=>{
           const collectionObj=_colllectionViewModel.getDocument(collectionDocument);
           return collectionObj; 
         })
         collection=collectionArr;
        }
      }
  );
  let currentWorkspaceName = "";

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

  const activeWorkspaceSubscribe = activeWorkspace.subscribe(
    async (value: WorkspaceDocument) => {
      activeWorkspaceRxDoc = value;
      if(activeWorkspaceRxDoc){
        const workspaceId=activeWorkspaceRxDoc.get("_id");
        const response=await _colllectionViewModel.getAllCollections(workspaceId);
        if(response.isSuccessful && response.data.data.length>0){
          const collections=response.data.data;
          _colllectionViewModel.bulkInsert(collections);
            return
        }
        
      }
    
    },
  );
  const handleCreateCollection = async () => {
    const newCollection={
      _id:uuidv4(),
      name:getNextCollection(collection,"New collection"),
      workspaceId:currentWorkspaceId,
      items:[],
    }
    collection=[...collection,newCollection];
    _colllectionViewModel.addCollection(newCollection)
    return;
  };


  const currentWorkspaceUnsubscribe = currentWorkspace.subscribe((value) => {
    if (value.id && value.name) {
      getCollectionData(value.id);
      currentWorkspaceName = value.name;
      currentWorkspaceId = value.id;
    }
  });

  let collapsExpandToggle: boolean = false;

  const collapsibleStateUnsubscribe = collapsibleState.subscribe((value) => {
    collapsExpandToggle = value;
  });

  const setcollapsExpandToggle = () => {
    collapsExpandToggle = !collapsExpandToggle;
    collapsibleState.set(collapsExpandToggle);
  };

  let searchData: string = "";
  let filteredCollection = [];
  let filteredFolder = [];
  let filteredFile = [];
  const handleSearch = () => {
    filteredCollection.length = 0;
    filteredFolder.length = 0;
    filteredFile.length = 0;
    searchNode(searchData, filteredCollection, filteredFolder, filteredFile);
  };

  onDestroy(currentWorkspaceUnsubscribe);
  onDestroy(collapsibleStateUnsubscribe);

  const handleResize = () => {
    const windowWidth = window.innerWidth;

    if (windowWidth <= 800) {
      // Programmatically trigger a click on the button
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
  });
</script>

{#if collapsExpandToggle}
  <div>
    <button
      class="bg-blackColor border-0 rounded pb-3 pe-1"
      style="display: {collapsExpandToggle
        ? 'block'
        : 'none'};position: absolute;left:72px;top: 100px;width:16px;height:86px;z-index:{collapsExpandToggle
        ? '2'
        : '0'}"
      on:click={setcollapsExpandToggle}
    >
      <img src={doubleangleRight} alt="Expand" class="mb-4 mt-2" />
      <div style="transform: rotate(270deg);font-size:10px;" class="mt-3 mb-2">
        Collections
      </div>
    </button>
  </div>
{/if}

<div
  style="width:{collapsExpandToggle
    ? '0px'
    : '280px'};border-right: {collapsExpandToggle
    ? '0px'
    : '1px solid #313233'};"
  class="sidebar d-flex flex-column bg-backgroundColor scroll"
>
  <div
    class="d-flex justify-content-between align-items-center align-self-stretch ps-3 pe-3 pt-3"
  >
    <p class="mb-0 text-whiteColor" style="font-size: 18px;">
      {currentWorkspaceName}
    </p>
    <button
      class="bg-backgroundColor border-0"
      on:click={setcollapsExpandToggle}
      id="doubleAngleButton"
    >
      <img src={doubleangleLeft} alt="" />
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
        placeholder="Search APIs in {currentWorkspaceName}"
        bind:value={searchData}
        on:input={handleSearch}
      />
    </div>

    <div class="d-flex align-items-center justify-content-center">
      <button
        class="btn btn-blackColor d-flex align-items-center justify-content-center"
        style="width: 32px; height:32px;"
      >
        <img src={filterIcon} alt="" />
      </button>
    </div>
    <div>
      <RequestDropdown handleCreateCollection={handleCreateCollection}></RequestDropdown>
      
    </div>
    

  </div>

  <div class="d-flex flex-column pt-3" style="overflow:auto;margin-top:5px;">
    <div class="d-flex flex-column justify-content-center">
      {#if searchData.length > 0}
        <div class="p-4 pt-0">
          {#if filteredFile.length > 0}
            <p class="my-2">API Requests</p>
            <hr class="mt-0 mb-1" />
            {#each filteredFile as exp}
              <SearchTree
                editable={true}
                collectionId={exp.collectionId}
                workspaceId={currentWorkspaceId}
                path={exp.path}
                explorer={exp.tree}
              />
            {/each}
          {/if}
          {#if filteredFolder.length > 0}
            <p class="my-2">Folders</p>
            <hr class="mt-0 mb-1" />
            {#each filteredFolder as exp}
              <SearchTree
                editable={true}
                collectionId={exp.collectionId}
                workspaceId={currentWorkspaceId}
                explorer={exp.tree}
              />
            {/each}
          {/if}
          {#if filteredCollection.length > 0}
            <p class="my-2">Collections</p>
            <hr class="mt-0 mb-1" />
            {#each filteredCollection as exp}
              <SearchTree
                editable={true}
                collectionId={exp.collectionId}
                workspaceId={currentWorkspaceId}
                explorer={exp.tree}
              />
            {/each}
          {/if}
        </div>
      {:else}
      {#if collection.length > 0}
        {#each collection as col}
          <Folder
            collectionList={collection}
            collectionId={col._id}
            {currentWorkspaceId}
            collection={col}
            title={col.name}
          />
        {/each}
        {:else}
          <DefaultCollection></DefaultCollection>
        {/if}
      {/if}
    </div>
  </div>
</div>

<style>
.sidebar {
 position: fixed;
 top: 44px;
 left: 72px;
 height: calc(100vh - 44px);
 overflow-y:auto;
}
.inputField{
  outline:none
}
</style>
