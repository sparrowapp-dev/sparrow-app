<script lang="ts">
  import { DragDrop } from "@library/ui";
  import { ICON_CONFIG } from "../../../../constants";
  import { IconUploader } from "..";
  export let uploadTeamIcon;
  export let onUpdateTeam;

  enum TeamProperty {
    IMAGE = "image",
    NAME = "name",
    DESCRIPTION = "description",
  }

  const handleLogoInputChange = (
    e: any,
    maxSize: number,
    supportedFileTypes: string[],
  ) => {
    const targetFile = e?.target?.files || e?.dataTransfer?.files;

    if (targetFile && targetFile[0].size > maxSize * 1024) {
      uploadTeamIcon.file.showFileSizeError = true;
      uploadTeamIcon.file.showFileTypeError = false;
      uploadTeamIcon.file.invalid = true;
      return;
    }
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
    uploadTeamIcon.file.showFileSizeError = false;
    uploadTeamIcon.file.showFileTypeError = false;
    uploadTeamIcon.file.invalid = false;
    uploadTeamIcon.file.value = targetFile && targetFile[0];
    onUpdateTeam(TeamProperty.IMAGE);
  };
  const handleLogoReset = (e: any) => {
    uploadTeamIcon.file = {
      value: [],
      invalid: false,
      showFileSizeError: false,
      showFileTypeError: false,
    };
    onUpdateTeam(TeamProperty.IMAGE);
  };
  const handleLogoEdit = (e: Event) => {
    const uploadFileInput = document.getElementById(
      "upload-team-icon-file-input",
    );
    uploadFileInput?.click();
  };
</script>

<div class="col-12">
  <div>
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
      inputPlaceholder="Drag and Drop or"
      supportedFileTypes={ICON_CONFIG.FILE_TYPES}
      showFileSizeError={uploadTeamIcon.file.showFileSizeError}
      showFileTypeError={uploadTeamIcon.file.showFileTypeError}
      width={"80px"}
      height={"80px"}
    />
  </div>
  {#if uploadTeamIcon.file.showFileTypeError}
    <p class=" text-danger-200 mt-2 text-fs-12">
      {ICON_CONFIG.WRONG_FILE_ERROR_MESSAGE}
    </p>
  {:else if uploadTeamIcon.file.showFileSizeError}
    <p class=" text-danger-200 mt-2 text-fs-12">
      {ICON_CONFIG.SIZE_EXCEED_ERROR_MESSAGE}
    </p>
  {/if}
</div>
