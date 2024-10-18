<script lang="ts">
  import { DeleteIcon, EditIcon, UploadIcon } from "@sparrow/library/assets";
  import { base64ToURL, imageDataToURL } from "@sparrow/common/utils";

  /**
   * The current value of the file input.
   */
  export let value: any = [];

  /**
   * Description label for the input.
   */
  export let labelDescription: string = "";

  /**
   * Font size for the description label.
   */
  export let labelDescriptionSize: string = "0.75rem";

  /**
   * The ID for the input element.
   */
  export let inputId: string = "";

  /**
   * Maximum allowed file size in kb.
   */
  export let maxFileSize: number = 100;

  /**
   * Function to reset the value.
   */
  export let resetValue: (e: any) => void;

  /**
   * Function to edit the value.
   */
  export let editValue: (e: any) => void;

  /**
   * Flag to show file type error.
   */
  export let showFileTypeError: boolean = false;

  /**
   * Flag to show file size error.
   */
  export let showFileSizeError: boolean = false;

  /**
   * List of supported file types.
   */
  export let supportedFileTypes: string[] = [];

  /**
   * Function to handle file input change.
   */
  export let onChange: (
    e: any,
    maxFileSize: number,
    supportedFileTypes: string[],
  ) => void;

  /**
   * Width of the file input container.
   */
  export let width: string = "auto";

  /**
   * Height of the file input container.
   */
  export let height: string = "auto";

  /**
   * Height of the icon.
   */
  export let iconHeight: number = 12;

  /**
   * Width of the icon.
   */
  export let iconWidth: number = 12;

  let isDragOver: boolean = false;

  /**
   * Generates a string to be used in the 'accept' attribute of the file input,
   * indicating which file types are supported.
   * @returns The accept string.
   */
  const generateAcceptString = (): string => {
    const acceptString = supportedFileTypes.map((type) => `${type}`).join(", ");
    return acceptString;
  };

  /**
   * Handles the drop event when a file is dragged and dropped onto the input area.
   * @param event - The drag event.
   * @param maxFileSize - Maximum allowed file size.
   * @param supportedFileTypes - List of supported file types.
   */
  const handleDrop = (
    event: DragEvent,
    maxFileSize: number,
    supportedFileTypes: string[],
  ) => {
    onChange(event, maxFileSize, supportedFileTypes);
  };
</script>

<div class="sparrow-text-input-container mb-2">
  <div class="d-flex align-items-center">
    {#if value.length == 0 || value.size === 0}
      <!-- Icon Uploader only shows when no file uploaded -->
      <div
        style="width:{width} !important; height:{height} !important;  border: 3px dashed {showFileTypeError ||
        showFileSizeError
          ? 'var(--border-danger-200)'
          : 'var(--border-secondary-300)'}; border-width: 2px;"
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
          <label for={inputId} role="button">
            <UploadIcon
              classProp="my-auto"
              width={iconWidth}
              height={iconHeight}
              color={"var(--icon-primary-300)"}
            />
          </label>
          <input
            class="sparrow-choose-file-input visually-hidden"
            type="file"
            {value}
            id={inputId}
            accept={generateAcceptString()}
            on:change={(e) => {
              onChange(e, maxFileSize, supportedFileTypes);
            }}
          />
        </div>
      </div>
    {/if}
    {#if value.length === 0 || value.size === 0}
      <!-- Icon Uploader description only shows when no file is uploaded -->
      <span
        class="sparrow-input-label-desc sparrow-fs-18 ms-4"
        style="font-size:{labelDescriptionSize}; width: calc(100% - {width})"
        >{labelDescription}</span
      >
    {/if}
  </div>

  {#if !Array.isArray(value) && value.size > 0}
    <!-- Displays uploaded file preview -->
    <div class="sparrow-input-image-preview rounded d-flex gap-2">
      {#if value.bufferString}
        <img class="rounded p-2" src={base64ToURL(value)} alt="" />
      {:else}
        <img class="rounded p-2" src={imageDataToURL(value)} alt="" />
      {/if}
      <div class="align-items-end justify-content-end d-flex gap-2">
        <button on:click={editValue} class="edit-btn border-0 p-2 rounded">
          <EditIcon />
        </button>
        <button on:click={resetValue} class="del-btn border-0 p-2 rounded">
          <DeleteIcon />
        </button>
      </div>
    </div>
    <!-- Enables opiton to reupload the file preview-->
    <input
      class="sparrow-choose-file-input d-none overflow-hidden"
      type="file"
      id={inputId}
      accept={generateAcceptString()}
      on:change={(e) => {
        onChange(e, maxFileSize, supportedFileTypes);
      }}
    />
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
    color: var(--text-secondary-350);
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
    color: var(--text-primary-300);
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
  .sparrow-input-file-type {
    border: 1px solid var(--border-color);
  }
</style>
