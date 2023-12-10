<script lang="ts">
  import { Link, Route } from "svelte-navigator";
  import Workspaces from "$lib/components/teams/teams-content/workspaces/Workspaces.svelte";

  import table from "$lib/assets/table.svg";
  import hamburger from "$lib/assets/hamburger.svg";
  export let data: any;
  import Navigate from "../../routing/Navigate.svelte";
  import PersonalWorkspace from "$lib/components/table/personal-workspace/PersonalWorkspace.svelte";

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
                class="btn btn-primary btn-sm content-teams__btn-new-workspace text-white"
                >New Workspace</button
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

    <Route path="/recent"><Workspaces {data} {selectedView} /></Route>
    <Route path="/all-workspace">All</Route>
    <Route path="/personal-workspace">Personal workspace</Route>
    <!-- <Route path="/team-workspace">Team workspace</Route> -->
    <Route path="/*"><Navigate to="recent" /></Route>
  </div>
</div>

<style>
  .team-menu__link {
    color: #8a9299;
  }
  .content-teams__btn-new-workspace {
    height: 36px;
    width: 140px;
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
