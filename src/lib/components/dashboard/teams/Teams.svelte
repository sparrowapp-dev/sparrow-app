<script lang="ts">
  import plus from "$lib/assets/plus.svg";
  import Tooltip from "$lib/components/tooltip/Tooltip.svelte";
  import { isTeamCreatedFirstTime, openedTeam } from "$lib/store/team.store";
  import { UntrackedItems } from "$lib/utils/enums/item-type.enum";
  import type { CurrentTeam } from "$lib/utils/interfaces/team.interface";
  import { generateSamepleTeam } from "$lib/utils/sample/team.sample";
  import { onDestroy, onMount } from "svelte";
  import { TeamsViewModel } from "./Teams.ViewModel";
  import { notification } from "@tauri-apps/api";
  import { notifications } from "$lib/utils/notifications";
  import CustomPopup from "$lib/components/Modal/CustomPopup.svelte";
  import { FileInput, ParaInput, TextInput } from "$lib/components";
  import { PeopleIcon } from "$lib/assets/app.asset";
  import { base64ToURL } from "$lib/utils/helpers";
  import { WorkspaceViewModel } from "../../../../pages/Workspaces/workspace.viewModel";

  export let teams: any, userId: string;
  let isEditingLogo: boolean = false;
  let newTeam: {
    name: {
      value: string;
      invalid: boolean;
    };
    description: {
      value: string;
      invalid: boolean;
    };
    file: {
      value: any;
      invalid: boolean;
      showFileTypeError: boolean;
      showFileSizeError: boolean;
    };
  };
  onMount(() => {
    newTeam = {
      name: {
        value: "",
        invalid: false,
      },
      description: {
        value: "",
        invalid: false,
      },
      file: {
        value: [],
        invalid: false,
        showFileSizeError: false,
        showFileTypeError: false,
      },
    };
  });
  const _viewModel = new TeamsViewModel();
  const _workspaceViewModel = new WorkspaceViewModel();

  let currOpenedTeam: CurrentTeam;
  let isCreateTeamModalOpen: boolean;
  const handleOpenTeam = (
    teamId: string,
    teamName,
    teamBase64String: object,
  ) => {
    openedTeam.set({
      id: teamId,
      name: teamName,
      base64String: teamBase64String,
    });
  };
  const handleCreateTeamModal = () => {
    isCreateTeamModalOpen = !isCreateTeamModalOpen;
    newTeam = {
      name: {
        value: "",
        invalid: false,
      },
      description: {
        value: "",
        invalid: false,
      },
      file: {
        value: [],
        invalid: false,
        showFileSizeError: false,
        showFileTypeError: false,
      },
    };
  };
  const openedTeamSubscribe = openedTeam.subscribe((value) => {
    if (value) currOpenedTeam = value;
  });
  const handleTeamNameChange = (e: any) => {
    if (e.target.value !== "") {
      newTeam.name.invalid = false;
    }
    newTeam.name.value = e.target.value;
  };
  const handleTeamDescChange = (e: any) => {
    newTeam.description.value = e.target.value;
  };
  const handleLogoInputChange = (
    e: any,
    maxSize: number,
    supportedFileTypes: string[],
  ) => {
    if (e.target.files[0].size > maxSize * 1024) {
      newTeam.file.showFileSizeError = true;
      newTeam.file.invalid = true;
      return;
    }
    const fileType = `.${e.target.files[0].name
      .split(".")
      .pop()
      .toLowerCase()}`;
    if (!supportedFileTypes.includes(fileType)) {
      newTeam.file.showFileTypeError = true;
      newTeam.file.invalid = true;
      return;
    }
    newTeam.file.showFileSizeError = false;
    newTeam.file.showFileTypeError = false;
    newTeam.file.invalid = false;
    newTeam.file.value = e.target.files[0];
  };
  const handleLogoReset = (e: any) => {
    newTeam.file.value = [];
  };
  const handleLogoEdit = (e: any) => {
    const fileInput = document.getElementById("team-file-input");
    fileInput.click();
  };
  const handleCreateTeam = async (
    name: string,
    description: string,
    file: any,
  ) => {
    if (name == "") {
      newTeam.name.invalid = true;
      return;
    }
    if (description == "") newTeam.description.invalid = true;
    if (newTeam.file.showFileSizeError || newTeam.file.showFileTypeError)
      return;
    isTeamCreatedFirstTime.set(true);
    const teamObj = generateSamepleTeam(name, description);

    const teamData = {
      name: teamObj.name,
      description: teamObj.description,
      image: file,
    };

    _viewModel.addTeam(teamData);
    const response = await _viewModel.createTeam(teamData);

    if (response.isSuccessful && response.data.data) {
      const res = response.data.data;
       _viewModel.modifyTeam(res._id, res);
      await _workspaceViewModel.refreshTeams(userId);
      notifications.success(`New team ${teamObj.name} is created.`);
      handleCreateTeamModal();
    } else {
      notifications.error("Failed to create a new team.");
    }
  };

  onDestroy(() => {
    openedTeamSubscribe();
  });
