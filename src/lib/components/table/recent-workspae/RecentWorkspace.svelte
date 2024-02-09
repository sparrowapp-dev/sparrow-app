<script lang="ts">
  /**
   * @deprecated This component is deprecated and will be removed in future releases.
   * Please use Table Component instead.
   */
  import { calculateTimeDifferenceInDays } from "$lib/utils/workspacetimeUtils";
  export let data: any;
  export let selectedTab: string;
</script>

<table class="table table-responsive bg-backgroundColor" data-search="true">
  <thead>
    <tr>
      <th data-sortable="true" class="tab-head">Workspace</th>
      <th data-sortable="true" class="tab-head">Team</th>

      <th class="tab-head">Collections</th>
      <th class="tab-head">Last Updated</th>
    </tr>
  </thead>
  <tbody>
    {#if $data}
      {#each $data.slice().reverse() as list, index}
        {#if selectedTab === "recent" && index < 5}
          <tr>
            <td class="tab-data py-3">{list?.name}</td>
            <td class="tab-data py-3">{list?.owner?.type}</td>

            <td class="tab-data py-3">{list?.collections?.length ?? 0}</td>
            <td class="tab-data py-3"
              >{calculateTimeDifferenceInDays(
                new Date(),
                new Date(list?.createdAt),
              )}</td
            >
          </tr>
        {:else if selectedTab === "personal-workspace"}
          <tr>
            <td class="tab-data py-3">{list?.name}</td>
            <td class="tab-data py-3">{list?.owner?.type}</td>
            <td class="tab-data py-3">12</td>
            <td class="tab-data py-3">{list?.collections?.length ?? 0}</td>
            <td class="tab-data py-3"
              >{calculateTimeDifferenceInDays(
                new Date(),
                new Date(list?.createdAt),
              )}</td
            >
          </tr>
        {/if}
      {/each}
    {/if}
  </tbody>
</table>

<style>
  .tab-data {
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;

    background-color: transparent;
  }
  .tab-head {
    padding: 8px;
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
    color: #8a9299;
    background-color: transparent;
  }

  .table {
    overflow: auto;
  }
</style>
