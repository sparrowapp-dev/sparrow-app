<script lang="ts">
  import { UploadIcon } from "@library/icons";

  export let labelDescription = "";
  export let inputId: string;
  export let inputPlaceholder: string;
  export let maxFileSize: number;
  export let supportedFileTypes: string[] = [];

  export let onChange: (
    e: any,
    maxFileSize: number,
    supportedFileTypes: string[],
  ) => void;
  export let height = "auto";
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
    <!-- {#if value.length == 0 || value.size === 0} -->
    <div
      style="width:100%; !important;  !important;  border-width: 2px;"
      class="bg-tertiary-300 sparrow-file-input w-100 px-auto {isDragOver &&
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
      <div class="sparrow-choose-file-input-button d-flex align-items-stretch">
        <label
          for={inputId}
          style="padding-left: 15px; padding-top: 15px; padding-bottom: 15px;"
        >
          <UploadIcon
            width={"18px"}
            height={"18px"}
            color={"var(--bg-primary-300)"}
          />
        </label>
        <label
          for={inputId}
          class="ps-3 w-100 d-flex text-fs-12 align-items-center text-tertiary-100"
        >
          {labelDescription}
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
