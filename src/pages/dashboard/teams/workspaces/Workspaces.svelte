<script lang="ts">
    import WorkspaceCard from "$lib/components/dashboard/workspace-card/WorkspaceCard.svelte";
    export let projects: any;
    export let gridView: boolean;
</script>

{#if gridView}
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
{:else}
<section class="teams-workspace">
    <div class="container-fluid">
        <div class="row">
            <div class="col-12">
                <table class="table table-responsive" data-search="true" >
                    <thead>
                        <tr>
                          <th data-sortable="true" class="tab-head">Workspace</th>
                          <th data-sortable="true" class="tab-head">Team</th>
                          <th class="tab-head">APIs</th>
                          <th class="tab-head">Collections</th>
                          <th class="tab-head">Last Updated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each projects as project}
                        <tr>
                            <td class="tab-data">{project.title}</td>
                            <td class="tab-data">{project.title}</td>
                            <td class="tab-data">{project.apis}</td>
                            <td class="tab-data">{project.collection}</td>
                            <td class="tab-data">{project.date}</td>
                        </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</section>
{/if}

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
    .tab-data{
        padding: 8px;
        font-family: Roboto;
        font-size: 12px;
        font-weight: 500;
        line-height: 18px;
    }
    .tab-head{
        padding: 8px;
        font-family: Roboto;
        font-size: 12px;
        font-weight: 700;
        line-height: 18px;
        color: #8A9299;
    }
</style>