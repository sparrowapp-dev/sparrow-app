<script lang="ts">
  import {
    DeleteIcon,
    CrossIcon,
    EditIcon,
    UploadIcon,
  } from "$lib/assets/app.asset";
  import { imageDataToURL } from "$lib/utils/helpers";

  export let value: any = [];
  export let labelText: string;
  export let labelDescription = "";
  export let inputId: string;
  export let inputPlaceholder: string;
  export let maxFileSize: number;
  export let isRequired = false;
  export let resetValue: (e: any) => void;
  export let editValue: (e: any) => void;
  export let showFileTypeError = false;
  export let showFileSizeError = false;
  export let fileTypeError =
    "This file type is not supported. Please reupload in any of the following file formats.";
  export let fileSizeError =
    "The size of the file you are trying to upload is more than 100 KB.";
  export let supportedFileTypes: string[] = [];
  export let onChange: (
    e: any,
    maxFileSize: number,
    supportedFileTypes: string[],
  ) => void;
  export let type = "image";
  console.log(value);
  let isDragOver = false;

  const generateAcceptString = (): string => {
    const acceptString = supportedFileTypes.map((type) => `${type}`).join(", ");
    return acceptString;
  };

  const handleDrop = (
    event: DragEvent,
    maxFileSize: number,
    supportedFileTypes: string[],
  ) => {
    onChange(event, maxFileSize, supportedFileTypes);
  };

  const formatSizeUnits = (bytes: number) => {
    let response: string;
    if (bytes >= 1073741824) {
      response = (bytes / 1073741824).toFixed(2) + " GB";
    } else if (bytes >= 1048576) {
      response = (bytes / 1048576).toFixed(2) + " MB";
    } else if (bytes >= 1024) {
      response = (bytes / 1024).toFixed(2) + " KB";
    } else if (bytes > 1) {
      response = bytes + " bytes";
    } else if (bytes == 1) {
      response = bytes + " byte";
    } else {
      response = "0 bytes";
    }
    return response;
  };
</script>

<div class="sparrow-text-input-container mt-3">
  <div class="sparrow-input-label-container mb-1">
    <div class="sparrow-input-label-heading">
      {#if labelText}
        <label class="sparrow-input-label text-lightGray fw-light" for={inputId}
          >{labelText}</label
        >
        {#if isRequired}
          <span class="sparrow-input-required">*</span>
        {/if}
      {/if}
    </div>
    {#if value.length === 0}
      <span class="sparrow-input-label-desc">{labelDescription}</span>
    {/if}
  </div>
  {#if value.length == 0}
    <div
      style="border: 3px dashed {showFileTypeError || showFileSizeError
        ? 'var(--dangerColor)'
        : 'var(--request-arc)'}; border-width: 2px;"
      class="sparrow-file-input w-100 px-auto {isDragOver &&
        'opacity-75 bg-lightBackground'}"
      on:dragover={(e) => {
        e.preventDefault();
        isDragOver = true;
      }}
      on:dragleave={() => {
        isDragOver = false;
      }}
      on:drop={(e) => {
        e.preventDefault();
        isDragOver = false;
        handleDrop(e, maxFileSize, supportedFileTypes);
      }}
    >
      <span
        class="sparrow-file-input-placeholder fw-normal d-flex justify-content-center mt-4"
        >Drag and Drop or</span
      >
      <div
        class="sparrow-choose-file-input-button d-flex justify-content-center my-4"
      >
        <UploadIcon classProp="my-auto" />
        <label for={inputId} class="sparrow-choose-file-label ps-2"
          >Choose File</label
        >
        <input
          class="sparrow-choose-file-input visually-hidden"
          type="file"
          {value}
          id={inputId}
          placeholder={inputPlaceholder}
          accept={generateAcceptString()}
          on:change={(e) => {
            onChange(e, maxFileSize, supportedFileTypes);
          }}
        />
      </div>
    </div>
  {/if}
  <p class="sparrow-file-input-error-text mt-2">
    {#if showFileTypeError}
      {fileTypeError}
    {:else if showFileSizeError}
      {fileSizeError}
    {/if}
  </p>
  {#if showFileTypeError}
    <div class="d-flex gap-2">
      {#each supportedFileTypes as fileType}
        <span class="px-2 py-1 sparrow-input-file-type rounded">
          {fileType}
        </span>
      {/each}
    </div>
  {/if}
  {#if !Array.isArray(value)}
    {#if type === "image"}
      <div class="sparrow-input-image-preview rounded p-1 d-flex gap-2">
        <img class="rounded p-2" src={imageDataToURL(value)} alt="" />
        <div class="align-items-end justify-content-end d-flex gap-2">
          <button on:click={editValue} class="edit-btn border-0 p-2 rounded">
            <EditIcon />
          </button>
          <button on:click={resetValue} class="del-btn border-0 p-2 rounded">
            <DeleteIcon />
          </button>
        </div>
      </div>
      <input
        class="sparrow-choose-file-input d-none overflow-hidden"
        type="file"
        id={inputId}
        placeholder={inputPlaceholder}
        accept={generateAcceptString()}
        on:change={(e) => {
          onChange(e, maxFileSize, supportedFileTypes);
        }}
      />
    {:else if type === "file"}
      <div
        style="border: 3px dashed {showFileTypeError || showFileSizeError
          ? 'var(--dangerColor)'
          : 'var(--request-arc)'}; border-width: 2px;"
        class="sparrow-file-input w-100 px-auto {isDragOver &&
          'opacity-75 bg-lightBackground'}"
        on:dragover={(e) => {
          e.preventDefault();
          isDragOver = true;
        }}
        on:dragleave={() => {
          isDragOver = false;
        }}
        on:drop={(e) => {
          e.preventDefault();
          isDragOver = false;
          handleDrop(e, maxFileSize, supportedFileTypes);
        }}
      >
        <div
          class="sparrow-choose-file-input-button d-flex py-4 justify-content-center my-4"
        >
          <!-- . -->
          <div
            class="bg-backgroundDropdown px-3 py-0 d-flex justify-content-center align-items-center"
          >
            {value.name}
            {formatSizeUnits(value.size)}
            <button
              on:click={resetValue}
              class="ms-2 border-0 p-1 rounded"
              style="background-color:transparent;"
            >
              <CrossIcon />
            </button>
          </div>
          <!-- . -->
        </div>
      </div>
    {/if}
  {/if}
</div>

<style lang="scss">
  .sparrow-input-label {
    font-size: 14px;
  }
  .sparrow-input-required {
    color: var(--dangerColor);
  }
  .sparrow-file-input {
    outline: none;
    border-radius: 4px;
    font-size: 14px;
  }
  .sparrow-input-label-desc {
    color: var(--request-arc);
    font-size: 12px;
  }
  .sparrow-file-input-placeholder {
    color: var(--request-arc);
    font-size: 14px;
  }
  .sparrow-choose-file-input::file-selector-button {
    background-color: transparent;
    color: var(--primary-btn-color);
    border: 0;
    font-size: 12px;
  }

  .sparrow-choose-file-label {
    color: var(--primary-btn-color);
  }

  .sparrow-input-image-preview > img {
    width: 80px;
    border: 1px solid #313233;
    height: 80px;
  }
  .sparrow-input-image-preview {
    .edit-btn,
    .del-btn {
      background-color: transparent;
    }
    .edit-btn:hover,
    .del-btn:hover {
      background-color: var(--border-color);
    }
  }
  .sparrow-file-input-error-text {
    color: var(--dangerColor);
    font-size: 12px;
  }

  .sparrow-input-file-type {
    border: 1px solid var(--border-color);
  }
</style>
