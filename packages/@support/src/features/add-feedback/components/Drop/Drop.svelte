<script lang="ts">
  import { InfoIcon, UploadIcon } from "@sparrow/library/icons";

  export let labelDescription = "";
  export let inputId: string;
  export let inputPlaceholder: string;
  export let supportedFileTypes: string[] = [];
  export let infoMessage = "";

  export let onChange: (e: any) => void;
  let isDragOver = false;

  const generateAcceptString = (): string => {
    const acceptString = supportedFileTypes.map((type) => `${type}`).join(", ");
    return acceptString;
  };

  const handleDrop = (event: DragEvent) => {
    onChange(event);
  };

  let isInfoTooltipHovered = false;
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
        handleDrop(e);
      }}
    >
      <div
        class="sparrow-choose-file-input-button d-flex align-items-stretch position-relative"
      >
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
        <span
          style="width: 50px; padding-left: 15px; padding-top: 13px;"
          on:mouseenter={() => {
            isInfoTooltipHovered = true;
          }}
          on:mouseleave={() => {
            isInfoTooltipHovered = false;
          }}
        >
          <InfoIcon
            height={"17px"}
            width={"17px"}
            color={"var(--text-secondary-250)"}
          />
        </span>
        <input
          class="sparrow-choose-file-input visually-hidden"
          type="file"
          multiple
          value=""
          id={inputId}
          placeholder={inputPlaceholder}
          on:change={(e) => {
            onChange(e);
          }}
          accept={generateAcceptString()}
        />
        {#if isInfoTooltipHovered}
          <div
            class="p-2 position-absolute text-fs-12 bg-tertiary-650 border-radius-2"
            style="top:10px; right: 0; width: 243px; transform: translateY(-100%);"
          >
            <div class="pb-2">
              <span
                ><InfoIcon
                  height={"17px"}
                  width={"17px"}
                  color={"var(--text-primary-300)"}
                /></span
              >
              <span class="ps-2 text-fs-12 text-primary-300">Information</span>
            </div>
            <p class="mb-0">
              {@html infoMessage}
            </p>
          </div>
        {/if}
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
