<script lang="ts">
  export let data: any;
</script>

{#if $data}
  {#each $data as list, index}
    <p
      class="d-flex dropdown-btn align-items-center px-2 mt-2 p-1 rounded gap-0 mb-0"
      style="cursor: pointer;"
    >
      {list.name}
    </p>
  {/each}
{/if}
