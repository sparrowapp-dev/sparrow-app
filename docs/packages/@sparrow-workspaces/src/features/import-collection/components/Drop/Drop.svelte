<script lang="ts">
  import { DeleteIcon, EditIcon, UploadIcon } from "@sparrow/library/assets";
  import { base64ToURL, imageDataToURL } from "@sparrow/common/utils";
  import { CrossIcon } from "@sparrow/library/assets";

  export let value: any = [];
  export let inputId: string;
  export let inputPlaceholder: string;
  export let maxFileSize: number;
  export let resetValue: (e: any) => void;
  export let isError = false;
  export let supportedFileTypes: string[] = [];
  export let title = "";
  export let onChange: (
    e: any,
    maxFileSize: number,
    supportedFileTypes: string[],
  ) => void;
  export let width = "100%";
  export let height = "auto";
  export let iconHeight = 12;
  export let iconWidth = 12;
  let isDragOver = false;

  const FileSize = {
    KB: "KB",
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
  <div class="d-flex">
    {#if value?.length == 0}
      <div
        style="width:{width} !important; height:{height} !important;  border: 3px dashed {isError
          ? 'var(--dangerColor)'
          : 'var(--request-arc)'}; border-width: 2px;"
        class="sparrow-file-input bg-tertiary-300 w-100 px-auto {isDragOver &&
          'opacity-75'}"
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
        {#if width === "100%"}
          <span
            class="sparrow-file-input-placeholder text-fs-14 fw-normal d-flex justify-content-center mt-4"
            >{title}</span
          >
        {/if}
        <div
          class="sparrow-choose-file-input-button d-flex justify-content-center my-4"
        >
          <label for={inputId}>
            <UploadIcon
              classProp="my-auto"
              width={iconWidth}
              height={iconHeight}
              color={"var(--text-primary-300)"}
            />
          </label>
          {#if width === "100%"}
            <label
              for={inputId}
              class="sparrow-choose-file-label text-fs-12 ps-2"
              style="margin-top: 2px;">Choose File</label
            >
          {/if}
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
  </div>

  {#if !Array.isArray(value) && value?.size > 0}
    <div
      style="border: 3px dashed {isError
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
          class="placeholder-file px-3 py-1 py-0 d-flex border-radius-4 justify-content-center align-items-center"
        >
          <span style="max-width:300px;" class="ellipsis text-fs-12">
            {value.name}
            {formatSizeUnits(value.size)}
          </span>

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
  }
  .sparrow-choose-file-input::file-selector-button {
    background-color: transparent;
    color: var(--primary-btn-color);
    border: 0;
    font-size: var(--small-text);
  }

  .sparrow-choose-file-label {
    color: var(--text-primary-300);
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
  .placeholder-file {
    background-color: var(--bg-tertiary-650);
  }
</style>
