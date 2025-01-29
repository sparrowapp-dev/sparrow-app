<script lang="ts">
  import { DeleteIcon, EditIcon } from "@sparrow/library/assets";
  import { base64ToURL, imageDataToURL } from "@sparrow/common/utils";
  import FileTypeIcon from "../../../../../../@sparrow-library/src/icons/FileTypeIcon.svelte";
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
        class="sparrow-file-input p-2 w-100 px-auto bg-ds-surface-400 {isDragOver
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
                <span class="file-type-text">PNG</span>
              </div>
              <div class="file-type-container-two px-2 pt-1 pb-1">
                <FileTypeIcon />
                <span class="file-type-text">JPG</span>
              </div>
              <div class="ps-2 pt-1 pb-1">
                <FileTypeIcon />
                <span class="file-type-text">JPEG</span>
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
    <div class="sparrow-input-image-preview rounded d-flex gap-2">
      {#if value.bufferString}
        <img class="rounded p-2" src={base64ToURL(value)} alt="" />
      {:else}
        <img class="rounded p-2" src={imageDataToURL(value)} alt="" />
      {/if}
      <div class="align-items-end justify-content-end d-flex gap-2">
        <button
          on:click={editValue}
          class="edit-btn border-0 p-1 rounded align-items-center justify-content-center d-flex"
        >
          <EditIcon height={12} width={12} />
        </button>
        <button
          on:click={resetValue}
          class="del-btn border-0 p-1 rounded align-items-center justify-content-center d-flex"
        >
          <DeleteIcon height={12} width={12} />
        </button>
      </div>
    </div>
    <input
      class="sparrow-choose-file-input d-none overflow-hidden"
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
    font-size: var(--base-text);
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
  .sparrow-input-label {
    font-size: var(--base-text);
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
    color: var(--primary-btn-color);
    border: 0;
    font-size: var(--small-text);
  }

  .sparrow-choose-file-label {
    color: var(--text-ds-neutral-400);
  }

  .sparrow-input-image-preview > img {
    width: 80px;
    border: 1px solid #313233;
    height: 80px;
    background-color: var(--bg-tertiary-300);
  }
  .sparrow-input-image-preview {
    .edit-btn,
    .del-btn {
      background-color: transparent;
      height: 24px;
      width: 24px;
      display: flex;
      align-items: center;
    }
    .edit-btn:hover,
    .del-btn:hover {
      background-color: var(--bg-tertiary-300);
    }
  }
</style>
