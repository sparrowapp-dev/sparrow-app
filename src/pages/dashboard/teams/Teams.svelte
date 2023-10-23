<script lang="ts">
  import { Link, Route } from "svelte-navigator";
  import Workspaces from "./workspaces/Workspaces.svelte";
  import Navigate from "../../../routing/Navigate.svelte";
  import table from "$lib/assets/table.svg";
  import hamburger from "$lib/assets/hamburger.svg";
  import people from "$lib/assets/people.svg";
  import RecentAPI from "$lib/components/dashboard/recent-apis/RecentAPI.svelte";
  import RecentWorkspace from "$lib/components/dashboard/recent-workspace/RecentWorkspace.svelte";
  import Teams from "$lib/components/dashboard/teams/Teams.svelte";

  let teams = [
    {
      name: "Techdome",
      icon: "https://media.licdn.com/dms/image/C4D0BAQFfIHYVwIh9Sg/company-logo_200_200/0/1673252621612/techdome_solutions_logo?e=2147483647&v=beta&t=qtBSoQK4rWfcefg6BU4d-EiHAzyR0metwD_lHh3SWnU",
    },
    {
      name: "Microsoft",
      icon: "https://media.licdn.com/dms/image/C4D0BAQFfIHYVwIh9Sg/company-logo_200_200/0/1673252621612/techdome_solutions_logo?e=2147483647&v=beta&t=qtBSoQK4rWfcefg6BU4d-EiHAzyR0metwD_lHh3SWnU",
    },
  ];
  let workspace = ["Luxfer", "Domigo", "Kwison", "Neat Heat"];
  let recentAPI = [
    {
      type: "DEL",
      title: "Cancel Booking wdmnahdsvcc csdabc cshb",
      endpoint: "Domigo/bookings (book) dcbjh cdbcdbcc eeej",
    },
    {
      type: "ARC",
      title: "Cancel Booking",
      endpoint: "Domigo/bookings (book)",
    },
    {
      type: "POST",
      title: "Cancel Booking",
      endpoint: "Domigo/bookings (book)",
    },
    {
      type: "PUT",
      title: "Cancel Booking",
      endpoint: "Domigo/bookings (book)",
    },
  ];
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

<div
  class="d-flex bg-backgroundColor"
  style="height:100vh; margin-top:50px"
>
  <div class="sidebar-teams">
    <Teams {teams} />
    <hr />
    <RecentAPI {recentAPI} />
    <hr />
    <RecentWorkspace {workspace} />
  </div>
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
  .sidebar-teams {
    margin-top: 50px;
    width: 280px;
    border-right: 1px solid #313233;
    padding: 15px;
    overflow: auto;
  }
  .content-teams {
    width: calc(100% - 280px);
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
