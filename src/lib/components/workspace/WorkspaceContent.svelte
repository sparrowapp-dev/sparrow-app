<script lang="ts">
  import { Link, Route, navigate } from "svelte-navigator";
  import Workspaces from "$lib/components/teams/teams-content/workspaces/Workspaces.svelte";

  import table from "$lib/assets/table.svg";
  import hamburger from "$lib/assets/hamburger.svg";
  export let data: any;
  import Navigate from "../../../routing/Navigate.svelte";
  import AllWorkspace from "$lib/components/table/all-workspace/AllWorkspace.svelte";
  import {
    isWorkspaceCreatedFirstTime,
    workspaceView,
  } from "$lib/store/workspace.store";
  import { generateSampleWorkspace } from "$lib/utils/sample/workspace.sample";
  import { ItemType, UntrackedItems } from "$lib/utils/enums/item-type.enum";
  import type { Path } from "$lib/utils/interfaces/request.interface";
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import { v4 as uuidv4 } from "uuid";
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  import { WorkspaceViewModel } from "../../../pages/Workspaces/workspace.viewModel";
  import type { WorkspaceMethods } from "$lib/utils/interfaces/workspace.interface";
  import WorkspaceCardList from "../dashboard/workspace-card-list/WorkspaceCardList.svelte";
  import { onDestroy } from "svelte";
  export let workspaceMethods: WorkspaceMethods;
  export let loaderColor = "default";

  let isLoading: boolean = false;

  const _viewModel = new WorkspaceViewModel();

  const handleCreateWorkSpace = async () => {
    isWorkspaceCreatedFirstTime.set(true);
    const workspaceObj = generateSampleWorkspace(
      UntrackedItems.UNTRACKED + uuidv4(),
      new Date().toString(),
    );

    const workspaceData = {
      name: workspaceObj.name,
      type: ItemType.PERSONAL,
    };
    _viewModel.addWorkspace(workspaceObj);
    isLoading = true;
    const response = await _viewModel.createWorkspace(workspaceData);

    if (response.isSuccessful) {
      navigate("/dashboard");
      isLoading = false;
      _viewModel.addWorkspace(response.data.data);

      let totalCollection: number = 0;
      let totalRequest: number = 0;

      if ($data) {
        $data.map((item) => {
          if (item) {
            if (item._data._id === response.data.data._id) {
              totalCollection = item?._data?.collections?.length;
            } else {
              totalRequest = 0;
            }
          }
        });
      }
      let path: Path = {
        workspaceId: response?.data?.data?._id,
        collectionId: "",
      };

      workspaceObj.id = response.data.data._id;
      workspaceObj.name = response.data.data.name;
      workspaceObj.path = path;
      workspaceObj.property.workspace.requestCount = totalRequest;
      workspaceObj.property.workspace.collectionCount = totalCollection;
      workspaceObj.save = true;
      _viewModel.addWorkspace(workspaceObj);

      workspaceMethods.handleCreateTab(workspaceObj);
      moveNavigation("right");
      isWorkspaceCreatedFirstTime.set(true);
    } else {
      isLoading = false;
    }
  };

  let selectedTab = "all-workspace";
  let selectedView: string;
 
  let selectedViewSubscribe = workspaceView.subscribe((value) => {
    selectedView = value;
  });

  onDestroy(() => {
    selectedViewSubscribe();
  });
</script>

<div class="teams-content bg-backgroundColor">
  <div class="content-teams px-3 pt-5">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12 pb-3">
          <div class="team-heading d-flex justify-content-between">
            <h2 class="d-flex">
              <p
                class={`text-defaultColor m-auto text-center align-items-center justify-content-center profile-circle bg-dullBackground border-defaultColor border-2`}
                style={`font-size: 40px; padding-top: 2px; width: 60px; height: 60px; display: flex; border: 2px solid #45494D;border-radius: 50%;`}
              >
                J
              </p>
              <span class="ms-4 my-auto">John's Team</span>
            </h2>
            <div class="d-flex">
              <button
                style="font-size: 12px;"
                class="d-flex align-items-center me-4 justify-content-center btn px-3 pt-1 d-flex btn-sm content-teams__btn-invite text-white"
                >Invite</button
              >
              <button
                style="font-size: 12px;"
                on:click={handleCreateWorkSpace}
                class=" d-flex align-item-center justify-content-center btn pt-1 btn-primary px-3 content-teams__btn-new-workspace btn-sm text-white"
                >{#if isLoading}
                  <span class="ms-0 me-1">
                    {#if loaderColor === "default"}
                      <Spinner size={"15px"} />
                    {/if}
                  </span>
                {/if}New Workspace</button
              >
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-12">
          <div
            class="teams-menu d-flex justify-content-between align-items-center pb-4"
          >
            <div class="teams-menu__left gap-4">
              <Link style="text-decoration:none;" to="all-workspace"
                ><span
                  style="padding: 8px 8px;"
                  on:click={() => (selectedTab = "all-workspace")}
                  class="team-menu__link"
                  class:tab-active={selectedTab === "all-workspace"}
                  >Workspaces ({$data?.length})</span
                ></Link
              >
              <Link style="text-decoration:none;" to="personal-workspaces"
                ><span
                  style="padding: 8px 8px;"
                  on:click={() => (selectedTab = "settings")}
                  class="team-menu__link"
                  class:tab-active={selectedTab === "settings"}>Settings</span
                ></Link
              >
            </div>
            <div class="teams-menu__right">
              <span class="mx-3" style="cursor:pointer;">
                <img
                  on:click={() => {
                    workspaceView.set("GRID");
                  }}
                  class:view-active={selectedView === "GRID"}
                  src={table}
                  alt=""
                />
              </span>
              <span style="cursor:pointer;">
                <img
                  on:click={() => {
                    workspaceView.set("TABLE");
                  }}
                  class:view-active={selectedView === "TABLE"}
                  src={hamburger}
                  alt=""
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- <Route path="/all-workspace"> -->
    {#if selectedView == "TABLE" && selectedTab == "all-workspace"}
      <AllWorkspace {data} {selectedTab} />
    {:else if selectedView == "GRID" && selectedTab == "all-workspace" && $data}
      <WorkspaceCardList workspaces={$data.slice().reverse()} />
    {/if}
    <!-- </Route> -->
  </div>
</div>

<style>
  .team-menu__link {
    color: var(--button-color);
  }
  .content-teams__btn-new-workspace {
    height: 30px;
    background-color: var(--send-button);
  }
  .content-teams__btn-invite {
    height: 30px;
    background-color: var(--border-color);
  }
  .tab-active {
    color: var(--white-color);
    border-bottom: 3px solid var(--workspace-hover-color);
  }
  .view-active {
    filter: invert(65%) sepia(63%) saturate(551%) hue-rotate(185deg)
      brightness(103%) contrast(104%);
  }
</style>
