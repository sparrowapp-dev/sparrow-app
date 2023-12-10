<script lang="ts">
  export let data: any;
</script>

<section>
  <h6 class="teams-heading">Recent Workspace</h6>
  {#if $data}
    {#each $data.slice().reverse() as list, index}
      <div class="d-flex pb-3">
        <p class="mb-0 recent-workspace">{list.name}</p>
      </div>
    {/each}
  {/if}
</section>

<style>
  .teams-heading {
    font-size: 14px;
    font-weight: 700;
    line-height: 21px;
  }
  .recent-workspace {
    font-size: 12px;
    color: #f5f5f5;
  }
</style>
