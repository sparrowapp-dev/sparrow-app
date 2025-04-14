<script lang="ts">
  import { FileType } from "@sparrow/library/assets";
  import { SvelteComponent } from "svelte";
  import { Button } from "../button";

  export let titleName: string = "";
  export let descriptionName: string = "";
  export let fileSizeError: boolean = false;
  export let fileSizeErrorMessage: string = "";
  export let iconComponent: typeof SvelteComponent;
  export let fileTypeError: boolean = false;
  export let fileTypeErrorMessage: string = "";
  export let fileTypes: string[] = [];
  export let maxFileSizeText: string = "";
  export let isUploadRequired: boolean = false;
  export let helpingText: string = "";
</script>

<div>
  <div class="pb-1 upload-container">
    <!-- Title -->
    {#if titleName}
      <div class="d-flex align-items-center gap-1">
        <span class="upload-file-title">
          {titleName}
        </span>
        {#if isUploadRequired}
          <span class="text-danger" style="margin: 0;">*</span>
        {/if}
      </div>
    {/if}

    <!-- Description -->
    {#if descriptionName}
      <p class="mb-2 text-fs-12 upload-file-description">
        {descriptionName}
      </p>
    {/if}

    <slot />

    <!-- Error Messages -->
    <div class="d-flex col justify-content-between">
      <div>
        {#if fileSizeError}
          <div class="d-flex col gap-1">
            {#if iconComponent}
              <Button
                type="teritiary-regular"
                startIcon={iconComponent}
                size="extra-small"
              />
            {/if}
            <p class="mb-2 text-fs-12 message-error-text">
              {fileSizeErrorMessage}
            </p>
          </div>
        {:else if fileTypeError}
          <div class="d-flex col gap-1">
            {#if iconComponent}
              <Button
                type="teritiary-regular"
                startIcon={iconComponent}
                size="extra-small"
              />
            {/if}
            <p class="mb-2 text-fs-12 message-error-text">
              {fileTypeErrorMessage}
            </p>
          </div>

          <!-- Supported File Types -->
          <div class="d-flex">
            {#each fileTypes as fileType (fileType)}
              <span class="me-2">
                <FileType {fileType} />
              </span>
            {/each}
          </div>
        {:else if helpingText}
          <div>
            <p style="margin:0px;" class="help-label-text">{helpingText}</p>
          </div>
        {/if}
      </div>

      <div class="upload-max-file-content">
        {#if maxFileSizeText}
          <p
            class={`mb-2 text-fs-12 ${fileSizeError ? "upload-max-file-text-error" : "upload-max-file-text"}`}
          >
            Max file size: {maxFileSizeText}MB
          </p>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .upload-container {
    max-width: 540px;
    min-width: 240px;
  }
  .upload-file-title {
    font-family: "Inter", sans-serif;
    font-weight: 400;
    line-height: 20.02px;
    font-size: 14px;
    text-align: left;
    color: var(--text-ds-neutral-200);
  }
  .upload-file-description {
    color: var(--text-ds-neutral-400);
    font-weight: 400;
    line-height: 18px;
  }
  .message-error-text {
    color: var(--text-ds-danger-300);
    word-break: break-word;
  }
  .upload-max-file-content {
    font-family: "Inter", sans-serif;
    line-height: 18px;
    white-space: nowrap;
  }
  .upload-max-file-text {
    color: var(--text-ds-neutral-400);
  }
  .upload-max-file-text-error {
    color: var(--text-ds-danger-300);
  }
  .help-label-text {
    font-size: 12px;
    color: var(--text-ds-neutral-400);
  }
</style>
