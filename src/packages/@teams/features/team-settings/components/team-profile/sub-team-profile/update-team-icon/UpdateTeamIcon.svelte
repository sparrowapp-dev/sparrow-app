<script lang="ts">
  import { ICON_CONFIG } from "../../../../constants";
  import { IconUploader } from "..";
  import { TeamPropertyEnum } from "../../../../types";
  import type { UpdateTeamIcon as IUpdateTeamIcon } from "../../../../types";
  export let uploadTeamIcon: IUpdateTeamIcon;
  export let onUpdateTeam: (property: TeamPropertyEnum) => void;

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
</script>

<div class="pb-3">
  <div>
    <!-- IconUploader component for uploading team icons -->
    <IconUploader
      value={uploadTeamIcon.file.value}
      maxFileSize={ICON_CONFIG.MAX_FILE_SIZE_KB}
      onChange={handleLogoInputChange}
      iconHeight={30}
      iconWidth={30}
      resetValue={handleLogoReset}
      editValue={handleLogoEdit}
      labelDescription={ICON_CONFIG.DESCRIPTION}
      labelDescriptionSize={"14px"}
      inputId="upload-team-icon-file-input"
      supportedFileTypes={ICON_CONFIG.FILE_TYPES}
      showFileSizeError={uploadTeamIcon.file.showFileSizeError}
      showFileTypeError={uploadTeamIcon.file.showFileTypeError}
      width={"80px"}
      height={"80px"}
    />
  </div>
  {#if uploadTeamIcon.file.showFileTypeError}
    <!-- Error message for unsupported file type -->
    <p class=" text-danger-200 mt-2 text-fs-12">
      {ICON_CONFIG.WRONG_FILE_ERROR_MESSAGE}
    </p>
  {:else if uploadTeamIcon.file.showFileSizeError}
    <!-- Error message for file size exceeding the limit -->
    <p class=" text-danger-200 mt-2 text-fs-12">
      {ICON_CONFIG.SIZE_EXCEED_ERROR_MESSAGE}
    </p>
  {/if}
</div>
