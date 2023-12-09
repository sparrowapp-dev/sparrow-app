<script lang="ts">
  import tickMark from "$lib/assets/tickMark.svg";
  import collectionsIcon from "$lib/assets/collections.svg";
  import workspacesIcon from "$lib/assets/workspaces.svg";
  import FolderIcon from "$lib/assets/folder.svg";
  import RequestIcon from "$lib/assets/apiRequest.svg";
  import { getMethodStyle } from "$lib/utils/helpers/conversion.helper";
  import { onMount } from "svelte";
  import { replaceSlashWithGreaterThanSymbol } from "$lib/utils/helpers/common.helper";
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import { generateSampleRequest } from "$lib/utils/sample/request.sample";
  import { ItemType } from "$lib/utils/enums/item-type.enum";
  import { generateSampleCollection } from "$lib/utils/sample/collection.sample";
  let container;
  export let handleGlobalSearchPopup;
  export let searchData;
  export let filteredRequest: any[];
  export let filteredFolder: any[];
  export let filteredCollection: any[];
  export let workspaces: any[];
  export let _collectionMethods;
  export let activeWorkspaceId;
  export let _viewModel;
  export let handleDropdown;
  console.log("fill",filteredRequest);
  let currentSelectedId = "all";
  function onWindowClick(e) {
    // !REMOVE
    // if (container.contains(e.target) === false) {
    //   handleGlobalSearchPopup(false);
    // }
  }


  function getIndex(text: string, searchData: string): number {
    return text.toLowerCase().indexOf(searchData.toLowerCase());
  }

  function handleSelection(id: string) {
    const previousSelectedButton = document.getElementById(
      currentSelectedId,
    ) as HTMLButtonElement;
    previousSelectedButton.style.backgroundColor = "transparent";
    const newSelectedButton = document.getElementById(id) as HTMLButtonElement;
    newSelectedButton.style.backgroundColor = "#313233";
    currentSelectedId = id;
  }
  onMount(() => {
    const button = document.getElementById(
      currentSelectedId,
    ) as HTMLButtonElement;
    button.style.backgroundColor = "#313233";
  });

  const handleWorkspaceClick=(id:string,name:string)=>{
    handleDropdown(id,name)
    handleGlobalSearchPopup(false);
  }
  const handleRequestClick=(req:any,path:any)=>{
    const request = generateSampleRequest(req.id, new Date().toString());
      request.path = path;
      request.name = req.name;
      if(req.description)
      request.description = req.description;
      if(req.request.url)
      request.property.request.url = req.request.url;
      if(req.request.body)
      request.property.request.body = req.request.body; 
      if(req.request.method)
      request.property.request.method = req.request.method;
      if(req.request.queryParams)
      request.property.request.queryParams = req.request.queryParams;
      if(req.request.headers)
      request.property.request.headers = req.request.headers;
      request.save = true;
      _collectionMethods.handleCreateTab(request);
      moveNavigation("right");
      handleGlobalSearchPopup(false);
  }
  const handleCollectionClick = (collection:any,currentWorkspaceId:string,collectionId:string) => {
    let totalFolder: number = 0;
    let totalRequest: number = 0;
    collection.items.map((item) => {
      if (item.type === ItemType.REQUEST) {
        totalRequest++;
      } else {
        totalFolder++;
        totalRequest += item.items.length;
      }
    });

    let path= {
      workspaceId: currentWorkspaceId,
      collectionId,
    };

    const Samplecollection = generateSampleCollection(
      collectionId,
      new Date().toString(),
    );

    Samplecollection.id = collectionId;
    Samplecollection.path = path;
    Samplecollection.name = collection.name;
    Samplecollection.property.collection.requestCount = totalRequest;
    Samplecollection.property.collection.folderCount = totalFolder;
    Samplecollection.save = true;
    _collectionMethods.handleCreateTab(Samplecollection);
    moveNavigation("right");
    handleGlobalSearchPopup(false);

  };

</script>

