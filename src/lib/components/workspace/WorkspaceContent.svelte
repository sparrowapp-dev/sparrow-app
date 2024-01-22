<script lang="ts">
  import { Link } from "svelte-navigator";
  import table from "$lib/assets/table.svg";
  import hamburger from "$lib/assets/hamburger.svg";
  import AllWorkspace from "$lib/components/table/all-workspace/AllWorkspace.svelte";
  import { workspaceView, openedTeam } from "$lib/store";
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  import { TeamViewModel } from "../../../pages/Teams/team.viewModel";
  import WorkspaceCardList from "../dashboard/workspace-card-list/WorkspaceCardList.svelte";
  import { onDestroy } from "svelte";
  import type { CurrentTeam, WorkspaceMethods } from "$lib/utils/interfaces";
  import { base64ToURL } from "$lib/utils/helpers";
  export let data: any;
  export let loaderColor = "default",
    userId: string,
    handleWorkspaceSwitch: any,
    handleWorkspaceTab: any,
    workspaceMethods: WorkspaceMethods,
    activeSideBarTabMethods: any,
    currentTeam: CurrentTeam,
    handleCreateWorkspace: any;
  let currOpenedTeam: CurrentTeam;
  const openedTeamSubscribe = openedTeam.subscribe((value) => {
    if (value) currOpenedTeam = value;
  });

  let isLoading: boolean = false;

  const _viewModel = new TeamViewModel();

  let selectedTab = "all-workspace";
  let selectedView: string;

  let selectedViewSubscribe = workspaceView.subscribe((value) => {
    selectedView = value;
  });

  onDestroy(() => {
    selectedViewSubscribe();
    openedTeamSubscribe();
  });
</script>

<div class="teams-content bg-backgroundColor">
  <div class="content-teams px-md-1 px-lg-3 px-3 pt-5">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12 pb-3">
          <div class="team-heading d-flex justify-content-between">
            <h2 class="d-flex ellipsis overflow-hidden w-75">
              {#if base64ToURL(currOpenedTeam.base64String) && base64ToURL(currOpenedTeam.base64String) !== ""}
                <img
                  class="text-center align-items-center justify-content-center profile-circle bg-dullBackground mb-3"
                  style="width: 60px !important; height: 60px !important; padding-top: 2px; display: flex; border-radius: 50%;"
                  src={base64ToURL(currOpenedTeam.base64String)}
                  alt=""
                />{:else}
                <p
                  class={`text-defaultColor w-25 text-center align-items-center justify-content-center profile-circle bg-dullBackground border-defaultColor border-2`}
                  style={`font-size: 40px; padding-top: 2px; width: 60px !important; height: 60px !important; display: flex; border: 2px solid #45494D;border-radius: 50%;`}
                >
                  {currOpenedTeam.name[0]
                    ? currOpenedTeam.name[0].toUpperCase()
                    : ""}
                </p>
              {/if}
              <span class="ms-4 w-75 my-auto my-auto ellipsis overflow-hidden"
                >{currOpenedTeam.name}</span
              >
            </h2>
            <div class="d-flex w-25">
              <button
                style="font-size: 12px;"
                class="d-flex align-items-center me-4 my-auto justify-content-center btn px-3 pt-1 d-flex btn-sm content-teams__btn-invite text-white"
                >Invite</button
              >
              <button
                style="font-size: 12px;"
                on:click={handleCreateWorkspace}
                class=" d-flex my-auto align-item-center justify-content-center btn pt-1 btn-primary px-3 content-teams__btn-new-workspace btn-sm text-white"
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
                  >Workspaces {$data &&
                  $data
                    .slice()
                    .filter((item) => item.team.teamId == currOpenedTeam.id)
                    .length > 0
                    ? `(${
                        $data
                          ?.slice()
                          .filter(
                            (item) => item.team.teamId == currOpenedTeam.id,
                          ).length
                      })`
                    : ""}</span
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
      <AllWorkspace
        openedTeam={currOpenedTeam}
        {data}
        {selectedTab}
        {handleWorkspaceSwitch}
        {handleWorkspaceTab}
        {activeSideBarTabMethods}
      />
    {:else if selectedView == "GRID" && selectedTab == "all-workspace" && $data}
      <WorkspaceCardList
        {handleCreateWorkspace}
        openedTeam={currOpenedTeam}
        currActiveTeam={currentTeam}
        workspaces={data}
        {handleWorkspaceSwitch}
        {handleWorkspaceTab}
        {activeSideBarTabMethods}
      />
    {/if}
    <!-- </Route> -->
  </div>
</div>

<style>
  .teams-content {
    width: 100%;
  }
  @media only screen and (max-width: 1000px) {
    .team-heading {
      display: block !important;
    }
    .team-heading > h2,
    .team-heading > div {
      width: 100% !important;
    }
  }
  .team-menu__link {
    color: var(--button-color);
  }
  .content-teams__btn-new-workspace {
    height: 30px;
    background-color: #1193f0;
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
