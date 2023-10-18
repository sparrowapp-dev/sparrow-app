<script lang="ts">
     import angleRight from "$lib/assets/angleRight.svg";
    import FileExplorer from "./FileExplorer.svelte";
    let visibility = false;
     export let title:string;
     export let collectionId:string;
     if(collectionId != "rebrfbgr") visibility = true;
     let explorer = {
      items : ""
     }
</script>

<button on:click={()=>{visibility = !visibility}} style="height:36px;" class="btn btn-primary d-flex w-100 align-items-center justify-content-start border-0 py-1 ps-4">
    <img src={angleRight} style="height:14px; width:14px; margin-right:8px; {visibility ? 'transform:rotate(90deg);' :'transform:rotate(0deg);'}" alt="angleRight" />
    <p class="mb-0" style="font-size: 14px;">{title}</p>
</button>
<div style="padding-left: 40px; cursor:pointer; display: {visibility ? 'block' : 'none'};">
    <!-- <button>+ Folder</button> <button>+ API REQUEST</button> -->
    {#each explorer.items as exp}
    <FileExplorer explorer={exp} />
    {/each}
</div>

<style>
    .btn-primary {
    background-color: #1e1e1e;
    color: #fff;
  }

  .btn-primary:hover {
    background-color: #232527;
    color: #fff;
    padding: 20px;
  }
</style>