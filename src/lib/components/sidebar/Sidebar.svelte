<script>
    import collections from "$lib/assets/collections.svg";
    import mock from "$lib/assets/mock.svg";
    import environment from "$lib/assets/environment.svg";
    import apibuilder from "$lib/assets/api-builder.svg";
    import wiki from "$lib/assets/wiki.svg";
    import teams from "$lib/assets/teams.svg";
    import workspaces from "$lib/assets/workspaces.svg";
    import help from "$lib/assets/circle-question.svg";
    import Helper from "./Helper.svelte";
</script>

<div class="sidebar">
    <div class="sidebar__main">
        <Helper route="collections" heading="Collections" logo={collections}/>
        <Helper route="mock" heading="Mock" logo={mock}/>
        <Helper route="environment" heading="Environment" logo={environment}/>
        <Helper route="api-builder" heading="API Builder" logo={apibuilder}/>
        <Helper route="wiki" heading="Wiki" logo={wiki}/>
        <Helper route="teams" heading="Teams" logo={teams}/>
        <Helper route="workspaces" heading="Workspaces" logo={workspaces}/>
        
    </div>
    <div class="sidebar__help">
        <Helper route="help" heading="Help" logo={help}/>
    </div>

</div>
<style>
    .sidebar{
        height: 100vh;
        width: 72px;
        display: flex;
        flex-direction: column;
        padding: 12px 4px 12px 4px;
        border-right: 1px solid #313233;
        justify-content: space-between;
        position: fixed;
        top:0;
        left:0;
    }
    .sidebar__main{
        display: flex;
        flex-direction: column;
    }
    .sidebar__help{
        display: flex;
        align-items: center;
        justify-content: center;
    }
   
    
</style>