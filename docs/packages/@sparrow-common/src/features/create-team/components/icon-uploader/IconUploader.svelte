<script lang="ts">
  import { DeleteIcon, EditIcon, UploadIcon } from "@sparrow/library/assets";
  import { base64ToURL, imageDataToURL } from "@sparrow/common/utils";

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
</script>

<div class="sparrow-text-input-container mb-2">
  <div class="d-flex">
    {#if value.length == 0 || value.size === 0}
      <div
        style="width:{width} !important; height:{height} !important;  border: 3px dashed {isError
          ? 'var(--border-danger-200)'
          : 'var(--border-secondary-200)'}; border-width: 2px;"
        class="sparrow-file-input w-100 px-auto bg-tertiary-300 {isDragOver &&
          'opacity-75 '}"
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
          >{inputPlaceholder}</span
        >

        <div
          class="sparrow-choose-file-input-button d-flex justify-content-center my-4"
        >
          <label for={inputId} class="d-flex">
            <UploadIcon
              classProp="my-auto"
              width={iconWidth}
              height={iconHeight}
              color={"var(--icon-primary-300)"}
            />
          </label>

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
  </div>

  {#if !Array.isArray(value) && value.size > 0}
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
  .sparrow-file-input-error-text {
    color: var(--dangerColor);
    font-size: var(--small-text);
  }

  .sparrow-input-file-type {
    border: 1px solid var(--border-color);
  }
</style>
