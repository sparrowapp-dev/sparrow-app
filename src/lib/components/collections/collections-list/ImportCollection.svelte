<script lang="ts">
  import closeIcon from "$lib/assets/close.svg";
  import icons from "$lib/assets/app.asset";
  import { fly, fade } from "svelte/transition";
  import { ImportCollectionViewModel } from "./ImportCollection.viewModel";
  import { notifications } from "$lib/utils/notifications";
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  import ProgressBar from "$lib/components/Transition/SyntaxCheckProgressBar .svelte";
  import { generateSampleCollection } from "$lib/utils/sample/collection.sample";
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import type { Path } from "$lib/utils/interfaces/request.interface";
  import { HeaderDashboardViewModel } from "$lib/components/header/header-dashboard/HeaderDashboard.ViewModel";
  import InvalidSyntaxPopup from "$lib/components/Modal/InvalidSyntaxPopup.svelte";
  import FetchDataProgressBar from "$lib/components/Transition/FetchDataProgressBar.svelte";
  import Dropzone from "svelte-file-dropzone/Dropzone.svelte";
  import File from "./File.svelte";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import { Events } from "$lib/utils/enums/mixpanel-events.enum";

  export let handleCreateCollection;
  export let currentWorkspaceId;
  export let collectionsMethods: CollectionsMethods;
  export let onClick: (flag: boolean) => void;
  const _viewImportCollection = new ImportCollectionViewModel();
  const _workspaceViewModel = new HeaderDashboardViewModel();

  let isLoading: boolean = false;
  let isDataEmpty: boolean = false;
  let isSyntaxError: boolean = false;
  let isResponseLoading: boolean = false;
  let importData: string = "";
  let importFile: File;

  let fileName = "";
  function handleFilesSelect(event: CustomEvent) {
    fileName = event.detail ? event.detail.acceptedFiles[0]?.name : "";
    importFile = event.detail ? event.detail.acceptedFiles[0] : "";
  }
  const handleError = () => {
    isSyntaxError = false;
    isDataEmpty = false;
  };
  const handleInputField = (e) => {
    importData = e.target.value;
  };

  async function handleFileUpload(file: File) {
    if (file) {
      const response = await _viewImportCollection.importCollectionFromFile(
        currentWorkspaceId,
        file,
      );
      if (response.isSuccessful) {
        onClick(false);
        isLoading = false;
        let path: Path = {
          workspaceId: currentWorkspaceId,
          collectionId: response.data.data._id,
        };

        const newCollection = {
          id: response.data.data._id,
          name: response.data.data.name,
          items: response.data.data.items,
          createdAt: response.data.data.createdAt,
        };
        collectionsMethods.addCollection(newCollection);
        const Samplecollection = generateSampleCollection(
          response.data.data._id,
          new Date().toString(),
        );
        Samplecollection.id = response.data.data._id;
        Samplecollection.path = path;
        Samplecollection.name = response.data.data.name;
        Samplecollection.save = true;
        collectionsMethods.handleCreateTab(Samplecollection);
        moveNavigation("right");

        _workspaceViewModel.updateCollectionInWorkspace(currentWorkspaceId, {
          id: Samplecollection.id,
          name: Samplecollection.name,
        });
        notifications.success("New Collection Created");
        MixpanelEvent(Events.IMPORT_COLLECTION, {
          collectionName: response.data.data.name,
          collectionId: response.data.data._id,
          importThrough: "ByFile",
        });
        return;
      } else {
        isLoading = false;
        isSyntaxError = true;
      }
    }
  }

  const handleImport = () => {
    if (importData) {
      handleImportJsonObject();
      return;
    }
    if (importFile) {
      handleFileUpload(importFile);
      return;
    }
    isDataEmpty = true;
  };

  const handleImportJsonObject = async () => {
    isLoading = true;
    const contentType = _viewImportCollection.validateImportBody(importData);
    if (!contentType) {
      isLoading = false;
      isSyntaxError = true;
      return;
    }
    isLoading = false;
    isResponseLoading = true;
    const response = await _viewImportCollection.importCollectionFromJsonObject(
      currentWorkspaceId,
      importData,
      contentType,
    );

    if (response.isSuccessful) {
      onClick(false);
      isResponseLoading = false;
      let path: Path = {
        workspaceId: currentWorkspaceId,
        collectionId: response.data.data._id,
      };
      const newCollection = {
        id: response.data.data._id,
        name: response.data.data.name,
        items: response.data.data.items,
        createdAt: response.data.data.createdAt,
      };
      collectionsMethods.addCollection(newCollection);
      const Samplecollection = generateSampleCollection(
        response.data.data._id,
        new Date().toString(),
      );

      Samplecollection.id = response.data.data._id;
      Samplecollection.path = path;
      Samplecollection.name = response.data.data.name;
      Samplecollection.save = true;
      collectionsMethods.handleCreateTab(Samplecollection);
      moveNavigation("right");

      _workspaceViewModel.updateCollectionInWorkspace(currentWorkspaceId, {
        id: Samplecollection.id,
        name: Samplecollection.name,
      });
      notifications.success("New Collection Created");
      MixpanelEvent(Events.IMPORT_COLLECTION, {
        collectionName: response.data.data.name,
        collectionId: response.data.data._id,
        importThrough: "ByObject",
      });
      return;
    } else {
      isLoading = false;
      isResponseLoading = false;
      isSyntaxError = true;
    }
  };
