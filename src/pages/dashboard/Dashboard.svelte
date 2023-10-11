<script lang="ts">
    import { Route } from "svelte-navigator";
    import Sidebar from "$lib/components/sidebar/Sidebar.svelte";
    import Teams from "./teams/Teams.svelte";
    import Navigate from "../../routing/Navigate.svelte";
</script>


<div class="dashboard-teams d-flex"><Sidebar/>
    <Route path="/collections"> Collections </Route>
    <Route path="/mock"> Mock </Route>
    <Route path="/environment"> Environment </Route>
    <Route path="/api-builder"> API Builder </Route>
    <Route path="/wiki"> Wiki </Route>
    <Route path="/teams"> <Teams/> </Route>
    <Route path="/workspaces"> Workspaces </Route>
    <Route path="/help"> Help </Route>
    <Route path="/*">
        <Navigate to="/dashboard/collections" />
    </Route>
</div>

<style>
    .dashboard-teams{
        margin-left: 72px;
        padding: 8px 24px 8px 8px;
    }
</style>