<script lang="ts">
  export let data: any;
  function calculateTimeDifferenceInDays(currentTime, previousTime) {
    console.log(previousTime);
    const timeDifference = currentTime - previousTime;
    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    if (seconds > 0) return `${seconds} second${seconds > 1 ? "s" : ""} ago`;

    return "just now";
  }

  function afterSevenDays(timestamp) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 0);
    return new Date(timestamp) > sevenDaysAgo;
  }
</script>

<table class="table table-responsive bg-backgroundColor" data-search="true">
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
    {#if $data}
      {#each $data.slice().reverse() as list, index}
        {#if afterSevenDays(new Date(list?.createdAt))}
          <tr>
            <td class="tab-data py-3">{list?.name}</td>
            <td class="tab-data py-3">Personal Workspace</td>
            <td class="tab-data py-3">12</td>
            <td class="tab-data py-3">{list?.collections?.length}</td>
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
