<script lang="ts">
    export let projects: any;
</script>
<section class="teams-workspace">
    <div class="container-fluid">
        <div class="row">
            {#each projects as project}
            <div class="col-6 pb-4">
                <div class="bg-black rounded p-4">
                    <h4>{project.title}</h4>
                    <p class="teams-workspace__para mb-1"><span>{project.apis}</span>APIs <span>{project.collection}</span>COLLECTIONS</p>
                    <p class="teams-workspace__date mb-0">Last updated on <span>{project.date}</span></p>
                </div>
            </div>
            {/each}
            <div class="col-6 pb-4">
                <div class="teams-add-workspace rounded p-5 d-flex align-items-center justify-content-center">
                    <p class="mb-0">+ Add New Workspace</p>
                </div>
            </div>
        </div>
    </div>
</section>
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
    .teams-add-workspace{
        border: 1px dashed;
        border-image-source: linear-gradient(270deg, #6147FF -1.72%, #1193F0 100%);
        border-image-slice: 1;
    }
    .teams-add-workspace p{
        background-color: red;
        background-image: linear-gradient(270deg, #6147FF -1.72%, #1193F0 100%);
        background-size: 100%;
        background-repeat: repeat;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent; 
        -moz-background-clip: text;
        -moz-text-fill-color: transparent;
    }
</style>