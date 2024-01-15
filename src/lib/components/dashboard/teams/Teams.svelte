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
  export let teams: any;
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
      value: [];
      invalid: boolean;
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
      },
    };
  });
  const _viewModel = new TeamsViewModel();
  let currOpenedTeam: CurrentTeam;
  let isCreateTeamModalOpen: boolean;
  const handleOpenTeam = (teamId: string, teamName) => {
    openedTeam.set({ id: teamId, name: teamName });
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
      },
    };
  };
  const openedTeamSubscribe = openedTeam.subscribe((value) => {
    if (value) currOpenedTeam = value;
  });
  const handleTeamNameChange = (e: any) => {
    if (e.target.value !== "") newTeam.name.invalid = false;
    newTeam.name.value = e.target.value;
  };
  const handleTeamDescChange = (e: any) => {
    newTeam.description.value = e.target.value;
  };
  const handleCreateTeam = async (name: string, description: string) => {
    if (name == "") newTeam.name.invalid = true;
    if (description == "") newTeam.description.invalid = true;
    isTeamCreatedFirstTime.set(true);
    const teamObj = generateSamepleTeam(name, description);

    const teamData = {
      name: teamObj.name,
      description: teamObj.description,
    };

    _viewModel.addTeam(teamData);
    const response = await _viewModel.createTeam(teamData);

    if (response.isSuccessful && response.data.data) {
      const res = response.data.data;
      _viewModel.modifyTeam(21, res);
      notifications.success("New team Techdome is created.");
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
  {#each teams as team}
    <button
      class={`d-flex w-100 align-items-center justify-content-between rounded teams-outer border-0 ${
        currOpenedTeam.id == team.teamId && "active"
      }`}
      on:click={() => handleOpenTeam(team.teamId, team.name)}
    >
      <div class="d-flex">
        <img src={team.icon} alt="" />
        <p class=" mb-0">{team.name}</p>
      </div>
      <PeopleIcon
        color={currOpenedTeam.id == team.teamId ? "#8A9299" : "#45494D"}
        classProp={team.users.length <= 1 && "d-none"}
      />
    </button>
  {/each}
</section>
<CustomPopup
  isOpen={isCreateTeamModalOpen}
  title={"New Team"}
  btnText={"Create Team"}
  handleOpen={handleCreateTeamModal}
  handleSubmit={() =>
    handleCreateTeam(newTeam.name.value, newTeam.description.value)}
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
    value=""
    labelText="About"
    labelDescription="max: 500 characters"
    inputId="team-desc-input"
    inputPlaceholder="Write a little about your team"
    onChange={handleTeamDescChange}
  />

  <FileInput
    value={""}
    labelText="Logo"
    labelDescription="Drag and drop your image. We recommend that you upload an image with square aspect ratio.The image size should not be more than 2 MB. Supported formats are .jpg, .jpeg, .png "
    inputId="team-file-input"
    inputPlaceholder="Drag and Drop or"
    isRequired={false}
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
</style>
