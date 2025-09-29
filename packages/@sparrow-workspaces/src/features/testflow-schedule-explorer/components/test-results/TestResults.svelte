<script lang="ts">
  export let schedule;
</script>

{#if schedule?.schedularRunHistory}
  {#each schedule?.schedularRunHistory as result}
    <div>
      {result?.createdAt} - {result?.status} = success: {result?.successRequests}
      , failed: {result?.failedRequests}
    </div>
  {/each}
{/if}
