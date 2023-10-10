<script lang="ts">
    import Sidebar from "../../lib/components/sidebar/Sidebar.svelte";
    let teams= ["Techdome", "Microsoft"];
    let workspace = ["Luxfer", "Domigo", "Kwison", "Neat Heat"];
    let recentAPIs = [
        { type: "DEL", title : "Cancel Booking", endpoint : "Domigo/bookings (book)"},
        { type: "DEL", title : "Cancel Booking", endpoint : "Domigo/bookings (book)"},
        { type: "DEL", title : "Cancel Booking", endpoint : "Domigo/bookings (book)"},
    ];
    let projects = [
        {title : "Domigo BMS", apis : "34", collection: "32", date: "16:21 August 12"},
        {title : "Domigo BMS", apis : "34", collection: "32", date: "16:21 August 12"},
        {title : "Domigo BMS", apis : "34", collection: "32", date: "16:21 August 12"},
        {title : "Domigo BMS", apis : "34", collection: "32", date: "16:21 August 12"},
        {title : "Domigo BMS", apis : "34", collection: "32", date: "16:21 August 12"},
        {title : "Domigo BMS", apis : "34", collection: "32", date: "16:21 August 12"},
    ];
</script>

<div class="dashboard-teams d-flex"><Sidebar/>
    <div class="sidebar-teams">
        <section class="pb-2">
            <div class="sidebar-teams-header d-flex justify-content-between">
                <h6>Teams</h6>
                <div>icon</div>
            </div>
            {#each teams as team}
            <div class="d-flex">
                <img src="" />
                <p class="mb-0">{team}</p>
            </div>
            {/each}
        </section>
        <hr/>
        <section>
            <h6>Recent APIs</h6>
            {#each recentAPIs as api}
            <div class="d-flex flex-start">
                <div class="api-type d-flex align-items-center justify-content-center">{api.type}</div>
                <div>
                    <p class="mb-0">{api.title}</p>
                    <p class="mb-0">{api.endpoint}</p>
                </div>
            </div>
            {/each}
        </section>
        <hr/>
        <section>
            <h6>Recent Workspace</h6>
            {#each workspace as works}
            <div class="d-flex">
                <p class="mb-0">{works}</p>
            </div>
            {/each}
        </section>
    </div>
    <div class="content-teams p-5">
        <div class="team-heading d-flex justify-content-between">
            <h2>Techdome</h2>
            <div class="d-flex">


            </div>        

        </div>
        <div class="container-fluid">
            <div class="row">
                {#each projects as project}
                <div class="col-6">
                    <div>
                        <h3>{project.title}</h3>
                        <p>{project.apis}APIs {project.collection}COLLECTIONS</p>
                        <p>Last updated on {project.date}</p>
                    </div>
                </div>
                {/each}
            </div>
        </div>
    </div>
</div>
<style>
    .dashboard-teams{
        margin-left: 72px;
        padding: 8px 24px 8px 8px;
    }
    .sidebar-teams{
        width: 280px;
    }
    .api-type{
        height:40px;
        width: 40px;
        border: 1px solid grey;
        margin-right: 5px;
    }
</style>