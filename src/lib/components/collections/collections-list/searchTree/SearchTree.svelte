<script lang="ts">
    import folder from "$lib/assets/folder.svg";
    import IconButton from "$lib/components/buttons/IconButton.svelte";
    import File from "$lib/components/collections/collections-list/searchTree/File.svelte";
    export let explorer;
    export let searchData;
    export let type;
    export let path;
    // let newPath = [...path, explorer.name]
    let newPath = JSON.parse(JSON.stringify(path));
    newPath.push(explorer.name);
    // console.log(explorer);
</script>


{#if explorer.type === "FOLDER" }
    <div>
        {#if type === "FOLDER"}
            {#if explorer.name.toLowerCase().includes(searchData.toLowerCase())}
                {explorer.name}
            {/if}
        {:else}
            {#each explorer.items as exp}
                    <svelte:self path={newPath} type={type} explorer={exp} searchData = {searchData} />
            {/each}
        {/if}

    </div>   
{:else if explorer.type === "FILE"}
    <div style="padding-left: 0; cursor:pointer;">
        {#if type === "FILE"}
            {#if explorer.name.toLowerCase().includes(searchData.toLowerCase())}
                <File path={newPath} name={explorer.name} method={explorer.request.method} />
            {/if}
        {/if}
    </div>
{:else}
    <div>
        {#if type === "COLLECTION"}
            {#if explorer.name.toLowerCase().includes(searchData.toLowerCase())}
                {explorer.name}
            {/if}
        {:else}
            {#each explorer.items as exp}
                <svelte:self path={newPath} type={type} explorer={exp} searchData = {searchData} />
            {/each}
        {/if}
        
    </div>
{/if}