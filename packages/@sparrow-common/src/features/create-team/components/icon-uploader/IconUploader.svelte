<script lang="ts">
  import { NewDeleteIcon, NewEditIcon } from "@sparrow/library/assets";
  import { base64ToURL, imageDataToURL } from "@sparrow/common/utils";
  import { FileTypeIcon } from "@sparrow/library/icons";
  import { NewUploadIcon } from "@sparrow/library/icons";

  export let value: any = [];
  export let inputId: string;
  export let inputPlaceholder: string;
  export let maxFileSize: number;
  export let resetValue: (e: any) => void;
  export let editValue: (e: any) => void;
  export let isError = false;
  export let supportedFileTypes: string[] = [];
  export let onChange: (
    e: any,
    maxFileSize: number,
    supportedFileTypes: string[],
  ) => void;
  export let width = "100%";
  export let height = "auto";
  export let iconHeight = 12;
  export let iconWidth = 12;
  export let disabled = false;
  export let fileTypes = ["JPG", "PNG", "JPEG"];
  export let fileName: string = "";
  let isDragOver = false;
  let isFocused = false;

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
  const truncateFileName = (name: string, length: number): string => {
    return name.length > length ? name.substring(0, length) + ".." : name;
  };
</script>

<div class="sparrow-text-input-container mb-2">
  <div class="d-flex flex-column">
    {#if value.length == 0 || value.size === 0}
      <div
        style="
      width: ${width} !important;
      height: ${height} !important;
      border: {isError ? '2px' : '1px'} dashed {isError
          ? 'var(--border-ds-danger-300)'
          : 'var(--border-ds-surface-100)'};
      background-color: ${!disabled
          ? isError && isFocused
            ? 'var(--bg-ds-surface-400)'
            : 'transparent'
          : 'var(--bg-ds-surface-600)'};
    "
        class="sparrow-file-input text-fs-14 p-2 w-100 px-auto bg-ds-surface-400 {isDragOver
          ? 'drag-over'
          : ''}"
        tabindex="0"
        on:dragover={(e) => {
          if (!disabled) {
            e.preventDefault();
            isDragOver = true;
          }
        }}
        on:dragleave={() => {
          if (!disabled) isDragOver = false;
        }}
        on:drop={(e) => {
          if (!disabled) {
            e.preventDefault();
            isDragOver = false;
            handleDrop(e, maxFileSize, supportedFileTypes);
          }
        }}
        on:focus={() => {
          if (!disabled) isFocused = true;
        }}
        on:blur={() => {
          if (!disabled) isFocused = false;
        }}
      >
        <div
          class="sparrow-choose-file-input-button d-flex justify-content-center"
        >
          <div class="d-flex text-center row justify-content-center">
            <label for={inputId} class="d-flex justify-content-center">
              <NewUploadIcon />
            </label>
            <label for={inputId} class="sparrow-choose-file-label my-2 ps-2"
              >Drag & Drop or <span class="sparrow-upload-text text-fs-14"
                >Upload File</span
              > here</label
            >
            <div for={inputId} class="d-flex justify-content-center text-fs-12">
              <div class="file-type-container-one pe-2 pt-1 pb-1">
                <FileTypeIcon />
                <span class="file-type-text">{fileTypes[0]}</span>
              </div>
              {#each fileTypes.slice(1, -1) as fileType, index}
                <div class="file-type-container-two px-2 pt-1 pb-1" key={index}>
                  <FileTypeIcon />
                  <span class="file-type-text">{fileType}</span>
                </div>
              {/each}
              <div class="ps-2 pt-1 pb-1">
                <FileTypeIcon />
                <span class="file-type-text"
                  >{fileTypes[fileTypes.length - 1]}</span
                >
              </div>
            </div>
            <input
              class="sparrow-choose-file-input visually-hidden"
              type="file"
              {value}
              id={inputId}
              placeholder={inputPlaceholder}
              accept={generateAcceptString()}
              {disabled}
              on:change={(e) => {
                onChange(e, maxFileSize, supportedFileTypes);
              }}
            />
          </div>
        </div>
      </div>
    {/if}
  </div>

  {#if !Array.isArray(value) && value.size > 0}
    <div
      class="sparrow-input-image-preview d-flex gap-2 border-radius-4 align-items-center"
    >
      <div
        class="sparrow-input-box d-flex col align-items-center justify-content-start"
      >
        <div class="d-flex align-items-center">
          {#if value.bufferString}
            <img
              class="image-box rounded-circle border"
              src={base64ToURL(value)}
              alt="Profile Image"
            />
          {:else}
            <img
              class="image-box rounded-circle border"
              src={imageDataToURL(value)}
              alt="Profile Image"
            />
          {/if}
        </div>
        <span class="ms-1 file-name-text text-fs-12"
          >{truncateFileName(fileName, 6)}</span
        >
        <div class="ms-auto d-flex">
          <button
            on:click={editValue}
            class="edit-btn border-0 p-1 d-flex align-items-center justify-content-center"
          >
            <NewEditIcon height={16} width={16} />
          </button>
          <button
            on:click={resetValue}
            class="del-btn border-0 p-1 d-flex align-items-center justify-content-center"
          >
            <NewDeleteIcon height={14} width={14} />
          </button>
        </div>
      </div>
    </div>
    <input
      class="sparrow-choose-file-input text-fs-14 d-none overflow-hidden"
      type="file"
      id={inputId}
      placeholder={inputPlaceholder}
      accept={generateAcceptString()}
      {disabled}
      on:change={(e) => {
        onChange(e, maxFileSize, supportedFileTypes);
      }}
    />
  {/if}
</div>

<style lang="scss">
  .sparrow-choose-file-input-button {
    margin-top: 22px;
    margin-bottom: 22px;
  }
  .sparrow-file-input {
    height: 164px;
    min-width: 240px;
    max-width: 540px;
    border-radius: 4px;
    transition:
      border 0.2s ease-in-out,
      background-color 0.2s ease-in-out;

    &:hover {
      border: 1px dashed var(--border-ds-neutral-300) !important;
      cursor: pointer;
    }

    &:focus {
      border: 1px dashed var(--border-ds-primary-300) !important;
      background-color: var(--bg-ds-surface-500);
    }
  }

  .sparrow-file-input.drag-over {
    border: 1px dashed var(--border-ds-primary-300) !important;
    background-color: var(--bg-ds-surface-500);
  }
  .sparrow-file-input:hover {
    border: 1px solid var(--border-ds-neutral-300);
    cursor: pointer;
  }
  .sparrow-upload-text {
    color: var(--text-ds-primary-300);
    font-family: "Inter", sans-serif;
    text-align: center;
    cursor: pointer;
  }
  .file-type-text {
    color: var(--text-ds-neutral-400);
    font-family: "Inter", sans-serif;
    text-align: left;
  }
  .file-type-container-one {
    border-right: 1px solid var(--border-ds-surface-100);
  }
  .file-type-container-two {
    border-right: 1px solid var(--border-ds-surface-100);
  }
  .sparrow-choose-file-input::file-selector-button {
    background-color: transparent;
    color: var(--bg-ds-neutral-400);
    border: 0;
  }

  .sparrow-choose-file-label {
    color: var(--text-ds-neutral-400);
  }

  .sparrow-input-image-preview > img {
    width: 80px;
    border: 1px solid #313233;
    height: 80px;
    background-color: var(--bg-ds-surface-400);
  }
  .sparrow-input-image-preview {
    height: 44px;
    min-width: 240px;
    max-width: 540px;
    gap: 4px;
    border-radius: 4px;
    background-color: var(--bg-ds-surface-400);
    padding: 8px;
    padding-right: 80px;
  }
  .sparrow-input-box {
    width: 100%;
    max-width: 138px;
    height: 28px;
    border-radius: 30px;
    background-color: var(--bg-ds-surface-100);
    padding-left: 2px;
  }

  .image-box {
    height: 24px;
    width: 24px;
  }
  .file-name-text {
    color: var(--text-ds-danger-300);
    font-family: "Inter", sans-serif;
    font-weight: 400px;
  }

  .edit-btn,
  .del-btn {
    background-color: transparent;
    width: 28px;
    height: 28px;
    transition: background-color 0.3s ease;
  }
</style>
