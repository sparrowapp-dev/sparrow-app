<script lang="ts">
    import folder from "$lib/assets/folder.svg";
    import File from "$lib/components/collections/collections-list/searchTree/File.svelte";
    import angleRight from "$lib/assets/angleRight.svg";
    let expand = false;
    export let explorer;
    let visibility = true;
    let collectionExpand = false;
</script>

{#if explorer.type === "FOLDER"}
    <div>
      <div style="height:36px;" class="d-flex align-items-center" on:click={() => {expand = !expand;}}>
        <img src={folder} alt="" style="height:16px; width:16px;">
        <span style="padding-left: 8px; cursor:pointer; font-size:14px; font-weight:400;">{explorer.name}</span>
      </div>
      <div style="padding-left: 15px; cursor:pointer; display: {expand ? 'block' : 'none'};">
        {#if explorer.items.length === 0}
            <small>Folder is empty</small>
        {/if}
        {#each explorer.items as exp}
          <svelte:self explorer={exp} />
        {/each}
      </div>
    </div>
{:else if explorer.type === "FILE"}
    <div style="padding-left: 0; cursor:pointer;">
      <File name={explorer.name} method={explorer.request.method} />
    </div>
{:else}
<div style="cursor:pointer;">
    <button on:click={()=>{collectionExpand = !collectionExpand}} style="height:36px;" class="btn btn-primary d-flex w-100 align-items-center justify-content-start border-0 py-1">
        <img src={angleRight} style="height:14px; width:14px; margin-right:8px; {collectionExpand ? 'transform:rotate(90deg);' :'transform:rotate(0deg);'}" alt="angleRight" />
        <p class="mb-0" style="font-size: 14px;">{explorer.name}</p>
    </button>
    <div style="padding-left: 15px; cursor:pointer; display: {collectionExpand ? 'block' : 'none'};">
        {#if explorer.items.length === 0}
            <small>Collection is empty</small>
        {/if}
        {#each explorer.items as exp}
           <svelte:self explorer={exp} />
        {/each}
    </div>
  </div>
{/if}

<style>
  .btn-primary{
    padding-left: 0;
    background-color: #1e1e1e;
    color: #fff;
  }

  .btn-primary:hover {
    background-color: #232527;
    color: #fff;
  }
</style>