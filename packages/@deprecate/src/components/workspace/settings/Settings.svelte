<script lang="ts">
  import DragDrop from "import { List } from "@sparrow/library/ui";dragdrop/DragDrop.svelte";
  import type {
    Team,
    TeamRepositoryMethods,
    TeamServiceMethods,
  } from "$lib/utils/interfaces";

  export let openTeam: Team;
  export let teamServiceMethods: TeamServiceMethods;
  export let teamRepositoryMethods: TeamRepositoryMethods;

  enum TeamProperty {
    IMAGE = "image",
    NAME = "name",
    DESCRIPTION = "description",
  }

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

  if (openTeam?.logo?.bufferString) {
    uploadTeamIcon.file.value = openTeam?.logo;
  }

  let ownerDetails;
  openTeam?.users.forEach((element) => {
    if (element.id === openTeam.owner) {
      ownerDetails = element;
    }
  });

  const handleUpdateTeam = async (property) => {
    const blankFile = new File([""], "blank.jpg", {
      type: "",
      lastModified: 1706698162061,
    });
    let data;
    if (property === TeamProperty.IMAGE) {
      data = {
        image:
          uploadTeamIcon.file.value.length === 0
            ? blankFile
            : uploadTeamIcon.file.value,
      };
    } else if (property === TeamProperty.NAME) {
      if (!teamName) {
        teamName = openTeam?.name;
      }
      data = {
        name: teamName,
      };
    } else if (property === TeamProperty.DESCRIPTION) {
      data = {
        description: teamDescription,
      };
    }

    const response = await teamServiceMethods.updateTeam(openTeam.teamId, data);
    delete response?._id;
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
      uploadTeamIcon.file.showFileTypeError = false;
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
      uploadTeamIcon.file.showFileSizeError = false;
      uploadTeamIcon.file.invalid = true;
      return;
    }
    uploadTeamIcon.file.showFileSizeError = false;
    uploadTeamIcon.file.showFileTypeError = false;
    uploadTeamIcon.file.invalid = false;
    uploadTeamIcon.file.value =
      (targetFile && targetFile[0]) ||
      (dataTransferFile && dataTransferFile[0]);
    handleUpdateTeam(TeamProperty.IMAGE);
  };
  const handleLogoReset = (e: any) => {
    uploadTeamIcon.file = {
      value: [],
      invalid: false,
      showFileSizeError: false,
      showFileTypeError: false,
    };
    handleUpdateTeam(TeamProperty.IMAGE);
  };
  const handleLogoEdit = (e: any) => {
    const uploadFileInput = document.getElementById(
      "upload-team-icon-file-input",
    );
    uploadFileInput.click();
  };

  const blurInputField = (event, inputId) => {
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
        <div class="settings-list w-30 p-2">
          <button
            class="settings-tab p-2 w-100 rounded bg-backgroundLight border-0"
          >
            Team Profile
          </button>
        </div>
      </div>
      <div class="col-9">
        <div class="settings-content w-70">
          <div class="row pb-3">
            <div class="col-12">
              <div>
                <DragDrop
                  value={uploadTeamIcon.file.value}
                  maxFileSize={2048}
                  onChange={handleLogoInputChange}
                  iconHeight={30}
                  iconWidth={30}
                  resetValue={handleLogoReset}
                  editValue={handleLogoEdit}
                  labelText=""
                  labelDescription="Drag and drop your image. We recommend that you upload an image with square aspect ratio.The image size should not be more than 2 MB. Supported formats are .jpg, .jpeg, .png"
                  labelDescriptionSize={"14px"}
                  inputId="upload-team-icon-file-input"
                  inputPlaceholder="Drag and Drop or"
                  isRequired={false}
                  supportedFileTypes={[".png", ".jpg", ".jpeg"]}
                  showFileSizeError={uploadTeamIcon.file.showFileSizeError}
                  showFileTypeError={uploadTeamIcon.file.showFileTypeError}
                  fileTypeError="This file type is not supported. Please reupload in any of the following file formats."
                  fileSizeError="The size of the file you are trying to upload is more than 100 KB."
                  width={"80px"}
                  height={"80px"}
                />
              </div>
            </div>
          </div>
          <div class="row pb-3">
            <div class="title-width">
              <p class="team-title fs-12 text-textColor">Team Name</p>
            </div>
            <div class="col-10">
              <input
                required
                type="text"
                id="input-team-name"
                placeholder=""
                class="settings-team-name w-100 fs-12 border-0 p-3 rounded"
                autocomplete="off"
                spellcheck="false"
                autocorrect="off"
                autocapitalize="off"
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
          <div class="row pb-3">
            <div class="title-width">
              <p class="team-title fs-12 text-textColor">Owner</p>
            </div>
            <div class="col-10">
              <p class="ps-3">
                {ownerDetails.name} <span class="text-textColor px-2">|</span>
                {ownerDetails.email}
              </p>
            </div>
          </div>
          <div class="row pb-3">
            <div class="title-width">
              <p class="team-title fs-12 text-textColor">About</p>
            </div>
            <div class="col-10">
              <textarea
                required
                type="text"
                id="input-team-description"
                placeholder="Add teams's description"
                class="settings-team-description w-100 fs-12 border-0 p-3 rounded"
                autocomplete="off"
                spellcheck="false"
                autocorrect="off"
                autocapitalize="off"
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
    border-right: 1px solid var(--border-color);
  }
  .settings-tab {
    text-align: left;
  }
  .settings-team-description {
    height: calc(150px) !important;
  }
  .settings-team-name,
  .settings-team-description {
    background-color: transparent !important;
    margin-top: -18px;
  }
  .settings-team-name:hover,
  .settings-team-description:hover {
    outline: 1px solid var(--send-button);
  }
  .settings-team-name:focus,
  .settings-team-description:focus {
    outline: 1px solid var(--send-button);
  }
  .fs-12 {
    font-size: 12px;
  }
  .title-width {
    width: 90px;
  }
</style>
