<script lang="ts">
  import { ImportCollectionViewModel } from "./ImportCollection.viewModel";
  import { notifications } from "$lib/components/toast-notification/ToastNotification";
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  import ProgressBar from "$lib/components/Transition/progress-bar/ProgressBar.svelte";
  import { generateSampleCollection } from "$lib/utils/sample/collection.sample";
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import type { Path } from "$lib/utils/interfaces/request.interface";
  import { HeaderDashboardViewModel } from "$lib/components/header/header-dashboard/HeaderDashboard.ViewModel";
  import Request from "../request/Request.svelte";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import { Events } from "$lib/utils/enums/mixpanel-events.enum";
  import DragDrop from "$lib/components/dragdrop/DragDrop.svelte";
  import ModalWrapperV1 from "$lib/components/Modal/Modal.svelte";

  export let handleCreateCollection;
  export let currentWorkspaceId;
  export let collectionsMethods: CollectionsMethods;
  export let onClick: (flag: boolean) => void;
  const _viewImportCollection = new ImportCollectionViewModel();
  const _workspaceViewModel = new HeaderDashboardViewModel();

  const ProgressTitle = {
    IDENTIFYING_SYNTAX: "Identifying Syntax...",
    FETCHING_DATA: "Fetching Data...",
  };

  let isDataEmpty: boolean = false;
  let isSyntaxError: boolean = false;
  let importData: string = "";

  let progressBar = {
    isLoading: false,
    isProgress: false,
    title: ProgressTitle.IDENTIFYING_SYNTAX,
  };

  const handleError = () => {
    isSyntaxError = false;
    isDataEmpty = false;
  };
  const handleInputField = (e) => {
    importData = e.target.value;
  };
  let uploadCollection = {
    file: {
      value: [],
      invalid: false,
      showFileSizeError: false,
      showFileTypeError: false,
    },
  };
  const handleLogoInputChange = (
    e: any,
    maxSize: number,
    supportedFileTypes: string[],
  ) => {
    const targetFile = e?.target?.files;
    const dataTransferFile = e?.dataTransfer?.files;
    if (
      (targetFile && targetFile[0].size > maxSize * 1024) ||
      (dataTransferFile && dataTransferFile[0].size > maxSize * 1024)
    ) {
      uploadCollection.file.showFileSizeError = true;
      uploadCollection.file.invalid = true;
      return;
    }
    const fileType = `.${(
      (targetFile && targetFile[0]?.name) ||
      (dataTransferFile && dataTransferFile[0]?.name)
    )
      .split(".")
      .pop()
      .toLowerCase()}`;
    if (!supportedFileTypes.includes(fileType)) {
      uploadCollection.file.showFileTypeError = true;
      uploadCollection.file.invalid = true;
      return;
    }
    uploadCollection.file.showFileSizeError = false;
    uploadCollection.file.showFileTypeError = false;
    uploadCollection.file.invalid = false;
    uploadCollection.file.value =
      (targetFile && targetFile[0]) ||
      (dataTransferFile && dataTransferFile[0]);
    isDataEmpty = false;
  };

  const handleLogoReset = (e: any) => {
    uploadCollection.file.value = [];
  };

  const handleLogoEdit = (e: any) => {
    const uploadFileInput = document.getElementById(
      "upload-collection-file-input",
    );
    uploadFileInput.click();
  };

  async function handleFileUpload(file: Request) {
    if (file) {
      progressBar.isLoading = true;
      progressBar.isProgress = false;
      progressBar.title = ProgressTitle.IDENTIFYING_SYNTAX;
      const response = await _viewImportCollection.importCollectionFromFile(
        currentWorkspaceId,
        file,
      );
      if (response.isSuccessful) {
        progressBar.title = ProgressTitle.FETCHING_DATA;
        progressBar.isProgress = true;

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
        progressBar.isLoading = false;
        isSyntaxError = true;
      }
    }
  }

  const handleImport = () => {
    if (importData) {
      handleImportJsonObject();
      return;
    }
    if (uploadCollection?.file?.value?.length !== 0) {
      handleFileUpload(uploadCollection?.file?.value);
      return;
    }
    isDataEmpty = true;
  };

  const handleImportJsonObject = async () => {
    const contentType = _viewImportCollection.validateImportBody(importData);
    if (!contentType) {
      progressBar.isLoading = false;
      isSyntaxError = true;
      return;
    }
    progressBar.isLoading = true;
    progressBar.isProgress = false;
    progressBar.title = ProgressTitle.IDENTIFYING_SYNTAX;
    const response = await _viewImportCollection.importCollectionFromJsonObject(
      currentWorkspaceId,
      importData,
      contentType,
    );

    if (response.isSuccessful) {
      progressBar.title = ProgressTitle.FETCHING_DATA;
      progressBar.isProgress = true;
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
      progressBar.isLoading = false;
      isSyntaxError = true;
    }
  };
</script>

