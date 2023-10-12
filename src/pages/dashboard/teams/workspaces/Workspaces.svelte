<script lang="ts">
    import WorkspaceCard from "$lib/components/common/workspaceCard/WorkspaceCard.svelte";

    export let projects: any;
</script>
<section class="teams-workspace">
    <div class="container-fluid">
        <div class="row">
            {#each projects as project}
            <WorkspaceCard project = {project} />
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
    .teams-add-workspace{
        border: 1px dashed;
        border-image-source: linear-gradient(270deg, #6147FF -1.72%, #1193F0 100%);
        border-image-slice: 1;
        cursor:pointer;
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