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
  let teamName: string = openTeam?.name;
  let teamDescription: string = openTeam.description;
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
    } else if (property === "name") {
      if (!teamName) {
        teamName = openTeam?.name;
      }
      data = {
        name: teamName,
      };
    } else if (property === "description") {
      data = {
        description: teamDescription,
      };
    }

    const response = await teamServiceMethods.updateTeam(openTeam.teamId, data);
    delete response._id;
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

  const blurInputField = (event, inputId) => {
    console.log(event, inputId);
    if (event.key === "Enter") {
      const inputField = document.getElementById(inputId) as HTMLInputElement;
      inputField.blur();
    }
  };
</script>

<svelte:window />
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
            <div class="col-10">
              <input
                required
                type="text"
                id="input-team-name"
                placeholder="Enter URL or paste text"
                class="url-input form-control input-outline border-0 p-3 rounded"
                autocomplete="off"
                spellcheck="false"
                autocorrect="off"
                autocapitalize="off"
                style="height:34px;"
                bind:value={teamName}
                on:keydown={(e) => {
                  blurInputField(e, "input-team-name");
                }}
                on:blur={() => {
                  handleUpdateTeam("name");
                }}
              />
            </div>
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
              <input
                required
                type="text"
                id="input-team-description"
                placeholder="Enter URL or paste text"
                class="url-input form-control input-outline border-0 p-3 rounded"
                autocomplete="off"
                spellcheck="false"
                autocorrect="off"
                autocapitalize="off"
                style="height:34px;"
                bind:value={teamDescription}
                on:keydown={(e) => {
                  blurInputField(e, "input-team-description");
                }}
                on:blur={() => {
                  handleUpdateTeam("description");
                }}
              />
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
  .settings-team-name {
  }
  .settings-team-description {
  }
</style>
