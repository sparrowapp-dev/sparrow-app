<script lang="ts">
  import closeIcon from "$lib/assets/close.svg";
  import icons from "$lib/assets/app.asset";
  import { fly, fade } from "svelte/transition";
  import { ImportCollectionViewModel } from "./ImportCollection.viewModel";
  import { notifications } from "$lib/utils/notifications";
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  import ProgressBar from "$lib/components/Transition/ProgressBar .svelte";
  import { isCollectionCreatedFirstTime } from "$lib/store/collection";
  import { generateSampleCollection } from "$lib/utils/sample/collection.sample";
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import type { Path } from "$lib/utils/interfaces/request.interface";
  import { HeaderDashboardViewModel } from "$lib/components/header/header-dashboard/HeaderDashboard.ViewModel";
  export let handleCreateCollection;
  export let currentWorkspaceId;
  export let collectionsMethods: CollectionsMethods;
  export let onClick: (flag: boolean) => void;
  const _viewImportCollection = new ImportCollectionViewModel();
  const _workspaceViewModel = new HeaderDashboardViewModel();

  let isLoading: boolean = false;
  let text: string = "";

  const handleInputField = (e) => {
    text = e.target.value;
  };

  const handleImportUrl = async () => {
    isLoading = true;
    const response = await _viewImportCollection.importCollectionData(
      currentWorkspaceId,
      text,
    );

    onClick(false);
    if (response.isSuccessful) {
      const res = response.data.data;
      isLoading = false;
      // collectionUnderCreation = true;
      isCollectionCreatedFirstTime.set(true);

      const newCollection = {
        id: res.id,
        name: res.name,
        items: [],
        createdAt: new Date().toISOString(),
      };

      collectionsMethods.addCollection(newCollection);

      let path: Path = {
        workspaceId: currentWorkspaceId,
        collectionId: res.id,
      };

      const Samplecollection = generateSampleCollection(
        res.id,
        new Date().toString(),
      );

      Samplecollection.id = res.id;
      Samplecollection.path = path;
      Samplecollection.name = res.name;
      Samplecollection.save = true;
      collectionsMethods.handleCreateTab(Samplecollection);
      moveNavigation("right");

      collectionsMethods.updateCollection(res.id, res);
      _workspaceViewModel.updateCollectionInWorkspace(currentWorkspaceId, {
        id: res.id,
        name: newCollection.name,
      });
      notifications.success(response.data.message);
    } else {
      isLoading = false;
    }
  };

  const handleImportFile = async (fileContent) => {
    isLoading = true;
    const response = await _viewImportCollection.importCollectionFile(
      currentWorkspaceId,
      fileContent,
    );
    console.log(response);
    if (response.isSuccessful) {
      onClick(false);
      isLoading = false;
      notifications.success(response.data.message);
    } else {
      isLoading = false;
      notifications.error(response.message);
    }
  };

  function handleFileUpload() {
    const fileInput = document.getElementById("file-input") as HTMLInputElement;

    const file = fileInput.files[0];
    console.log(file);

    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        const fileContent =e.target.result;
        console.log(fileContent);
        handleImportFile(fileContent);
      };
      reader.readAsText(file);
    }
  }

  const handleImportJsonObject = async () => {
    isLoading = true;
    console.log(text);

    const response = await _viewImportCollection.importCollectionFromJsonObject(
      currentWorkspaceId,
      { jsonObj: text },
    );

    console.log(response);
    if (response.isSuccessful) {
      onClick(false);
      isLoading = false;
      notifications.success(response.data.message);
    } else {
      isLoading = false;
      notifications.error(response.message);
    }
  };
</script>

{#if isLoading}
  <ProgressBar />
{/if}

<div
  class="background-overlay"
  on:click={() => {
    onClick(false);
  }}
  transition:fade={{ delay: 0, duration: 100 }}
/>

<div
  class="container d-flex flex-column mb-0 px-4 pb-0 pt-4"
  transition:fly={{ y: 50, delay: 0, duration: 100 }}
  on:introstart
  on:outroend
>
  <div class=" d-flex align-items-center justify-content-between mb-3">
    <h5 class="mb-0 text-whiteColor" style="font-weight: 500;">
      New Collection
    </h5>
    <button
      class="btn-close1 border-0 rounded"
      on:click={() => {
        onClick(false);
      }}
    >
      <img src={closeIcon} alt="" />
    </button>
  </div>
  <div style="font-size: 14px;" class="text-lightGray">
    <p>Paste your OAS/YAML/JSON file</p>
  </div>
  <div class="textarea-div rounded border-0">
    <textarea
      on:input={(e) => handleInputField(e)}
      bind:value={text}
      class="form-control border-0 rounded bg-blackColor"
    />
  </div>

  <div style="font-size: 14px;" class="text-lightGray mt-2">
    <p>Drag and drop your OAS/YAML/JSON file</p>
  </div>

  <div
    style="font-size: 14px;border:1px dashed #8A9299;"
    class="text-lightGray d-flex flex-column align-items-center justify-content-center"
  >
    <p style="text-align:center" class="mt-3 text-textColor">
      Drag and Drop or
    </p>

    <input
      type="file"
      id="file-input"
      name="file-input"
      required
      accept=".json"
      on:input={handleFileUpload}
    />
    <label
      id="file-input-label"
      for="file-input"
      class="text-labelColor d-flex align-items-left justify-content-center mb-3 w-25"
      style="font-size: 12px;cursor:pointer;"
    >
      <span class="me-2"><img src={icons.uploadIcon} alt="" /></span>Choose FIle</label
    >
  </div>

  <div
    class="d-flex flex-column align-items-center justify-content-end rounded mt-4"
  >
    <button
      class="btn-primary d-flex align-items-center justify-content-center border-0 w-100 py-2 fs-6 rounded"
      on:click={handleImportUrl}
    >
      <span class="me-3">
        {#if isLoading}
          <Spinner size={"16px"} />
        {/if}</span
      > Import Collection</button
    >

    <p
      class="text-whiteColor mt-2 mb-2"
      style="font-size: 14px;font-weight:300"
    >
      OR
    </p>
    <button
      class="btn-primary border-0 w-100 py-2 fs-6 rounded"
      on:click={() => {
        onClick(false);
        handleCreateCollection();
      }}>Create Collection</button
    >
  </div>
</div>

<style>
  #file-input {
    display: none;
  }

  textarea {
    width: 100%;
    resize: vertical; 
    height: 80%;
    max-height: 100%;
    background-color: var(--blackColor);
  }
  .background-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: var(--background-hover);
    backdrop-filter: blur(3px);
    z-index: 9;
  }
  
  .container {
    position: fixed;
    height: 80%;
    width: 40%; 
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--background-color);
    z-index: 10;
    border-radius: 10px;
  }
  .textarea-div{
    height:25%;
    border:2px solid red;
  }

  .btn-close1 {
    background-color: var(--background-color);
  }

  .btn-close1:hover {
    background-color: var(--dangerColor);
  }

  .btn-close1:active {
    background-color: var(--dangerColor);
  }
  .btn-primary {
    background: linear-gradient(270deg, #6147ff -1.72%, #1193f0 100%);
  }
</style>
