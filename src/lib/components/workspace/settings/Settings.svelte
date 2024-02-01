<script lang="ts">
  import FileInput from "$lib/components/inputs/FileInput.svelte";
  import { user } from "$lib/store";
  import type {
    Team,
    TeamRepositoryMethods,
    TeamServiceMethods,
  } from "$lib/utils/interfaces";

  export let openTeam: Team;
  export let teamServiceMethods: TeamServiceMethods;
  export let teamRepositoryMethods: TeamRepositoryMethods;
  let uploadTeamIcon = {
    file: {
      value: [],
      invalid: false,
      showFileSizeError: false,
      showFileTypeError: false,
    },
  };
  if (openTeam?.logo) {
    uploadTeamIcon.file.value = openTeam?.logo;
  }

  const handleUpdateTeam = async (property) => {
    let data;
    if (property === "image") {
      data = {
        image: uploadTeamIcon.file.value,
      };
    }
    const response = await teamServiceMethods.updateTeam(openTeam.teamId, data);
    teamRepositoryMethods.modifyTeam(openTeam.teamId, response);
  };

  const handleLogoInputChange = (
    e: any,
    maxSize: number,
    supportedFileTypes: string[],
  ) => {
    const targetFile = e?.target?.files;
    const dataTransferFile = e?.dataTransfer?.files;
    if (
      (targetFile && targetFile[0].size > maxSize * 1024) ||
      (dataTransferFile && dataTransferFile[0].size > maxSize * 1024)
    ) {
      uploadTeamIcon.file.showFileSizeError = true;
      uploadTeamIcon.file.invalid = true;
      return;
    }
    const fileType = `.${(
      (targetFile && targetFile[0]?.name) ||
      (dataTransferFile && dataTransferFile[0]?.name)
    )
      .split(".")
      .pop()
      .toLowerCase()}`;
    if (!supportedFileTypes.includes(fileType)) {
      uploadTeamIcon.file.showFileTypeError = true;
      uploadTeamIcon.file.invalid = true;
      return;
    }
    uploadTeamIcon.file.showFileSizeError = false;
    uploadTeamIcon.file.showFileTypeError = false;
    uploadTeamIcon.file.invalid = false;
    uploadTeamIcon.file.value =
      (targetFile && targetFile[0]) ||
      (dataTransferFile && dataTransferFile[0]);
    handleUpdateTeam("image");
  };
  const handleLogoReset = (e: any) => {
    uploadTeamIcon.file.value = [];
  };
  const handleLogoEdit = (e: any) => {
    const uploadFileInput = document.getElementById(
      "upload-team-icon-file-input",
    );
    uploadFileInput.click();
  };
</script>

<section>
  <div class="container-fluid">
    <div class="row">
      <div class="col-3">
        <div class="settings-list w-30">
          <button> Team Profile </button>
        </div>
      </div>
      <div class="col-9">
        <div class="settings-content w-70">
          <div class="row">
            <div class="col-12">
              <div>
                <FileInput
                  value={uploadTeamIcon.file.value}
                  maxFileSize={100}
                  onChange={handleLogoInputChange}
                  resetValue={handleLogoReset}
                  editValue={handleLogoEdit}
                  labelText="Logo"
                  labelDescription="Drag and drop your image. We recommend that you upload an image with square aspect ratio.The image size should not be more than 100 KB. Supported formats are .jpg, .jpeg, .png "
                  inputId="upload-team-icon-file-input"
                  inputPlaceholder="Drag and Drop or"
                  isRequired={false}
                  supportedFileTypes={[".png", ".jpg", ".jpeg"]}
                  showFileSizeError={uploadTeamIcon.file.showFileSizeError}
                  showFileTypeError={uploadTeamIcon.file.showFileTypeError}
                  fileTypeError="This file type is not supported. Please reupload in any of the following file formats."
                  fileSizeError="The size of the file you are trying to upload is more than 100 KB."
                />
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-2">
              <p class="team-title">Team Name</p>
            </div>
            <div class="col-10"><p>{openTeam?.name}</p></div>
          </div>
          <div class="row">
            <div class="col-2">
              <p class="team-title">Owner</p>
            </div>
            <div class="col-10"><p>{openTeam?.name} | {$user?.email}</p></div>
          </div>
          <div class="row">
            <div class="col-2">
              <p class="team-title">About</p>
            </div>
            <div class="col-10">
              <p>
                {"About will be shown here. Backend Implementation is left."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .settings-list {
    height: calc(100vh - 250px);
    border-right: 1px solid white;
  }
</style>
