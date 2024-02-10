<script lang="ts">
  import dropdown from "$lib/assets/dropdown.svg";
  import constants from "$lib/utils/constants";
  import { onDestroy, onMount } from "svelte";
  import { HeaderDashboardViewModel } from "../header/header-dashboard/HeaderDashboard.ViewModel";
  import { generateSampleWorkspace } from "$lib/utils/sample/workspace.sample";
  import { moveNavigation, base64ToURL } from "$lib/utils/helpers";
  import type { Path } from "$lib/utils/interfaces/request.interface";
  import { navigate } from "svelte-navigator";
  import {
    isWorkspaceCreatedFirstTime,
    isWorkspaceLoaded,
  } from "$lib/store/workspace.store";
  import { UntrackedItems } from "$lib/utils/enums/item-type.enum";
  import { notifications } from "$lib/utils/notifications";
  import { slide } from "svelte/transition";
  import { TickIcon } from "$lib/assets/app.asset";
  import type {
    CurrentTeam,
    CurrentWorkspace,
    CollectionsMethods,
  } from "$lib/utils/interfaces";
  import { SelectInput } from "$lib/components";
  import type {
    InvalidWorkspacePostBody,
    WorkspacePostBody,
  } from "$lib/utils/dto";
  import type { Observable } from "rxjs";
  import type { TeamDocument } from "$lib/database/app.database";
  import { TeamViewModel } from "../../../pages/Teams/team.viewModel";
  import { setOpenedTeam } from "$lib/store";
  import { v4 as uuidv4 } from "uuid";
  import ModalWrapperV1 from "../Modal/Modal.svelte";
  import Button from "../buttons/Button.svelte";
  import Input from "../inputs/Input.svelte";

  export let userId: string | undefined;
  export let activeWorkspaceId: string;
  export let activeSideBarTabMethods: any;
  export let currentTeam: CurrentTeam, currentWorkspace: CurrentWorkspace;
  export let data: any;
  export let onclick: any;
  export let teams: Observable<TeamDocument[]>;
  export let collectionsMethods: CollectionsMethods;

  let workspaceNameExistsErr: boolean = false;
  let workspaceLimit = constants.WORKSPACE_LIMIT;
  let isOpen: boolean = false;
  let openCreateWorkspaceModal: boolean = false;
  let workspaceUnderCreation: boolean = false;
  let workspacePostInput: WorkspacePostBody = { name: "", id: "" };
  let invalidWorkspacePostInput: InvalidWorkspacePostBody = {
    name: false,
    id: false,
  };

  const _viewModel = new HeaderDashboardViewModel();
  const _teamViewModel = new TeamViewModel();
  const toggleDropdown = () => {
    isOpen = !isOpen;
  };

  const handleWorkspaceTab = (id: string, name, description: string) => {
    isWorkspaceCreatedFirstTime.set(false);
    let totalCollection: number = 0;
    let totalRequest: number = 0;
    $data.map((item) => {
      if (item) {
        if (item._data._id === id) {
          totalCollection = item?._data?.collections?.length;
        } else {
          totalRequest = 0;
        }
      }
    });

    let path: Path = {
      workspaceId: id,
      collectionId: "",
    };

    const sampleWorkspace = generateSampleWorkspace(
      id,
      new Date().toString(),
      name,
    );
    sampleWorkspace._id = id;
    sampleWorkspace.name = name;
    sampleWorkspace.description = description;
    sampleWorkspace.path = path;
    sampleWorkspace.property.workspace.requestCount = totalRequest;
    sampleWorkspace.property.workspace.collectionCount = totalCollection;
    sampleWorkspace.save = true;
    collectionsMethods.handleCreateTab(sampleWorkspace);
    collectionsMethods.handleActiveTab(sampleWorkspace._id);
    moveNavigation("right");
  };
  const handleCreateWorkspaceModal = () => {
    if (openCreateWorkspaceModal) {
      workspacePostInput.name = "";
      workspacePostInput.id = "";
      invalidWorkspacePostInput.name = false;
      invalidWorkspacePostInput.id = false;
    }
    openCreateWorkspaceModal = !openCreateWorkspaceModal;
  };

  const handleCreateWorkspaceNameChange = (e) => {
    workspacePostInput.name = e.target.value;
    workspaceNameExistsErr = false;
    if (e.target.value !== "") invalidWorkspacePostInput.name = false;
  };
  const handleTeamSelect = (value) => {
    workspacePostInput.id = value;
    if (value && value !== "") invalidWorkspacePostInput.id = false;
  };

  const handleCreateWorkSpace = async () => {
    if (!workspacePostInput?.name || workspacePostInput?.name === "") {
      invalidWorkspacePostInput.name = true;
      if (!workspacePostInput?.id || workspacePostInput?.id === "") {
        invalidWorkspacePostInput.id = true;
        return;
      }
      return;
    }

    if (
      $teams
        ?.filter((teamData) => teamData._data.teamId == workspacePostInput?.id)
        ?.find((teamData) =>
          teamData._data.workspaces.find(
            (workspace) => workspace.name == workspacePostInput?.name,
          ),
        )
    ) {
      invalidWorkspacePostInput.name = true;
      workspaceNameExistsErr = true;
      return;
    }
    isWorkspaceCreatedFirstTime.set(true);
    isWorkspaceLoaded.set(false);
    workspaceUnderCreation = true;
    const workspaceObj = generateSampleWorkspace(
      UntrackedItems.UNTRACKED + uuidv4(),
      new Date().toString(),
      workspacePostInput?.name,
      workspacePostInput.id,
    );

    const workspaceData = {
      name: workspaceObj.name,
      id: workspacePostInput.id,
      createdAt: new Date(workspaceObj.createdAt).toISOString(),
    };
    await _viewModel.addWorkspace(workspaceObj);

    const response = await _viewModel.createWorkspace(workspaceData);

    if (response.isSuccessful) {
      let totalRequest = 0;

      $data.map((item) => {
        if (item) {
          if (item._data._id != response.data.data._id) {
            totalRequest = 0;
          } 
        }
      });

      let path: Path = {
        workspaceId: response.data.data._id,
        collectionId: "",
      };

      workspaceObj._id = response.data.data._id;
      workspaceObj.id = response.data.data._id;
      workspaceObj.name = response.data.data.name;
      workspaceObj.description = response.data.data?.description;
      workspaceObj.team = response.data.data?.team;
      workspaceObj.users = response.data.data?.users;
      workspaceObj.createdAt = response.data.data?.createdAt;
      workspaceObj.createdBy = response.data.data?.createdBy;
      workspaceObj.isActiveWorkspace = false;
      workspaceObj.environments = response.data.data?.environments;
      workspaceObj.path = path;
      workspaceObj.property.workspace.requestCount = totalRequest;
      workspaceObj.property.workspace.collectionCount = 0;
      workspaceObj.save = true;
      if (userId) await _teamViewModel.refreshTeams(userId);
      if (userId) await _viewModel.refreshWorkspaces(userId);
      await _viewModel.activateWorkspace(response.data.data._id);
      collectionsMethods.handleCreateTab(workspaceObj);
      collectionsMethods.handleActiveTab(response.data.data._id);
      moveNavigation("right");
      isWorkspaceCreatedFirstTime.set(true);
      notifications.success("New Workspace Created");
      isWorkspaceLoaded.set(true);
      navigate("/dashboard/collections");
      activeSideBarTabMethods.updateActiveTab("collections");
      workspaceUnderCreation = false;
      handleCreateWorkspaceModal();
    } else {
      //only to remove the dummy workspace at fail workspace creation
      await _viewModel.removeWorkspace(workspaceObj._id);
      handleCreateWorkspaceModal();
      workspaceUnderCreation = false;
      isWorkspaceLoaded.set(true);
      notifications.error("Failed to create new Workspace!");
    }
  };

  function handleDropdownClick(event: MouseEvent) {
    const dropdownElement = document.getElementById("workspace-dropdown");
    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
      isOpen = false;
    }
  }

  onDestroy(() => {
    window.removeEventListener("click", handleDropdownClick);
  });

  onMount(() => {
    window.addEventListener("click", handleDropdownClick);
  });
