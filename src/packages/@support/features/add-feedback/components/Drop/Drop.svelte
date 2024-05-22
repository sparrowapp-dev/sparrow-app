<script lang="ts">
  import { DeleteIcon, EditIcon, UploadIcon } from "$lib/assets/app.asset";
  import { base64ToURL, imageDataToURL } from "$lib/utils/helpers";
  import { CrossIcon } from "$lib/assets/app.asset";

  export let value: any = [];
  export let labelText: string;
  export let labelDescription = "";
  export let labelDescriptionSize = "0.75rem";
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
  export let width = "100%";
  export let height = "auto";
  export let iconHeight = 12;
  export let iconWidth = 12;
  let isDragOver = false;

  const FileSize = {
    KB: "kB",
    MB: "MB",
    GB: "GB",
    BYTE: "Byte",
    BYTES: "Bytes",
  };

  const FileSizeInByte = {
    KB: 1024,
    MB: 1048576,
    GB: 1073741824,
  };
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
    if (bytes >= FileSizeInByte.GB) {
      response = (bytes / FileSizeInByte.GB).toFixed(2) + ` ${FileSize.GB}`;
    } else if (bytes >= FileSizeInByte.MB) {
      response = (bytes / FileSizeInByte.MB).toFixed(2) + ` ${FileSize.MB}`;
    } else if (bytes >= FileSizeInByte.KB) {
      response = (bytes / FileSizeInByte.KB).toFixed(2) + ` ${FileSize.KB}`;
    } else if (bytes > 1) {
      response = bytes + ` ${FileSize.BYTES}`;
    } else if (bytes == 1) {
      response = bytes + ` ${FileSize.BYTE}`;
    } else {
      response = `0 ${FileSize.BYTES}`;
    }
    return response;
  };
</script>

<div class="sparrow-text-input-container mb-2">
  <div class="sparrow-input-label-container">
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
    {#if (value.length === 0 || value.size === 0) && type === "image" && width === "100%"}
      <span
        class="sparrow-input-label-desc"
        style="font-size:{labelDescriptionSize}">{labelDescription}</span
      >
    {/if}
  </div>
  <div class="d-flex">
    <!-- {#if value.length == 0 || value.size === 0} -->
    <div
      style="width:100%; !important; height:{height} !important;  border: 3px dashed {showFileTypeError ||
      showFileSizeError
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
        class="sparrow-choose-file-input-button d-flex justify-content-center my-4"
      >
        <label for={inputId}>
          <UploadIcon
            classProp="my-auto"
            width={iconWidth}
            height={iconHeight}
          />
        </label>
        <label for={inputId}>
          hello world hello worldhello world hello worldhello worldhello world
        </label>
        <input
          class="sparrow-choose-file-input visually-hidden"
          type="file"
          multiple
          value=""
          id={inputId}
          placeholder={inputPlaceholder}
          on:change={(e) => {
            onChange(e, maxFileSize, supportedFileTypes);
          }}
          accept={generateAcceptString()}
        />
      </div>
    </div>
    <!-- {/if} -->
  </div>
</div>

<style lang="scss">
  .sparrow-input-label {
    font-size: var(--base-text);
  }
  .sparrow-input-required {
    color: var(--dangerColor);
  }
  .sparrow-file-input {
    outline: none;
    border-radius: 4px;
    font-size: var(--base-text);
  }
  .sparrow-input-label-desc {
    color: var(--request-arc);
    font-size: var(--small-text);
  }
  .sparrow-file-input-placeholder {
    color: var(--request-arc);
    font-size: var(--base-text);
  }
  .sparrow-choose-file-input::file-selector-button {
    background-color: transparent;
    color: var(--primary-btn-color);
    border: 0;
    font-size: var(--small-text);
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
    font-size: var(--small-text);
  }

  .sparrow-input-file-type {
    border: 1px solid var(--border-color);
  }
</style>
