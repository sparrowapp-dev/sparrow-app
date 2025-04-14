<script lang="ts">
  import { ICON_CONFIG } from "../../../../constants";
  import { TeamPropertyEnum } from "../../../../types";
  import type { UpdateTeamIcon as IUpdateTeamIcon } from "../../../../types";
  import { OSDetector } from "@sparrow/common/utils";
  import { UploadArea } from "@sparrow/library/ui";
  import { IconUploader } from "@sparrow/library/forms";
  import { ImageRegular } from "@sparrow/library/icons";
  import { CloudArrowUpRegular } from "@sparrow/library/icons";

  export let uploadTeamIcon: IUpdateTeamIcon;
  export let onUpdateTeam: (property: TeamPropertyEnum) => void;

  import { onMount } from "svelte";
  let os = "";
  const osDetector = new OSDetector();
  onMount(() => {
    os = osDetector.getOS();
  });

  /**
   * Handles the change event for the logo input.
   * Validates the file size and type before updating the team icon.
   *
   * @param  e - The event triggered by the input change.
   * @param  maxSize - The maximum file size allowed in KB.
   * @param  supportedFileTypes - The list of supported file types.
   */
  const handleLogoInputChange = (
    e: any,
    maxSize: number,
    supportedFileTypes: string[],
  ) => {
    const targetFile = e?.target?.files || e?.dataTransfer?.files;

    //This need to be revisited , this is hack we are providing right now

    // Explanation :- Here this check is for mac , like the validation is missing in mac when we are uploading pdf file
    // so the issue there is when we are uploading the PDF file then in mac it is taking it as a jpeg file with name starts with tempImage + some randowm word
    // so we have wrote a check for it that if the os is macos and the file name it start with this ("tempImage")  then we are considering it as pdf file and giving the
    // same error which we used to given when user upload pdf file

    if (
      targetFile &&
      targetFile[0]?.name.indexOf("tempImage") == 0 &&
      os == "macos"
    ) {
      uploadTeamIcon.file.showFileTypeError = true;
      uploadTeamIcon.file.invalid = true;
      return;
    }

    /**
     * Validate file size.
     */
    if (targetFile && targetFile[0].size > maxSize * 1024) {
      uploadTeamIcon.file.showFileSizeError = true;
      uploadTeamIcon.file.showFileTypeError = false;
      uploadTeamIcon.file.invalid = true;
      return;
    }
    /**
     * Validate file type.
     */
    const fileType = `.${(targetFile && targetFile[0]?.name)
      .split(".")
      .pop()
      .toLowerCase()}`;
    if (!supportedFileTypes.includes(fileType)) {
      uploadTeamIcon.file.showFileTypeError = true;
      uploadTeamIcon.file.showFileSizeError = false;
      uploadTeamIcon.file.invalid = true;
      return;
    }
    /**
     * Uploading file.
     */
    uploadTeamIcon.file.showFileSizeError = false;
    uploadTeamIcon.file.showFileTypeError = false;
    uploadTeamIcon.file.invalid = false;
    uploadTeamIcon.file.value = targetFile && targetFile[0];
    onUpdateTeam(TeamPropertyEnum.IMAGE);
  };

  /**
   * Resets the team icon to its initial state.
   *
   * @param e - The event triggered by the reset action.
   */
  const handleLogoReset = (e: any) => {
    uploadTeamIcon.file = {
      value: [],
      invalid: false,
      showFileSizeError: false,
      showFileTypeError: false,
    };
    onUpdateTeam(TeamPropertyEnum.IMAGE);
  };

  /**
   * Initiates the logo edit action by triggering a click on the hidden file input.
   *
   * @param  e - The event triggered by the edit action.
   */
  const handleLogoEdit = (e: Event) => {
    const uploadFileInput = document.getElementById(
      "upload-team-icon-file-input",
    );
    uploadFileInput?.click();
  };
  const handleExtraDot = (value: string) => {
    if (value.length > 0) {
      value = value.charAt(0) === "." ? value.slice(1) : value;
      return value.toUpperCase();
    }
    return value.toUpperCase();
  };
</script>

<div class="">
  <div>
    <UploadArea
      descriptionName={ICON_CONFIG.DESCRIPTION}
      maxFileSizeText={"2"}
      fileTypes={ICON_CONFIG.FILE_TYPES}
      fileSizeError={uploadTeamIcon.file.showFileSizeError}
      fileSizeErrorMessage={ICON_CONFIG.SIZE_EXCEED_ERROR_MESSAGE}
      fileTypeErrorMessage={ICON_CONFIG.WRONG_FILE_ERROR_MESSAGE}
      fileTypeError={uploadTeamIcon.file.showFileTypeError}
    >
      <IconUploader
        value={uploadTeamIcon.file.value}
        supportedFileTypes={ICON_CONFIG.FILE_TYPES}
        onChange={handleLogoInputChange}
        resetValue={handleLogoReset}
        editValue={handleLogoEdit}
        inputId={"upload-team-icon-file-input"}
        maxFileSize={ICON_CONFIG.MAX_FILE_SIZE_KB}
        fileName={"Profile"}
        isError={uploadTeamIcon.file.showFileSizeError ||
          uploadTeamIcon.file.showFileTypeError}
      >
        <div>
          <label
            for={"upload-team-icon-file-input"}
            class="d-flex justify-content-center"
          >
            <CloudArrowUpRegular
              size={"28px"}
              color={"var(--icon-ds-neutral-400)"}
            />
          </label>
          <label
            for={"upload-team-icon-file-input"}
            class="sparrow-choose-file-label my-2 ps-2"
            >Drag & Drop or <span class="sparrow-upload-text text-fs-14"
              >Upload File</span
            > here</label
          >
          <div class="d-flex justify-content-center text-fs-12">
            <div
              class="file-type-container-one d-flex align-items-center pe-2 pt-1 pb-1"
            >
              <ImageRegular
                size={"16px"}
                color={"var(--icon-ds-neutral-400)"}
              />
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
                <span class="file-type-text ms-1"
                  >{handleExtraDot(fileType)}</span
                >
              </div>
            {/each}
            <div class="d-flex align-items-center ps-2 pt-1 pb-1">
              <ImageRegular
                size={"16px"}
                color={"var(--icon-ds-neutral-400)"}
              />
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
</div>

<style>
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
