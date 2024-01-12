<script lang="ts">
  import dropdown from "$lib/assets/dropdown.svg";
  import constants from "$lib/utils/constants";
  import { onDestroy, onMount } from "svelte";
  import { HeaderDashboardViewModel } from "../header/header-dashboard/HeaderDashboard.ViewModel";
  import { generateSampleWorkspace } from "$lib/utils/sample/workspace.sample";
  let workspaceLimit = constants.WORKSPACE_LIMIT;
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import type { Path } from "$lib/utils/interfaces/request.interface";
  import { navigate } from "svelte-navigator";
  import {
    currentWorkspace,
    isWorkspaceCreatedFirstTime,
    isWorkspaceLoaded,
  } from "$lib/store/workspace.store";
  import { ItemType, UntrackedItems } from "$lib/utils/enums/item-type.enum";
  import { notifications } from "$lib/utils/notifications";
  import { slide } from "svelte/transition";
  import checkIcon from "$lib/assets/check.svg";
  import { currentTeam } from "$lib/store/team.store";
  import { TickIcon } from "$lib/assets/app.asset";
  export let activeWorkspaceId: string;
  export let activeSideBarTabMethods;
  export let data: any;
  export let onclick: any;
  export let collectionsMethods: CollectionsMethods;
  const _viewModel = new HeaderDashboardViewModel();

  let isOpen: boolean = false;
  let currWorkspaceName: string = "",
    currTeamName: string = "";
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

    const sampleWorkspace = generateSampleWorkspace(id, new Date().toString());
    sampleWorkspace.id = id;
    sampleWorkspace.name = name;
    sampleWorkspace.description = description;
    sampleWorkspace.path = path;
    sampleWorkspace.property.workspace.requestCount = totalRequest;
    sampleWorkspace.property.workspace.collectionCount = totalCollection;
    sampleWorkspace.save = true;
    collectionsMethods.handleCreateTab(sampleWorkspace);
    moveNavigation("right");
  };

  const handleCreateWorkSpace = async () => {
    isWorkspaceCreatedFirstTime.set(true);
    isWorkspaceLoaded.set(false);
    const workspaceObj = generateSampleWorkspace(
      UntrackedItems.UNTRACKED,
      new Date().toString(),
    );

    const workspaceData = {
      name: workspaceObj.name,
      type: ItemType.PERSONAL,
    };

    _viewModel.addWorkspace(workspaceObj);

    const response = await _viewModel.createWorkspace(workspaceData);

    if (response.isSuccessful) {
      _viewModel.addWorkspace(response.data.data);

      let totalCollection: number = 0;
      let totalRequest: number = 0;

      $data.map((item) => {
        if (item) {
          if (item._data._id === response.data.data._id) {
            // totalCollection = item?._data?.collections?.length;
            totalCollection = 0;
          } else {
            totalRequest = 0;
          }
        }
      });

      let path: Path = {
        workspaceId: response.data.data._id,
        collectionId: "",
      };

      workspaceObj.id = response.data.data._id;
      workspaceObj.name = response.data.data.name;
      workspaceObj.description = response.data.data?.description;
      workspaceObj.path = path;
      workspaceObj.property.workspace.requestCount = totalRequest;
      workspaceObj.property.workspace.collectionCount = 0;
      workspaceObj.save = true;
      _viewModel.addWorkspace(workspaceObj);

      collectionsMethods.handleCreateTab(workspaceObj);
      moveNavigation("right");
      isWorkspaceCreatedFirstTime.set(true);
      notifications.success("New Workspace Created");
      isWorkspaceLoaded.set(true);
    }
  };
  function handleDropdownClick(event: MouseEvent) {
    const dropdownElement = document.getElementById("workspace-dropdown");
    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
      isOpen = false;
    }
  }

  const currentWorkspaceSubscribe = currentWorkspace.subscribe((value) => {
    if (value) currWorkspaceName = value.name;
  });

  const currentTeamSubscribe = currentTeam.subscribe((value) => {
    if (value) currTeamName = value.name;
  });

  onDestroy(() => {
    window.removeEventListener("click", handleDropdownClick);
    currentWorkspaceSubscribe();
    currentTeamSubscribe();
  });

  onMount(() => {
    window.addEventListener("click", handleDropdownClick);
  });
</script>

<div
  class="rounded z-2"
  style="position: relative; display:inline-block;"
  on:click={handleDropdownClick}
  class:dropdown-btn-active={isOpen}
>
  {#if currWorkspaceName}
    <button
      style="font-size: 12px;"
      class="dropdown-btn rounded border-0 ps-2 py-2 gap-2 ellipsis"
      on:click={toggleDropdown}
      id="workspace-dropdown"
      >{currTeamName} / {currWorkspaceName}
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
      }}
    >
      <span on:click={handleCreateWorkSpace}>Create New Workspace</span><span
        style="height:20px;width:20px">+</span
      >
    </p>
    <hr class="m-0 p-0 mb-1" />
    {#if $data}
      {#if isOpen}
        <div transition:slide={{ duration: 500 }} class="gap-2">
          {#each $data.slice().reverse() as list, index}
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
                  <span>{list.name}</span>
                  <span class="list-team-name d-block" style="font-size: 12px;"
                    >{list.team.teamName}</span
                  >
                </p>

                {#if activeWorkspaceId === list._id}
                  <TickIcon width={20} height={20} />
                {/if}
              </div>
            {/if}
          {/each}
        </div>
      {/if}
    {/if}
    <hr class="m-0 p-0 mt-1" />
    <p
      style="cursor:pointer"
      class="drop-btn d-flex align-items-center mb-2 mt-1 p-1 rounded"
      on:click={() => {
        navigate("/dashboard/workspaces");
        activeSideBarTabMethods.updateActiveTab("/dashboard/workspaces");
      }}
      on:click={() => {
        isOpen = true;
      }}
    >
      View All Workspaces
    </p>
  </div>
</div>

<style>
  .dropdown-btn {
    background: none;
    outline: none;
    cursor: pointer;
    border: none;
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
    background-color: var(--border-color);
  }
  .dropdown-data {
    background-color: black;
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
    background-color: var(--blackColor);
  }
  .list-team-name {
    color: var(--request-arc);
  }
</style>
