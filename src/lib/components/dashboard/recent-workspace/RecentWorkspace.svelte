<script lang="ts">
    export let workspace: any;
</script>
<section>
    <h6 class="teams-heading">Recent Workspace</h6>
    {#each workspace as works}
    <div class="d-flex pb-3">
        <p class="mb-0 recent-workspace">{works}</p>
    </div>
    {/each}
</section>
<style>
     .teams-heading{
        font-size: 14px;
        font-weight: 700;
        line-height: 21px;
    }
    .recent-workspace{
        font-size: 12px;
        color: #F5F5F5;
    }
</style>