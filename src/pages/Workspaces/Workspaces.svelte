<script lang="ts">
  import { scaleComponent } from "$lib/utils/animations";
  import { Motion } from "svelte-motion";

  export let data: any;
</script>

<Motion {...scaleComponent} let:motion>
  {#if $data}
    {#each $data as list, index}
      <p
        class="d-flex dropdown-btn align-items-center px-2 mt-2 p-1 rounded gap-0 mb-0"
        style="cursor: pointer;"
        use:motion
      >
        {list.name}
      </p>
    {/each}
  {/if}
</Motion>
