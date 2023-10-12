<script lang="ts">
    export let project: any;
</script>

<div class="col-6 pb-4">
    <div class="bg-black rounded p-4">
        <h4>{project.title}</h4>
        <p class="teams-workspace__para mb-1"><span>{project.apis}</span>APIs <span>{project.collection}</span>COLLECTIONS</p>
        <p class="teams-workspace__date mb-0">Last updated on <span>{project.date}</span></p>
    </div>
</div>

<style>
    .teams-workspace__para{
        font-size: 12px;
        color: #45494D;
    }
    .teams-workspace__para span{
        color: #85C2FF;
        font-size: 16px;
    }
    .teams-workspace__date{
        color: #45494D;
        font-size: 16px;
    }
    .teams-workspace__date span{
        font-size: 14px;
        color: white;
    }
</style>