</script>

<!-- Create New Workspace POP UP -->
<ModalWrapperV1
  title={"New Workspace"}
  type={"dark"}
  width={"35%"}
  zIndex={1000}
  isOpen={openCreateWorkspaceModal}
  handleModalState={(flag) => {
    handleCreateWorkspaceModal();
  }}
>
  <Input
    value={workspacePostInput?.name}
    labelText="Workspace Name"
    isRequired={true}
    inputPlaceholder="Enter workspace name"
    inputId="workspace-name-input"
    invalidValue={invalidWorkspacePostInput.name}
    errorText={workspaceNameExistsErr
      ? "Workspace with this name already exists."
      : "Workspace name cannot be empty."}
    onChange={handleCreateWorkspaceNameChange}
    type={"input"}
    inputStyleProp={"border: 1px solid var(--border-color);"}
    inputClassProp={`py-2 px-3`}
  />
  <SelectInput
    labelText="Team"
    isRequired={true}
    errorText="Please select a team."
    selectInputPlaceholder="Select team"
    inputId="select-team-input"
    options={$teams
      .filter((team) => {
        return (
          team?._data?.admins?.includes(userId) || team?._data?.owner == userId
        );
      })
      .map((team) => ({
        id: team?._data?.teamId,
        name: team?._data?.name,
        logo: base64ToURL(team?._data?.logo),
        endIconVisible: team?._data?.users?.length > 1,
      }))}
    invalidValue={invalidWorkspacePostInput.id}
    handleOnSelect={handleTeamSelect}
  />
  <div class="sparrow-modal-footer d-flex justify-content-end mt-4">
    <Button
      disable={workspaceUnderCreation}
      title={`Cancel`}
      type="dark"
      buttonClassProp={`me-2`}
      onClick={handleCreateWorkspaceModal}
    />
    <Button
      title={"Create"}
      type="primary"
      disable={workspaceUnderCreation}
      loader={workspaceUnderCreation}
      buttonClassProp={`me-1`}
      onClick={() => {
        handleCreateWorkSpace();
      }}
    />
  </div>
