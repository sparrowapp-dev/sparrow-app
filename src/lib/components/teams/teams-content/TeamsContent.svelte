<script lang="ts">
  import { Link, Route } from "svelte-navigator";
  import Workspaces from "$lib/components/teams/teams-content/workspaces/Workspaces.svelte";
  import Navigate from "../../../../routing/Navigate.svelte";
  import table from "$lib/assets/table.svg";
  import hamburger from "$lib/assets/hamburger.svg";
  import people from "$lib/assets/people.svg";

  let projects = [
    {
      title: "Domigo BMS",
      apis: "34",
      collection: "32",
      date: "16:21 August 12",
    },
    {
      title: "Domigo BMS",
      apis: "34",
      collection: "32",
      date: "16:21 August 12",
    },
    {
      title: "Domigo BMS",
      apis: "34",
      collection: "32",
      date: "16:21 August 12",
    },
    {
      title: "Domigo BMS",
      apis: "34",
      collection: "32",
      date: "16:21 August 12",
    },
    {
      title: "Domigo BMS",
      apis: "34",
      collection: "32",
      date: "16:21 August 12",
    },
    {
      title: "Domigo BMS",
      apis: "34",
      collection: "32",
      date: "16:21 August 12",
    },
  ];
  let members = 12;
  let selectedTab = "workspaces";
  let selectedView = "grid";
</script>

<div class="teams-content bg-backgroundColor" style="left:352px;">
  <div class="content-teams p-5">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12 pb-3">
          <div class="team-heading d-flex justify-content-between">
            <h2>Techdome</h2>
            <div class="d-flex">
              <button style="height: 36px;" class="disable-member-btn"
                ><img src={people} alt="" /> {members} members</button
              >
              <button
                class="btn btn-outline-primary btn-sm content-teams__btn-invite mx-3"
                >Invite</button
              >
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
            class="teams-menu d-flex justify-content-between align-items-center pb-3"
          >
            <div class="teams-menu__left">
              <Link style="text-decoration:none;" to="workspaces"
                ><span
                  style="padding: 8px 8px;"
                  on:click={() => (selectedTab = "workspaces")}
                  class="team-menu__link"
                  class:tab-active={selectedTab === "workspaces"}
                  >Workspaces</span
                ></Link
              >
              <Link style="text-decoration:none;" to="members"
                ><span
                  style="padding: 8px 8px;"
                  on:click={() => (selectedTab = "members")}
                  class="team-menu__link mx-3"
                  class:tab-active={selectedTab === "members"}>Members</span
                ></Link
              >
              <Link style="text-decoration:none;" to="settings"
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
                    selectedView = "grid";
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

    <Route path="/workspaces"><Workspaces {projects} {selectedView} /></Route>
    <Route path="/members">members</Route>
    <Route path="/settings">settings</Route>
    <Route path="/*"><Navigate to="workspaces" /></Route>
  </div>
</div>

<style>
  .teams-content {
    top: 44px;
    position: fixed;
    height: calc(100vh - 44px);
  }
  .disable-member-btn {
    background-color: transparent;
    border: none;
    outline: none;
    cursor: text;
  }
  .team-menu__link {
    color: #8a9299;
  }
  .content-teams__btn-invite {
    width: 63px;
    height: 36px;
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