</script>

{#if isLoading}
  <ProgressBar {onClick} />
{/if}
{#if isSyntaxError}
  <InvalidSyntaxPopup {onClick} {handleError}></InvalidSyntaxPopup>
{/if}
{#if isResponseLoading}
  <FetchDataProgressBar {onClick}></FetchDataProgressBar>
{/if}
{#if !isLoading && !isSyntaxError}
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
      <h5 class="mb-0 importData-whiteColor" style="font-weight: 500;">
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
    <div style="font-size: 14px;" class="importData-lightGray">
      <p>Paste your YAML/JSON file</p>
    </div>
    <div class="textarea-div rounded border-0">
      <textarea
        on:input={(e) => handleInputField(e)}
        bind:value={importData}
        class="form-control border-0 rounded bg-blackColor"
      />
    </div>

    <div style="font-size: 14px;" class="importData-lightGray mt-2">
      <p>Drag and drop your YAML/JSON file</p>
    </div>

    <div>
      <Dropzone
        containerStyles="background-color:#1e1e1e; width:100%;"
        accept=".yaml"
        inputElement
        on:drop={handleFilesSelect}
        on:change={handleFilesSelect}
      >
        <p class="importData-textColor">Drag and Drop or</p>
        <p>
          <span><img src={icons.uploadIcon} alt="" />Choose File</span>
          <span>{fileName}</span>
        </p>
      </Dropzone>
    </div>

    <div
      class="d-flex flex-column align-items-center justify-content-end rounded mt-4"
    >
      <button
        class="btn-primary d-flex align-items-center justify-content-center border-0 w-100 py-2 fs-6 rounded"
        on:click={() => {
          handleImport();
        }}
      >
        <span class="me-3">
          {#if isLoading}
            <Spinner size={"16px"} />
          {/if}</span
        > Import Collection</button
      >

      <p class="empty-data-error">
        {#if isDataEmpty}
          Please Paste or Upload your file in order to import the workspace
        {/if}
      </p>
      <p
        class="importData-whiteColor mb-2"
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
{/if}

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
    -webkit-backdrop-filter: blur(3px);
    backdrop-filter: blur(3px);
    z-index: 14;
  }
  .empty-data-error {
    color: var(--error--color);
    font-family: Roboto;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0em;
    width: 100%;
    text-align: left;
    padding: 2px;
  }
  .container {
    display: flex;
    position: fixed;
    height: 90%;
    width: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--background-color);
    z-index: 14;
    border-radius: 10px;
  }

  @media (min-width: 1000px) {
    .container {
      display: flex;
      position: fixed;
      height: 90%;
      width: 40%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: var(--background-color);
      z-index: 14;
      border-radius: 10px;
    }
  }
  .textarea-div {
    height: 25%;
    border: 2px solid red;
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
