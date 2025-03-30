<script lang="ts">
  /**
   * Components
   */
  import IconUploader from "../../../../../../@sparrow-library/src/forms/file-uploader/IconUploader.svelte";
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
  import type { SvelteComponent } from "svelte";
  import { UploadArea } from "@sparrow/library/ui";
  import { ImageRegular } from "@sparrow/library/icons";
  import { CloudArrowUpRegular } from "@sparrow/library/icons";

  /**
   * Exports
   */
  export let teamForm: TeamForm;
  export let maxFileSizeText: number = 2;
  export let iconComponent: typeof SvelteComponent;

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

  // This will be remove the File type starting Dot and it Capital Word.
  const handleExtraDot = (value: string) => {
    if (value.length > 0) {
      value = value.charAt(0) === "." ? value.slice(1) : value;
      return value.toUpperCase();
    }
    return value.toUpperCase();
  };
</script>

<div class="pb-1">
  <UploadArea
    titleName={ICON_CONFIG.TITLE}
    descriptionName={ICON_CONFIG.DESCRIPTION}
    fileValue={teamForm.file.value}
    fileSize={teamForm.file.value.size}
    fileSizeError={teamForm.file.showFileSizeError}
    fileSizeErrorMessage={ICON_CONFIG.SIZE_EXCEED_ERROR_MESSAGE}
    fileTypeError={teamForm.file.showFileTypeError}
    fileTypeErrorMessage={ICON_CONFIG.WRONG_FILE_ERROR_MESSAGE}
    fileTypes={ICON_CONFIG.FILE_TYPES}
    {maxFileSizeText}
    {iconComponent}
  >
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
      fileName={teamForm.file.value?.name}
    >
      <div>
        <label for={iconUploaderId} class="d-flex justify-content-center">
          <CloudArrowUpRegular
            size={"28px"}
            color={"var(--icon-ds-neutral-400)"}
          />
        </label>
        <label for={iconUploaderId} class="sparrow-choose-file-label my-2 ps-2"
          >Drag & Drop or <span class="sparrow-upload-text text-fs-14"
            >Upload File</span
          > here</label
        >
        <div
          for={iconUploaderId}
          class="d-flex justify-content-center text-fs-12"
        >
          <div
            class="file-type-container-one d-flex align-items-center pe-2 pt-1 pb-1"
          >
            <ImageRegular size={"16px"} color={"var(--icon-ds-neutral-400)"} />
            <span class="file-type-text ms-1">
              {handleExtraDot(ICON_CONFIG.FILE_TYPES[0])}
            </span>
          </div>
          {#each ICON_CONFIG.FILE_TYPES.slice(1, -1) as fileType, index}
            <div
              class="file-type-container-two d-flex align-items-center px-2 pt-1 pb-1"
              key={index}
            >
              <ImageRegular
                size={"16px"}
                color={"var(--icon-ds-neutral-400)"}
              />
              <span class="file-type-text ms-1">{handleExtraDot(fileType)}</span
              >
            </div>
          {/each}
          <div class="d-flex align-items-center ps-2 pt-1 pb-1">
            <ImageRegular size={"16px"} color={"var(--icon-ds-neutral-400)"} />
            <span class="file-type-text ms-1">
              {handleExtraDot(
                ICON_CONFIG.FILE_TYPES[ICON_CONFIG.FILE_TYPES.length - 1],
              )}
            </span>
          </div>
        </div>
      </div>
    </IconUploader>
  </UploadArea>
</div>

<style lang="scss">
  .upload-file-title {
    font-family: "Inter", sans-serif;
    font-weight: 400;
    line-height: 20.02px;
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
  .sparrow-choose-file-label {
    color: var(--text-ds-neutral-400);
  }
</style>
