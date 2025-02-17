<script lang="ts">
  export let data = {
    title: "",
    shortcutKeys: [],
  };
  import { keyCommand } from "../../images";
</script>

<div class="d-flex align-items-center justify-content-between px-1 mb-1">
   <span class="" style="color: var(--text-ds-neutral-500); font-size: 12px;">
  {data.title}
</span>
  <div class="d-flex align-items-center gap-1">
    <div class="d-flex align-items-center justify-content-center rounded p-1" 
         style="width: 24px; height: 24px; background-color: var(--bg-ds-surface-600);">
      <img src={keyCommand} alt="" class="img-fluid" />
    </div>
    {#if data.shortcutKeys}
      {#each data.shortcutKeys as key}
        <div class="d-flex align-items-center justify-content-center rounded px-1" 
             style="min-height: 24px; min-width: 24px; font-size: 12px; line-height: 18px; background-color: var(--bg-ds-surface-600); color: var(--text-ds-neutral-200);">
          {key}
        </div>
      {/each}
    {/if}
  </div>
</div>
