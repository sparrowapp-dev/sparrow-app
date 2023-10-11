<script lang="ts">
    import { Link, Route } from "svelte-navigator";
    import Workspaces from "./workspaces/Workspaces.svelte";
    import Navigate from "../../../routing/Navigate.svelte";
    import table from "$lib/assets/table.svg";
    import plus from "$lib/assets/plus.svg";
    import hamburger from "$lib/assets/hamburger.svg";
    import people from "$lib/assets/people.svg";
    import RecentApi from "$lib/components/common/recentAPI/RecentAPI.svelte";

    let teams= [
        {name: "Techdome", icon : "https://media.licdn.com/dms/image/C4D0BAQFfIHYVwIh9Sg/company-logo_200_200/0/1673252621612/techdome_solutions_logo?e=2147483647&v=beta&t=qtBSoQK4rWfcefg6BU4d-EiHAzyR0metwD_lHh3SWnU"},
        {name: "Microsoft", icon: "https://media.licdn.com/dms/image/C4D0BAQFfIHYVwIh9Sg/company-logo_200_200/0/1673252621612/techdome_solutions_logo?e=2147483647&v=beta&t=qtBSoQK4rWfcefg6BU4d-EiHAzyR0metwD_lHh3SWnU"}
    ];
    let workspace = ["Luxfer", "Domigo", "Kwison", "Neat Heat"];
    let recentAPIs = [
        { type: "DEL", title : "Cancel Booking wdmnahdsvcc csdabc cshb", endpoint : "Domigo/bookings (book) dcbjh cdbcdbcc eeej"},
        { type: "ARC", title : "Cancel Booking", endpoint : "Domigo/bookings (book)"},
        { type: "POST", title : "Cancel Booking", endpoint : "Domigo/bookings (book)"},
        { type: "PUT", title : "Cancel Booking", endpoint : "Domigo/bookings (book)"},
    ];
    let projects = [
        {title : "Domigo BMS", apis : "34", collection: "32", date: "16:21 August 12"},
        {title : "Domigo BMS", apis : "34", collection: "32", date: "16:21 August 12"},
        {title : "Domigo BMS", apis : "34", collection: "32", date: "16:21 August 12"},
        {title : "Domigo BMS", apis : "34", collection: "32", date: "16:21 August 12"},
        {title : "Domigo BMS", apis : "34", collection: "32", date: "16:21 August 12"},
        {title : "Domigo BMS", apis : "34", collection: "32", date: "16:21 August 12"},
    ];
    let members = 12;
</script>

<div class="sidebar-teams">
    <section class="pb-2">
        <div class="sidebar-teams-header d-flex justify-content-between">
            <h6 class="teams-heading">Teams</h6>
            <div><img src={plus} alt=""/></div>
        </div>
        {#each teams as team}
        <div class="d-flex align-items-center rounded teams-outer">
            <img src={team.icon} alt=""/>
            <p class=" mb-0">{team.name}</p>
        </div>
        {/each}
    </section>
    <hr/>
    <section>
        <h6 class="teams-heading">Recent APIs</h6>
        {#each recentAPIs as api}
            <RecentApi api = {api}/>
        {/each}
    </section>
    <hr/>
    <section>
        <h6 class="teams-heading">Recent Workspace</h6>
        {#each workspace as works}
        <div class="d-flex pb-3">
            <p class="mb-0 recent-workspace">{works}</p>
        </div>
        {/each}
    </section>
</div>
<div class="content-teams p-5">
    
    <div class="container-fluid">
        <div class="row">
            <div class="col-12 pb-3">
                <div class="team-heading d-flex justify-content-between">
                    <h2>Techdome</h2>
                    <div class="d-flex">
                        <button><img src={people} alt=""/> {members} members</button>
                        <button class="btn btn-outline-primary btn-sm px-4 mx-3">Invite</button>
                        <button class="btn btn-primary btn-sm px-4">New Workspace</button>
                    </div>        
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-12">
                <div class="teams-menu d-flex justify-content-between align-items-center pb-3">
                    <div class="teams-menu__left">
                        <Link style="text-decoration:none;" to="workspaces"><span>Workspaces</span></Link>
                        <Link style="text-decoration:none;" to="members"><span>Members</span></Link>
                        <Link style="text-decoration:none;" to="settings"><span>Settings</span></Link>
                    </div>
                    <div class="teams-menu__right">
                        <span class="mx-3"><img src={table} alt=""/></span><span><img src={hamburger} alt=""/></span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <Route path="/workspaces"> <Workspaces projects={projects} /> </Route>
    <Route path="/members">members</Route>
    <Route path="/settings">settings</Route>
    <Route path="/*"> <Navigate to="workspaces"/> </Route>
</div>
  

<style>
    .sidebar-teams{
        width: 280px;
        border-right: 1px solid #313233;
        padding: 15px;
    }
    .content-teams{
        width: calc(100% - 280px);
    }
    .teams-heading{
        font-size: 14px;
        font-weight: 700;
        line-height: 21px;
    }
    .recent-workspace{
        font-size: 12px;
        color: #F5F5F5;
    }
    .teams-outer{
        padding: 8px 7px;
    }
    .teams-outer:hover{
        background-color: #313233;
    }
    .teams-outer img{
        width: 20px;
        height: 20px;
        margin-right: 10px;
    }
</style>