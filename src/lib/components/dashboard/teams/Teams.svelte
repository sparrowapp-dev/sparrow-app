<script lang="ts">
    import plus from "$lib/assets/plus.svg";
    export let teams : any; 
</script>

<section class="pb-4">
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

<style>
    .teams-heading{
        font-size: 14px;
        font-weight: 700;
        line-height: 21px;
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