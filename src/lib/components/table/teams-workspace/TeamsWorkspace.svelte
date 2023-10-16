<script lang="ts">
    export let projects: any;
</script>

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
        {#each projects as workspace}
        <tr>
            <td class="tab-data">{workspace.title}</td>
            <td class="tab-data">{workspace.title}</td>
            <td class="tab-data">{workspace.apis}</td>
            <td class="tab-data">{workspace.collection}</td>
            <td class="tab-data">{workspace.date}</td>
        </tr>
        {/each}
    </tbody>
</table>
<style>
    .tab-data{
        padding: 8px;
        font-size: 12px;
        font-weight: 500;
        line-height: 18px;
        background-color: transparent;
    }
    .tab-head{
        padding: 8px;
        font-size: 12px;
        font-weight: 500;
        line-height: 18px;
        color: #8A9299;
        background-color: transparent;
    }
</style>