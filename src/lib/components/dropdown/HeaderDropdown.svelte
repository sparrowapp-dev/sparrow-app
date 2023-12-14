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
  import { isWorkspaceCreatedFirstTime } from "$lib/store/workspace.store";
  import { ItemType, UntrackedItems } from "$lib/utils/enums/item-type.enum";
  export let activeSideBarTabMethods;

  export let data: any;
  export let onclick: any;
  export let collectionsMethods: CollectionsMethods;
  const _viewModel = new HeaderDashboardViewModel();

  let isOpen: boolean = false;

  const toggleDropdown = () => {
    isOpen = !isOpen;
  };

  const handleWorkspaceTab = (id: string, name) => {
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
    sampleWorkspace.path = path;
    sampleWorkspace.property.workspace.requestCount = totalRequest;
    sampleWorkspace.property.workspace.collectionCount = totalCollection;
    sampleWorkspace.save = true;
    collectionsMethods.handleCreateTab(sampleWorkspace);
    moveNavigation("right");
  };

  const handleCreateWorkSpace = async () => {
    isWorkspaceCreatedFirstTime.set(true);
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
      workspaceObj.path = path;
      workspaceObj.property.workspace.requestCount = totalRequest;
      workspaceObj.property.workspace.collectionCount = 0;
      workspaceObj.save = true;
      _viewModel.addWorkspace(workspaceObj);

      collectionsMethods.handleCreateTab(workspaceObj);
      moveNavigation("right");
      isWorkspaceCreatedFirstTime.set(true);
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

<div
  class="rounded z-3"
  style="position: relative; display:inline-block;"
  on:click={handleDropdownClick}
  class:dropdown-btn-active={isOpen}
>
  <button
    style="font-size: 12px;"
    class="dropdown-btn rounded border-0 ps-2 py-2 gap-2"
    on:click={toggleDropdown}
    id="workspace-dropdown"
    >Workspace
    <span class="px-2" class:dropdown-logo-active={isOpen}
      ><img
        style="height:15px; width:20px;"
        src={dropdown}
        alt=""
        class:dropdown-logo-active={isOpen}
      /></span
    ></button
  >
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
    <hr class="m-0 p-0" />
    {#if $data}
      {#each $data as list, index}
        <!-- {#if index < workspaceLimit} -->
        <p
          class="d-flex dropdown-btn align-items-center px-2 mt-2 p-1 rounded gap-0 mb-0"
          style="cursor: pointer;overflow:auto"
          on:click={() => {
            isOpen = false;
            onclick(list._id, list.name);
          }}
          on:click={() => {
            handleWorkspaceTab(list._id, list.name);
          }}
        >
          {list.name}
        </p>
        <!-- {/if} -->
      {/each}
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
</style>
