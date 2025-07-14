<script lang="ts">
  import {
    CloudArrowUpRegular,
    ImageRegular,
    InfoIcon,
    UploadIcon,
  } from "@sparrow/library/icons";

  export let labelDescription = "";
  export let inputId: string;
  export let inputPlaceholder: string;
  export let supportedFileTypes: string[] = [];
  export let infoMessage = "";
  export let width = "100%";
  export let height = "auto";
  export let iconHeight = 12;
  export let iconWidth = 12;

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
      style="width:{width} !important; height:{height} !important;  border: 1px dashed var(--border-ds-surface-100)'; border-width: 1px; cursor: pointer;"
      class="sparrow-file-input w-100 px-auto bg-tertiary-300 {isDragOver &&
        'opacity-75'}"
      on:click={() => {
        document.getElementById(inputId)?.click();
      }}
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
        class="uploader"
        style="display: flex;justify-content:center;align-items:center; position:relative;top:12px; cursor:pointer;"
      >
        <label for={inputId} class="d-flex" style="cursor: pointer;">
          <CloudArrowUpRegular
            size={"28px"}
            color={"var(--bg-ds-neutral-400)"}
          />
        </label>
      </div>
      <div
        class="sparrow-choose-file-input-button d-flex justify-content-center"
      >
        <span
          style="color: var(--text-ds-neutral-200); text-ds-font-weight-regular text-ds-line-height-143"
          >Drag & drop or</span
        >
        <label
          for={inputId}
          class="sparrow-choose-file-label ps-1"
          style="color: var(--text-ds-primary-300); cursor: pointer;"
          >Upload File</label
        ><span style="padding-left: 4px; color:var(--text-ds-neutral-200)"
          >here</span
        >
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
        <!-- {#if isInfoTooltipHovered}
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
        {/if} -->
      </div>
      <div
        style="display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 12px;"
      >
        <div style="display: flex; align-items: center;">
          <ImageRegular size="16px" color={"var(--bg-ds-neutral-400)"} />
          <p
            style="color: var(--text-ds-neutral-400); margin-bottom: 0; padding-left: 4px;"
            class="text-ds-font-weight-medium text-ds-line-height-130 text-ds-font-size-12"
          >
            SVG
          </p>
        </div>

        <!-- Vertical Line -->
        <div
          style="width: 1px; height: 16px; background-color: var(--text-ds-neutral-400);"
        ></div>
        <div style="display: flex; align-items: center;">
          <ImageRegular size="16px" color={"var(--bg-ds-neutral-400)"} />
          <p
            style="color: var(--text-ds-neutral-400); margin-bottom: 0; padding-left: 4px;"
            class="text-ds-font-weight-medium text-ds-line-height-130 text-ds-font-size-12"
          >
            PNG
          </p>
        </div>

        <!-- Vertical Line -->
        <div
          style="width: 1px; height: 16px; background-color: var(--text-ds-neutral-400);"
        ></div>

        <div style="display: flex; align-items: center;">
          <ImageRegular size="16px" color={"var(--bg-ds-neutral-400"} />
          <p
            style="color: var(--text-ds-neutral-400); margin-bottom: 0; padding-left: 4px;"
            class="text-ds-font-weight-medium text-ds-line-height-130 text-ds-font-size-12"
          >
            JPG
          </p>
        </div>

        <!-- Vertical Line -->
        <div
          style="width: 1px; height: 16px; background-color: var(--text-ds-neutral-400);"
        ></div>

        <div style="display: flex; align-items: center;">
          <ImageRegular size="16px" color={"var(--bg-ds-neutral-400"} />
          <p
            style="color: var(--text-ds-neutral-400); margin-bottom: 0; padding-left: 4px;"
            class="text-ds-font-weight-medium text-ds-line-height-130 text-ds-font-size-12"
          >
            JPEG
          </p>
        </div>
      </div>
    </div>
    <!-- {/if} -->
  </div>
</div>

<style lang="scss">
  .uploader:hover {
    cursor: pointer;
  }
  .sparrow-input-label {
    font-size: var(--base-text);
  }
  .sparrow-text-input-container:hover {
    border: 1px dashed var(--border-ds-neutral-300);
    border-radius: 5px;
  }
  .sparrow-text-input-container:active {
    border: 1px dashed var(--border-ds-primary-300);
  }
  .sparrow-input-required {
    color: var(--dangerColor);
  }
  .sparrow-file-input {
    outline: none;
    border-radius: 4px;
    font-size: var(--base-text);
    background-color: var(--bg-ds-surface-400);
    // padding-top: 20px;
  }
  .sparrow-file-input:hover {
    cursor: pointer;
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

  .sparrow-choose-file-input-button {
    margin-top: 24px;
    margin-bottom: 20px;
  }
</style>
