<script lang="ts">
  /**
   * Components
   */
  import { IconUploader, FileType } from "..";
  import { OSDetector } from "@sparrow/common/utils";

  /**
   * Constants
   */
  import { ICON_CONFIG } from "../../constants";

  /**
   * Types
   */
  import type { TeamForm } from "../../types";
  import { platform } from "@tauri-apps/plugin-os";
  import { onMount } from "svelte";

  /**
   * Exports
   */
  export let teamForm: TeamForm;

  /**
   * Data
   */
  const iconUploaderId: string = "team-file-input";

  let os = "";

  const osDetector = new OSDetector();
  onMount(() => {
    os = osDetector.getOS();
  });

  /**
   * Validates the uploaded file based on size and type
   * @param file - The uploaded file
   * @param maxSize - Maximum allowed file size in KB
   * @param supportedFileTypes - List of supported file extensions
   * @returns - Object containing validation results
   */
  const validateFile = (
    file: File,
    maxSize: number,
    supportedFileTypes: string[],
  ) => {
    const errors = {
      size: false,
      type: false,
    };

    const ONE_MB = 1024;
    if (file.size > maxSize * ONE_MB) {
      errors.size = true;
    }

    const fileType = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!supportedFileTypes.includes(fileType)) {
      errors.type = true;
    }

    return errors;
  };

  /**
   * Handles teams icon upload
   * @param e - Event file meta data
   * @param maxSize - Maximum allowed file size in KB
   * @param supportedFileTypes - List of supported file extensions
   */
  const handleLogoInputChange = (
    e: Event,
    maxSize: number,
    supportedFileTypes: string[],
  ) => {
    const input = e.target as HTMLInputElement;
    const targetFiles = input.files || (e as DragEvent).dataTransfer?.files;
    const file = targetFiles?.[0];

    if (!file) return;

    //This need to be revisited , this is hack we are providing right now

    // Explanation :- Here this check is for mac , like the validation is missing in mac when we are uploading pdf file
    // so the issue there is when we are uploading the PDF file then in mac it is taking it as a jpeg file with name starts with tempImage + some randowm word
    // so we have wrote a check for it that if the os is macos and the file name it start with this ("tempImage")  then we are considering it as pdf file and giving the
    // same error which we used to given when user upload pdf file
    if (file?.name.indexOf("tempImage") == 0 && os == "macos") {
      teamForm.file.showFileTypeError = true;
      teamForm.file.invalid = true;
      return;
    }

    const { size, type } = validateFile(file, maxSize, supportedFileTypes);

    teamForm.file.showFileSizeError = size;
    teamForm.file.showFileTypeError = type;
    teamForm.file.invalid = size || type;

    if (!teamForm.file.invalid) {
      teamForm.file.value = file;
    }
  };

  /**
   * Clears the uploaded team icon
   * @param e - Event meta data
   */
  const handleLogoReset = (e: Event) => {
    teamForm.file.value = [];
  };

  /**
   * Invokes the dialog box to open a new upload window
   * @param e - Event meta data
   */
  const handleLogoEdit = (e: Event) => {
    const fileInput = document.getElementById(
      iconUploaderId,
    ) as HTMLInputElement;
    fileInput?.click();
  };
</script>

<div class="pb-1">
  <!-- 
    -- Title 
  -->
  <span class="text-fs-14 text-secondary-1000">{ICON_CONFIG.TITLE}</span>

  <!-- 
    -- Description 
  -->
  {#if !(!Array.isArray(teamForm.file.value) && teamForm.file.value.size > 0)}
    <p class="mb-2 text-fs-12 text-secondary-200">
      {ICON_CONFIG.DESCRIPTION}
    </p>
  {/if}

  <!-- 
    -- Icon Uploader 
  -->
  <IconUploader
    value={teamForm.file.value}
    maxFileSize={ICON_CONFIG.MAX_FILE_SIZE_KB}
    onChange={handleLogoInputChange}
    resetValue={handleLogoReset}
    editValue={handleLogoEdit}
    inputId={iconUploaderId}
    inputPlaceholder={ICON_CONFIG.PLACEHOLDER}
    supportedFileTypes={ICON_CONFIG.FILE_TYPES}
    isError={teamForm.file.invalid}
  />

  <!-- 
    -- Error Messages 
  -->
  <div>
    {#if teamForm.file.showFileSizeError}
      <p class="mb-2 mt-1 text-fs-12 text-danger-200">
        {ICON_CONFIG.SIZE_EXCEED_ERROR_MESSAGE}
      </p>
    {:else if teamForm.file.showFileTypeError}
      <p class="mb-2 mt-1 text-fs-12 text-danger-200">
        {ICON_CONFIG.WRONG_FILE_ERROR_MESSAGE}
      </p>
      <!-- 
        -- Supportes File Types Button 
      -->
      <div class="d-flex">
        {#each ICON_CONFIG.FILE_TYPES as fileType (fileType)}
          <span class="me-4">
            <FileType {fileType} />
          </span>
        {/each}
      </div>
    {/if}
  </div>
</div>
