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
  
    let teams= [
        {name: "Techdome", icon : "https://media.licdn.com/dms/image/C4D0BAQFfIHYVwIh9Sg/company-logo_200_200/0/1673252621612/techdome_solutions_logo?e=2147483647&v=beta&t=qtBSoQK4rWfcefg6BU4d-EiHAzyR0metwD_lHh3SWnU"},
        {name: "Microsoft", icon: "https://media.licdn.com/dms/image/C4D0BAQFfIHYVwIh9Sg/company-logo_200_200/0/1673252621612/techdome_solutions_logo?e=2147483647&v=beta&t=qtBSoQK4rWfcefg6BU4d-EiHAzyR0metwD_lHh3SWnU"}
    ];
    let workspace = ["Luxfer", "Domigo", "Kwison", "Neat Heat"];
    let recentAPI = [
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
    let gridView : boolean = true;
</script>

<div class="sidebar-teams">
    <Teams teams = {teams} />
    <hr/>
    <RecentAPI recentAPI = {recentAPI} />
    <hr/>
    <RecentWorkspace workspace = {workspace} />
</div>
<div class="content-teams p-5">
    
    <div class="container-fluid">
        <div class="row">
            <div class="col-12 pb-3">
                <div class="team-heading d-flex justify-content-between">
                    <h2>Techdome</h2>
                    <div class="d-flex">
                        <button style="height: 36px;" class="disable-member-btn"><img src={people} alt=""/> {members} members</button>
                        <button class="btn btn-outline-primary btn-sm content-teams__btn-invite mx-3">Invite</button>
                        <button class="btn btn-primary btn-sm content-teams__btn-new-workspace text-white">New Workspace</button>
                    </div>        
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-12">
                <div class="teams-menu d-flex justify-content-between align-items-center pb-3">
                    <div class="teams-menu__left">
                        <Link style="text-decoration:none;" to="workspaces"><span class="team-menu__link">Workspaces</span></Link>
                        <Link style="text-decoration:none;" to="members"><span class="team-menu__link mx-3">Members</span></Link>
                        <Link style="text-decoration:none;" to="settings"><span class="team-menu__link">Settings</span></Link>
                    </div>
                    <div class="teams-menu__right">
                        <span class="mx-3" style="cursor:pointer;">
                            <img on:click={()=>{gridView = true}} src={table} alt=""/>
                        </span>
                        <span style="cursor:pointer;">
                            <img on:click={()=>{gridView = false}} src={hamburger} alt=""/>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <Route path="/workspaces"> <Workspaces projects={projects} gridView = {gridView} /> </Route>
    <Route path="/members">members</Route>
    <Route path="/settings">settings</Route>
    <Route path="/*"> <Navigate to="workspaces"/> </Route>
</div>
  

<style>
    .sidebar-teams{
        width: 280px;
        border-right: 1px solid #313233;
        padding: 15px;
        height: 100vh;
        overflow: auto;
    }
    .content-teams{
        width: calc(100% - 280px);
    }
    .disable-member-btn{
        background-color: transparent;
        border: none;
        outline: none;
        cursor: text;
    }
    .team-menu__link{
        color: #8A9299;
    }
    .team-menu__link:hover{
        color: white;
    }
    .content-teams__btn-invite{
        width: 63px;
        height: 36px;
    }
    .content-teams__btn-new-workspace{
        height: 36px;
        width: 140px;
    }
</style>