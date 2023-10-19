<script>
    import folder from "$lib/assets/folder.svg";
    import File from "./File.svelte";
    let expand = false;
    export let explorer;
</script>
{#if explorer.type === 0}
    <div>
      <div style="height:36px;" class="d-flex align-items-center" on:click={() => {expand = !expand;}}>
        <img src={folder} alt="" style="height:16px; width:16px;">
        <span style="padding-left: 8px; cursor:pointer; font-size:14px; font-weight:400;">{explorer.name}</span>
      </div>
      <div style="padding-left: 15px; cursor:pointer; display: {expand ? 'block' : 'none'};">
        {#each explorer.items as exp}
          <svelte:self explorer={exp} />
        {/each}
      </div>
    </div>
{:else}
    <div style="padding-left: 0; cursor:pointer;">
      <File name={explorer.name} method={explorer.request.method} />
    </div>
{/if}