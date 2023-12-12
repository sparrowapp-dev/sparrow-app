<script lang="ts">
  import Helper from "./Helper.svelte";
  export let recentAPI: any;
</script>

<section>
  <h6 class="teams-heading">Recent APIs</h6>
  {#each recentAPI as api}
    <Helper {api} />
  {/each}
</section>

<style>
  .teams-heading {
    font-size: 14px;
    font-weight: 700;
    line-height: 21px;
  }
</style>