{#if progressBar.isLoading}
  <ProgressBar
    {onClick}
    title={progressBar.title}
    zIndex={10000}
    isProgress={progressBar.isProgress}
  />
{/if}

<ModalWrapperV1
  title={"Incorrect File format"}
  type={"dark"}
  width={"35%"}
  zIndex={1000}
  isOpen={isSyntaxError}
  handleModalState={onClick}
>
  <div class="invalid-type-content">
    <div>
      <p class="format-info fw-normal text-start sparrow-fs-12">
        We have identified that text you pasted is not the right file format.
        Please ensure that you paste the following file formats only.
      </p>
    </div>
    <div class="format-types-container">
      <p class="format-type fw-normal p-2 text-start sparrow-fs-12">.YAML</p>
      <p class="format-type fw-normal p-2 text-start sparrow-fs-12">.JSON</p>
    </div>
    <div class="format-btns">
      <button
        class="format-btn fw-normal sparrow-fs-16 p-1 text-start"
        on:click={() => {
          onClick(false);
        }}>Close</button
      >
      <button
        class="format-btn collection-btn fw-normal sparrow-fs-16 p-1 text-start"
        on:click={() => {
          handleError();
        }}>+ Collection</button
      >
    </div>
  </div>
</ModalWrapperV1>

<ModalWrapperV1
  title={"New Collection"}
  type={"dark"}
  width={"35%"}
  zIndex={1000}
  isOpen={!progressBar.isLoading && !isSyntaxError}
  handleModalState={onClick}
>
  <div class="importData-lightGray sparrow-fs-14">
    <p>Paste your YAML/JSON file</p>
  </div>
  <div class="textarea-div rounded border-0">
    <textarea
      on:input={(e) => handleInputField(e)}
      bind:value={importData}
      class="form-control border-0 rounded bg-blackColor"
    />
  </div>
  <div class="importData-lightGray sparrow-fs-14">
    <p class="mb-1">Drag and drop your YAML/JSON file</p>
  </div>
  <div>
    <DragDrop
      value={uploadCollection.file.value}
      maxFileSize={100}
      onChange={handleLogoInputChange}
      resetValue={handleLogoReset}
      editValue={handleLogoEdit}
      labelText=""
      labelDescription="Drag and drop your YAML/JSON file"
      inputId="upload-collection-file-input"
      inputPlaceholder="Drag and Drop or"
      isRequired={false}
      supportedFileTypes={[".yaml", ".json"]}
      showFileSizeError={uploadCollection.file.showFileSizeError}
      showFileTypeError={uploadCollection.file.showFileTypeError}
      type={"file"}
      fileTypeError="This file type is not supported. Please reupload in any of the following file formats."
      fileSizeError="The size of the file you are trying to upload is more than 100 KB."
    />
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
        {#if progressBar.isLoading}
          <Spinner size={"16px"} />
        {/if}</span
      > Import Collection</button
    >

    <p class="empty-data-error sparrow-fs-12 fw-normal w-100 text-start">
      {#if isDataEmpty && !importData}
        Please Paste or Upload your file in order to import the workspace
      {/if}
    </p>
    <p class="importData-whiteColor mb-2 sparrow-fs-14 fw-bold">OR</p>
    <button
      class="btn-primary border-0 w-100 py-2 fs-6 rounded"
      on:click={() => {
        onClick(false);
        handleCreateCollection();
      }}>Create Collection</button
    >
  </div>
</ModalWrapperV1>

<style lang="scss">
  #file-input {
    display: none;
  }

  textarea {
    width: 100%;
    resize: vertical;
    height: calc(100px) !important;
    background-color: var(--blackColor);
    margin-bottom: 5%;
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
    z-index: 13;
  }
  .empty-data-error {
    color: var(--error--color);
    line-height: 18px;
    letter-spacing: 0em;
    padding: 2px;
  }
  .container {
    display: flex;
    position: fixed;
    top: 50%;
    left: 50%;
    max-width: calc(488px);
    transform: translate(-50%, -50%);
    background-color: var(--background-color);
    z-index: 14;
    border-radius: 10px;
  }

  .textarea-div {
    height: 25%;
    border: 2px solid red;
  }

  .btn-close1 {
    background-color: var(--background-color);
  }

  .btn-close1:hover {
    background-color: var(--background-dropdown);
  }

  .btn-close1:active {
    background-color: var(--background-dropdown);
  }
  .btn-primary {
    background: linear-gradient(270deg, #6147ff -1.72%, #1193f0 100%);
  }
  .invalid-type-content {
    .format-types-container {
      display: flex;
      justify-content: space-between;
      width: 25%;
    }
    .format-header {
      line-height: 18px;
      letter-spacing: 0em;
    }

    .format-info {
      line-height: 18px;
      letter-spacing: 0em;
    }
    .format-type {
      line-height: 18px;
      letter-spacing: 0em;
      border: 1px solid var(--border-color);
      border-radius: 10px;
    }
    .format-btns {
      width: 100%;
      display: flex;
      justify-content: end;
      gap: 10px;
    }
    .format-btn {
      background-color: var(--border-color);
      border: none;
      width: 20%;
      border-radius: 4px;
      font-family: Roboto;
      line-height: 24px;
      letter-spacing: 0em;
    }
    .format-btn:hover {
      background-color: #616364;
    }
    .collection-btn {
      background-color: var(--sparrow-blue);
      color: var(--white-color);
      line-height: 24px;
      letter-spacing: 0em;
      text-align: center;
    }
    .collection-btn:hover {
      background-color: var(--send1-hoverbutton);
    }
    .btn-close1 {
      background-color: var(--background-color);
    }

    .btn-close1:hover {
      background-color: var(--background-dropdown);
    }

    .btn-close1:active {
      background-color: var(--background-dropdown);
    }
  }
</style>