<!-- <svelte:window on:click={onWindowClick} /> -->
<div class="container" bind:this={container}>
  <div class="workspace-options-container">
    <button
      id="all"
      class="workspace-options option selected"
      on:click={(event) => {
        handleSelection("all");
      }}
    >
      <img src={tickMark} alt="tickMark" />
      <span>All</span>
    </button>
    <button
      id="workspace"
      class="workspace-options option"
      on:click={() => {
        handleSelection("workspace");
      }}
    >
      <img src={workspacesIcon} alt="workspaces" style="margin-left: -6px;" />
      <span>Workspaces</span>
    </button>
    <button
      id="collection"
      class="workspace-options option"
      on:click={() => {
        handleSelection("collection");
      }}
    >
      <img src={collectionsIcon} alt="collections" style="margin-left: -6px;" />
      <span>Collections</span>
    </button>
    <button
      id="folder"
      class="workspace-options option"
      on:click={() => {
        handleSelection("folder");
      }}
    >
      <img src={FolderIcon} alt="folder" />
      <span>Folder</span>
    </button>
    <button
      id="request"
      class="workspace-options option"
      on:click={() => {
        handleSelection("request");
      }}
    >
  
      <img src={RequestIcon} alt="request" />
      <span>Request</span>
    </button>
  </div>
  <div class="search-options-container">
    {#if searchData.length > 0}
      {#if filteredRequest.length > 0 && (currentSelectedId === "all" || currentSelectedId === "request")}
        {#each filteredRequest as filterRequest}
        <div class="request" on:click={()=>{handleRequestClick(filterRequest.tree,{workspaceId: activeWorkspaceId,
           collectionId:filterRequest.collectionId,
          folderId:filterRequest.folderDetails?filterRequest.folderDetails.id:{},
          folderName:filterRequest.folderDetails?filterRequest.folderDetails.name:{}})}}>
          <div
            class="d-flex align-items-center search-option-request"
            style="height:32px;"
          >
            <div
              class="api-method text-{getMethodStyle(
                filterRequest.tree.request.method,
              )}"
            >
              {filterRequest.tree.request.method.toUpperCase()}
            </div>
            <div class="api-name">
              {filterRequest.tree.name.substring(
                0,
                getIndex(filterRequest.tree.name, searchData),
              )}<span class="highlight"
                >{filterRequest.tree.name.substring(
                  getIndex(filterRequest.tree.name, searchData),
                  getIndex(filterRequest.tree.name, searchData) +
                    searchData.length,
                )}</span
              >{filterRequest.tree.name.substring(
                getIndex(filterRequest.tree.name, searchData) +
                  searchData.length,
              )}
            </div>
          </div>
          <div class="api-path">
            <span>{filterRequest.path?replaceSlashWithGreaterThanSymbol(filterRequest.path):""}</span>
          </div>
        </div>
        {/each}
      {/if}
      {#if filteredFolder.length > 0 && (currentSelectedId === "all" || currentSelectedId === "folder")}
        {#each filteredFolder as filterFolder}
        <div class="request">
          <div
            style="height:36px;"
            class="d-flex align-items-center search-option-request"
          >
            <img src={FolderIcon} alt="" style="height:16px; width:16px;" />
            <span
              style=" padding-left: 8px; cursor:pointer; font-size:14px; font-weight:400;color:#999999"
              >{filterFolder.tree.name.substring(
                0,
                getIndex(filterFolder.tree.name, searchData),
              )}<span class="highlight"
                >{filterFolder.tree.name.substring(
                  getIndex(filterFolder.tree.name, searchData),
                  getIndex(filterFolder.tree.name, searchData) +
                    searchData.length,
                )}</span
              >{filterFolder.tree.name.substring(
                getIndex(filterFolder.tree.name, searchData) +
                  searchData.length,
              )}
            </span>
          </div>
          <div class="api-path">
            <span>{filterFolder.path?replaceSlashWithGreaterThanSymbol(filterFolder.path):""}</span>
          </div>
        </div>
        {/each}
      {/if}
      {#if filteredCollection.length > 0 && (currentSelectedId === "all" || currentSelectedId === "collection")}
        {#each filteredCollection as filterCollection}
        <div class="request" on:click={()=>{handleCollectionClick(filterCollection.tree,filterCollection.tree._id,activeWorkspaceId)}}>
          <div
            style="height:36px;"
            class="d-flex align-items-center search-option-request"
          >
            <img
              src={collectionsIcon}
              alt=""
              style="height:20px; width:20px;"
            />
            <span
              style=" padding-left: 8px; cursor:pointer; font-size:14px; font-weight:400;color:#999999"
              >{filterCollection.tree.name.substring(
                0,
                getIndex(filterCollection.tree.name, searchData),
              )}<span class="highlight">
                {filterCollection.tree.name.substring(
                  getIndex(filterCollection.tree.name, searchData),
                  getIndex(filterCollection.tree.name, searchData) +
                    searchData.length,
                )}</span
              >{filterCollection.tree.name.substring(
                getIndex(filterCollection.tree.name, searchData) +
                  searchData.length,
              )}
            </span>
          </div>
          <div class="api-path">
            <span>{filterCollection.path?replaceSlashWithGreaterThanSymbol(filterCollection.path):""}</span>
          </div>
        </div>
          
        {/each}
      {/if}
      {#if workspaces.length > 0 && (currentSelectedId === "all" || currentSelectedId === "workspace")}
        {#each workspaces as workspace}
          {#if workspace.name.toLowerCase().includes(searchData.toLowerCase())}
          <div class="request"  on:click={()=>{ handleWorkspaceClick(workspace._id,workspace.name)}}>
            <div
            style="height:36px;"
            class="d-flex align-items-center search-option-request"
          >
            <img
              src={workspacesIcon}
              alt=""
              style="height:20px; width:20px;"
            />
            <span
              style=" padding-left: 8px; cursor:pointer; font-size:14px; font-weight:400;color:#999999"
            >
              {workspace.name.substring(
                0,
                getIndex(workspace.name, searchData),
              )}<span class="highlight"
                >{workspace.name.substring(
                  getIndex(workspace.name, searchData),
                  getIndex(workspace.name, searchData) + searchData.length,
                )}</span
              >{workspace.name.substring(
                getIndex(workspace.name, searchData) + searchData.length,
              )}
            </span>
          </div>
          </div>
          {/if}
        {/each}
      {/if}
    {/if}
  </div>
</div>

<style>
  .container {
    display: grid;
    grid-template-columns: 2fr 3fr;
    position: absolute;
    height: 400px;
    width: 400px;
    top: 30px;
    left: 0;
    background-color: var(--background-color);
    z-index: 20;
    border-radius: 10px;
    margin-top: 5px;
  }

  .workspace-options-container {
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding-top: 10px;
  }

  .workspace-options {
    width: 90%;
    border-radius: 6px;
    display: flex;
    flex-direction: row;
    justify-content: left;
    align-items: center;
    gap: 8px;
    height: 32px;
    font-family: Roboto;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0em;
    text-align: left;
    padding: 6px 12px 6px 12px;
    background-color: transparent;
    border: none;
  }

  .workspace-options:hover {
    background-color: #313233;
  }
  /* .selected{
    background-color: #313233;
  } */
  .api-method {
    font-size: 12px;
    font-weight: 500;
    margin-right: 8px;
    text-align: left;
  }
  .api-name {
    font-size: 12px;
    font-weight: 400;
    color: #8a9299;
  }

  .search-option-request {
    width: 100%;
    padding: 10px;
  }
  .request:hover {
    background-color: #313233;
  }
  .highlight {
    color: var(--white-color);
  }

  .search-options-container {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    overflow: auto;
    /* border: 2px solid red; */
  }

  .api-path {
    width: 100%;
    font-family: Roboto;
    font-size: 10px;
    font-weight: 400;
    line-height: 10px;
    letter-spacing: 0em;
    text-align: left;
    padding-left: 10px;
    color: #999999;
    margin-bottom: 10px;
  }
  .background-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: var(--background-hover);
    backdrop-filter: blur(3px);
    z-index: 4;
  }
</style>