</ModalWrapperV1>

<div
  class="rounded z-2"
  style="position: relative; display:inline-block;"
  on:click={handleDropdownClick}
  class:dropdown-btn-active={isOpen}
>
  {#if currentWorkspace && currentWorkspace?.name}
    <button
      style="font-size: 12px;"
      class=" rounded border-0 ps-2 py-2 d-flex gap-2 dropdown-btn text-white ellipsis"
      on:click={toggleDropdown}
      id="workspace-dropdown"
    >
      <p class="ellipsis my-auto team-name overflow-hidden">
        {currentTeam?.name}
      </p>
      /
      <p class="ellipsis my-auto workspace-name overflow-hidden">
        {currentWorkspace?.name}
      </p>
      <span class="px-2" class:dropdown-logo-active={isOpen}
        ><img
          style="height:15px; width:20px;"
          src={dropdown}
          alt=""
          class:dropdown-logo-active={isOpen}
        /></span
      ></button
    >
  {/if}
  <div
    style="display:none;overflow:auto;"
    class="dropdown-data rounded px-2"
    class:dropdown-active={isOpen}
  >
    <p
      style="cursor:pointer;overflow:auto"
      class="d-flex align-items-center justify-content-between m-0 p-1 mt-1 drop-btn2 rounded"
      on:click={() => {
        isOpen = true;
        handleCreateWorkspaceModal();
      }}
    >
      <span>Create New Workspace</span><span style="height:20px;width:20px"
        >+</span
      >
    </p>
    <hr class="m-0 p-0 mb-1" />
    {#if $data}
      {#if isOpen}
        <div transition:slide={{ duration: 500 }} class="gap-2">
          {#each $data?.slice().reverse() as list, index}
            {#if index < workspaceLimit}
              <div
                class="d-flex align-items-center justify-content-between pe-1 dropdown-btn rounded"
              >
                <p
                  class=" align-items-center px-2 mt-2 mb-2 rounded gap-0 mb-0 w-100 ellipsis overflow-hidden"
                  style="cursor: pointer;overflow:auto"
                  on:click={() => {
                    isOpen = false;
                    onclick(list._id, list.name, list.team);
                  }}
                  on:click={() => {
                    handleWorkspaceTab(list._id, list.name, list?.description);
                  }}
                >
                  <span class="workspace-name">{list.name}</span>
                  <span class="list-team-name d-block" style="font-size: 12px;"
                    >{list.team.teamName ? list.team.teamName : ""}</span
                  >
                </p>

                {#if activeWorkspaceId === list._id}
                  <TickIcon width={20} height={20} />
                {/if}
              </div>
            {/if}
          {/each}
          {#if $data && $data.length < workspaceLimit}
            <p
              style="font-size: 12px; color: #636566; "
              class="text-wrap text-center px-2 py-1"
            >
              You will see your five most recent workspaces here.
            </p>
          {/if}
        </div>
      {/if}
    {/if}
    {#if $data && $data.length > 0}
      <hr class="m-0 p-0 mt-1" />
      <p
        style="cursor:pointer"
        class="drop-btn d-flex align-items-center mb-2 mt-1 p-1 rounded"
        on:click={() => {
          navigate("/dashboard/workspaces");
          activeSideBarTabMethods.updateActiveTab("workspaces");
          isOpen = true;
          setOpenedTeam(
            currentTeam.id,
            currentTeam.name,
            currentTeam.base64String,
          );
        }}
      >
        View All Workspaces
      </p>
    {/if}
  </div>
</div>

<style lang="scss">
  .dropdown-btn {
    background: none;
    outline: none;
    cursor: pointer;
    border: none;
    max-width: 15vw;
  }

  .drop-btn {
    background: none;
    outline: none;
    cursor: pointer;
    border: none;
    color: var(--request-arc);
  }

  .drop-btn2 {
    background: none;
    outline: none;
    cursor: pointer;
    border: none;
    color: var(--send-button);
  }

  .drop-btn2:hover {
    color: var(--workspace-hover-color);
    background-color: var(--border-color);
  }

  .drop-btn:hover {
    color: var(--workspace-hover-color);
    background-color: var(--border-color);
  }

  .dropdown-btn:hover {
    background-color: var(--dull-background-color);
    color: var(--workspace-hover-color);
  }
  .dropdown-btn:active {
    background-color: var(--border-color);
  }
  .dropdown-btn:active .workspace-name {
    color: white;
  }
  .dropdown-data {
    background-color: var(--background-dropdown);
    color: white;
    position: absolute;
    top: 40px;
    left: 0;
    width: 200px;
    border: 1px solid rgb(44, 44, 44);
  }

  .dropdown-data p {
    font-size: 12px;
    font-weight: 400;
  }
  .dropdown-active {
    display: block !important;
  }
  .dropdown-logo-active {
    transform: rotateX(180deg) !important;
  }

  .dropdown-btn-active {
    border: 1px solid #85c2ff;
    background-color: var(--background-dropdown);
  }
  .list-team-name {
    color: var(--request-arc);
  }
</style>
