<script lang="ts">
  export let data: any;
</script>

<section>
  <h6 class="teams-heading">Recent Workspace</h6>
  {#if $data}
    {#each $data.slice().reverse() as list, index}
      {#if index < 5}
        <div class=" pb-3">
          <p class="mb-0 recent-workspace">{list.name}</p>
          <span class="team-name">John's Team</span>
        </div>
      {/if}
    {/each}
  {/if}
</section>

<style>
  .teams-heading {
    font-size: 14px;
    font-weight: 700;
    line-height: 21px;
    overflow: auto;
  }
  .recent-workspace {
    font-size: 12px;
    color: #f5f5f5;
  }
  .team-name {
    color: var(--request-arc);
  }
</style>
