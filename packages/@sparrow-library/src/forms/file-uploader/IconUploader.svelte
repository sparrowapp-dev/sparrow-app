<script lang="ts">
  import { DismissRegular, EditRegular } from "@sparrow/library/icons";
  import { base64ToURL, imageDataToURL } from "@sparrow/common/utils";
  import { Button, Spinner } from "../../ui";

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
  export let disabled = false;
  export let fileName: string = "";
  export let loading: boolean = false;
  export let handleCancel: () => void;
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
    const input = event.target as HTMLInputElement;
    const files = input?.files;
    if (!files || files.length === 0) return;
    const selectedFile = files[0];
    const name = selectedFile.name;
    fileName = name;
    onChange(event, maxFileSize, supportedFileTypes);
  };
  const truncateFileName = (name: string, length: number): string => {
    return name.length > length ? name.substring(0, length) + ".." : name;
  };
  const handleFileChange = (
    e: Event,
    maxFileSize: number,
    supportedFileTypes: string[],
  ) => {
    const input = e.target as HTMLInputElement;
    const files = input?.files;
    if (!files || files.length === 0) return;
    const selectedFile = files[0];
    const name = selectedFile.name;
    fileName = name;
    onChange(e, maxFileSize, supportedFileTypes);
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
        class="sparrow-file-input text-fs-14 p-2 w-100 px-auto {isDragOver
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
          if (!disabled) {
            isFocused = true;
          }
        }}
        on:blur={() => {
          if (!disabled) {
            isFocused = false;
          }
        }}
      >
        <div
          class="sparrow-choose-file-input-button d-flex justify-content-center"
        >
          {#if loading}
            <div class="d-flex row text-center justify-content-center">
              <div class="d-flex justify-content-center">
                <Spinner size={"48px"} />
              </div>
              <p class="upload-file-text" style="margin: 0px;">
                Uploading file...
              </p>
              <Button
                title="Cancel"
                type={"secondary"}
                size={"small"}
                onClick={handleCancel}
              />
            </div>
          {:else}
            <div class="d-flex text-center row justify-content-center">
              <slot />
              <input
                class="sparrow-choose-file-input visually-hidden"
                type="file"
                {value}
                id={inputId}
                placeholder={inputPlaceholder}
                accept={generateAcceptString()}
                {disabled}
                on:change={(e) => {
                  handleFileChange(e, maxFileSize, supportedFileTypes);
                }}
              />
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>

  {#if !Array.isArray(value) && value.size > 0}
    <div
      class="sparrow-input-image-preview d-flex gap-2 border-radius-4 align-items-center justify-content-center"
      style="border: {isError ? '2px' : '1px'} dashed {isError
        ? 'var(--border-ds-danger-300)'
        : 'var(--border-ds-surface-100)'};
      background-color: ${!disabled
        ? isError && isFocused
          ? 'var(--bg-ds-surface-400)'
          : 'transparent'
        : 'var(--bg-ds-surface-600)'};"
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
        <span
          class="ms-1 file-name-text text-fs-12"
          style="color: {isError
            ? 'var(--text-ds-danger-300)'
            : 'var(--text-ds-neutral-50)'};"
          >{truncateFileName(fileName, 8)}</span
        >
        <div class="ms-auto d-flex justify-content-center pe-1">
          <Button
            type="teritiary-regular"
            startIcon={EditRegular}
            size="extra-small"
            onClick={editValue}
          />
          <Button
            type="teritiary-regular"
            startIcon={DismissRegular}
            size="extra-small"
            onClick={resetValue}
          />
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
    background-color: var(--bg-ds-surface-400);
    border-radius: 4px;
    outline: none;
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
      cursor: pointer;
    }

    &:active {
      border: 1px dashed var(--border-ds-primary-300) !important;
      background-color: var(--bg-ds-surface-500);
      cursor: pointer;
    }

    &:focus-visible {
      border: 2px dashed var(--border-ds-primary-300) !important;
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
  .sparrow-choose-file-input::file-selector-button {
    background-color: transparent;
    color: var(--bg-ds-neutral-400);
    border: 0;
  }

  .sparrow-input-image-preview > img {
    width: 80px;
    border: 1px solid #313233;
    height: 80px;
    background-color: var(--bg-ds-surface-400);
  }
  .sparrow-input-image-preview {
    height: 164px;
    min-width: 240px;
    max-width: 540px;
    gap: 4px;
    border-radius: 4px;
    border: 1px dashed var(--border-ds-surface-100);
    background-color: var(--bg-ds-surface-400);
    outline: none;
    transition:
      border 0.2s ease-in-out,
      background-color 0.2s ease-in-out;
    &:hover {
      border: 1px dashed var(--border-ds-neutral-300) !important;
      cursor: pointer;
    }
    &:active {
      border: 1px dashed var(--border-ds-primary-300) !important;
      background-color: var(--bg-ds-surface-500);
      cursor: pointer;
    }
    &:focus {
      border: 1px dashed var(--border-ds-primary-300) !important;
      background-color: var(--bg-ds-surface-500);
      cursor: pointer;
    }
    &:focus-visible {
      border: 2px dashed var(--border-ds-primary-300) !important;
    }
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
    font-family: "Inter", sans-serif;
    font-weight: 400px;
  }
  .upload-file-text {
    font-family: "Inter", sans-serif;
    font-weight: 400px;
    font-size: 14px;
    color: var(--text-ds-neutral-400);
  }

  .edit-btn,
  .del-btn {
    background-color: transparent;
    width: 28px;
    height: 28px;
    transition: background-color 0.3s ease;
  }
  .label-header-text.support-label-text.help-label-text.help-label-error {
    font-family: "Inter", sans-serif;
    font-weight: 400;
  }
  .label-header-text {
    font-size: 14px;
    color: var(--text-ds-neutral-200);
  }
  .support-label-text {
    font-size: 12px;
    color: var(--text-ds-neutral-400);
  }
  .help-label-text {
    font-size: 12px;
    color: var(--text-ds-neutral-400);
  }
  .help-label-error {
    font-size: 12px;
    color: var(--text-ds-danger-300);
  }
</style>
