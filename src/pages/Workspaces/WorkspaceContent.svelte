<script lang="ts">
  import { Link, Route } from "svelte-navigator";
  import Workspaces from "$lib/components/teams/teams-content/workspaces/Workspaces.svelte";

  import table from "$lib/assets/table.svg";
  import hamburger from "$lib/assets/hamburger.svg";
  export let data: any;
  import Navigate from "../../routing/Navigate.svelte";
  import PersonalWorkspace from "$lib/components/table/personal-workspace/PersonalWorkspace.svelte";
  import { isWorkspaceCreatedFirstTime } from "$lib/store/workspace.store";
  import { generateSampleWorkspace } from "$lib/utils/sample/workspace.sample";
  import { UntrackedItems } from "$lib/utils/enums/item-type.enum";
  import { HeaderDashboardViewModel } from "$lib/components/header/header-dashboard/HeaderDashboard.ViewModel";
  import type { Path } from "$lib/utils/interfaces/request.interface";
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  export let collectionsMethods: CollectionsMethods;
  export let loaderColor = "default";

  let isLoading: boolean = false;

  const _viewModel = new HeaderDashboardViewModel();

  const handleCreateWorkSpace = async () => {
    isWorkspaceCreatedFirstTime.set(true);
    const workspaceObj = generateSampleWorkspace(
      UntrackedItems.UNTRACKED,
      new Date().toString(),
    );
   
    const workspaceData = {
      name: workspaceObj.name,
      type: workspaceObj.type,
    };

    _viewModel.addWorkspace(workspaceObj);

    isLoading = true;

    const response = await _viewModel.createWorkspace(workspaceData);

    if (response.isSuccessful) {
      isLoading = false;
      _viewModel.addWorkspace(response.data.data);

      let totalCollection: number = 0;
      let totalRequest: number = 0;

      if ($data) {
        $data.map((item) => {
          if (item) {
            if (item._data._id === response.data.data_id) {
              // totalCollection = item?._data?.collections?.length;
              totalCollection = 0;
            } else {
              totalRequest = 0;
            }
          }
        });
      }
      let path: Path = {
        workspaceId: response.data.data_id,
        collectionId: "",
      };

      workspaceObj.id = response.data.data_id;
      workspaceObj.name = response.data.data.name;
      workspaceObj.path = path;
      workspaceObj.property.workspace.requestCount = totalRequest;
      workspaceObj.property.workspace.collectionCount = 0;
      workspaceObj.save = true;
      _viewModel.addWorkspace(workspaceObj);

      collectionsMethods.handleCreateTab(workspaceObj);
      moveNavigation("right");
      isWorkspaceCreatedFirstTime.set(true);
    } else {
      isLoading = false;
    }
  };

  let selectedTab = "recent";
  let selectedView = "table";
</script>

<div class="teams-content bg-backgroundColor">
  <div class="content-teams px-3 pt-5">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12 pb-3">
          <div class="team-heading d-flex justify-content-between">
            <h2>Workspaces</h2>
            <div class="d-flex">
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
              <Link style="text-decoration:none;" to="recent"
                ><span
                  style="padding: 8px 8px;"
                  on:click={() => (selectedTab = "recent")}
                  class="team-menu__link"
                  class:tab-active={selectedTab === "recent"}>Recent</span
                ></Link
              >
              <Link style="text-decoration:none;" to="all-workspace"
                ><span
                  style="padding: 8px 8px;"
                  on:click={() => (selectedTab = "all-workspace")}
                  class="team-menu__link"
                  class:tab-active={selectedTab === "all-workspace"}>All</span
                ></Link
              >
              <Link style="text-decoration:none;" to="personal-workspaces"
                ><span
                  style="padding: 8px 8px;"
                  on:click={() => (selectedTab = "personal-workspaces")}
                  class="team-menu__link"
                  class:tab-active={selectedTab === "personal-workspaces"}
                  >Personal Workspaces</span
                ></Link
              >
              <!-- <Link style="text-decoration:none;" to="team-workspaces"
                ><span
                  style="padding: 8px 8px;"
                  on:click={() => (selectedTab = "team-workspaces")}
                  class="team-menu__link mx-3"
                  class:tab-active={selectedTab === "team-workspaces"}
                  >Team Workspaces</span
                ></Link
              > -->
            </div>
            <div class="teams-menu__right">
              <span class="mx-3" style="cursor:pointer;">
                <img
                  on:click={() => {
                    selectedView = "table";
                  }}
                  class:view-active={selectedView === "grid"}
                  src={table}
                  alt=""
                />
              </span>
              <span style="cursor:pointer;">
                <img
                  on:click={() => {
                    selectedView = "table";
                  }}
                  class:view-active={selectedView === "table"}
                  src={hamburger}
                  alt=""
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Route path="/recent"
      ><Workspaces {data} {selectedView} {selectedTab} /></Route
    >
    <Route path="/all-workspace"
      ><PersonalWorkspace {data} {selectedTab} /></Route
    >
    <Route path="/personal-workspaces"
      ><PersonalWorkspace {data} {selectedTab} /></Route
    >
    <!-- <Route path="/team-workspace">Team workspace</Route> -->
    <Route path="/"><Navigate to="recent" /></Route>
  </div>
</div>

<style>
  .team-menu__link {
    color: #8a9299;
  }
  .content-teams__btn-new-workspace {
    height: 30px;
  }
  .tab-active {
    color: white;
    border-bottom: 3px solid #85c2ff;
  }
  .view-active {
    filter: invert(78%) sepia(86%) saturate(3113%) hue-rotate(177deg)
      brightness(100%) contrast(100%);
  }
</style>