</script>

<section class="pb-4">
  <div class="sidebar-teams-header d-flex justify-content-between">
    <h6 class="teams-heading">Teams</h6>
    <div>
      <Tooltip text="New Team">
        <button
          class="new-team-btn rounded border-0"
          on:click={handleCreateTeamModal}
        >
          <img src={plus} alt="" />
        </button>
      </Tooltip>
    </div>
  </div>
  <div class="sidebar-teams-list sparrow-thin-scrollbar overflow-y-auto">
    {#each teams as team, index}
      <button
        class={`d-flex w-100 align-items-center justify-content-between rounded teams-outer border-0 ${
          currOpenedTeam.id == team.teamId && "active"
        }`}
        on:click={() => {
          handleOpenTeam(team.teamId, team.name, team.logo);
        }}
      >
        <div class="d-flex overflow-hidden">
          {#if base64ToURL(team.logo) == "" || base64ToURL(team.logo) == undefined}
            <p
              class={`m-0 text-defaultColor me-2 text-center align-items-center justify-content-center bg-transparent border-defaultColor `}
              style={`font-size: 15px; padding-top: 2px; width: 25px !important; height: 25px !important; display: flex; border: 1px solid #45494D; border-radius: 50%;`}
            >
              {team.name[0] ? team.name[0].toUpperCase() : ""}
            </p>
          {:else}
            <img src={base64ToURL(team.logo)} alt="" />
          {/if}
          <p class=" ellipsis overflow-hidden my-auto">{team.name}</p>
        </div>
        <PeopleIcon
          color={currOpenedTeam.id == team.teamId ? "#8A9299" : "#45494D"}
          classProp={team.users.length <= 1 && "d-none"}
        />
      </button>
    {/each}
  </div>
</section>
<CustomPopup
  isOpen={isCreateTeamModalOpen}
  title={"New Team"}
  btnText={"Create Team"}
  handleOpen={handleCreateTeamModal}
  handleSubmit={() =>
    handleCreateTeam(
      newTeam.name.value,
      newTeam.description.value,
      newTeam.file.value,
    )}
>
  <TextInput
    value={newTeam.name.value}
    labelText="Team or Organization name"
    inputId="team-name-input"
    inputPlaceholder="Please enter your team name"
    isRequired={true}
    onChange={handleTeamNameChange}
    invalidValue={newTeam.name.invalid}
    errorText={"Team name cannot be empty."}
  />
  <ParaInput
    maxCharacter={500}
    value={newTeam.description.value}
    labelText="About"
    labelDescription="max: 500 characters"
    inputId="team-desc-input"
    inputPlaceholder="Write a little about your team"
    onChange={handleTeamDescChange}
  />
  <FileInput
    value={newTeam.file.value}
    maxFileSize={100}
    onChange={handleLogoInputChange}
    resetValue={handleLogoReset}
    editValue={handleLogoEdit}
    labelText="Logo"
    labelDescription="Drag and drop your image. We recommend that you upload an image with square aspect ratio.The image size should not be more than 100 KB. Supported formats are .jpg, .jpeg, .png "
    inputId="team-file-input"
    inputPlaceholder="Drag and Drop or"
    isRequired={false}
    supportedFileTypes={[".png", ".jpg", ".jpeg"]}
    showFileSizeError={newTeam.file.showFileSizeError}
    showFileTypeError={newTeam.file.showFileTypeError}
    fileTypeError="This file type is not supported. Please reupload in any of the following file formats."
    fileSizeError="The size of the file you are trying to upload is more than 100 KB."
  />
</CustomPopup>

<style>
  .teams-heading {
    font-size: 14px;
    font-weight: 700;
    line-height: 21px;
  }
  .teams-outer {
    padding: 8px 7px;
    background-color: transparent;
  }
  .teams-outer.active {
    background-color: var(--border-color);
  }
  .new-team-btn {
    background-color: transparent;
  }
  .new-team-btn:hover {
    background-color: var(--border-color);
  }
  .new-team-btn > img:hover {
    filter: invert(86%) sepia(37%) saturate(4292%) hue-rotate(180deg)
      brightness(101%) contrast(100%);
  }
  .teams-outer:hover {
    background-color: #313233;
  }
  .teams-outer img {
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }
  .sidebar-teams-list {
    max-height: 30vh;
  }
</style>
