<script lang="ts">
  import WorkspaceCard from "../workspace-card/WorkspaceCard.svelte";
  import { CrossIcon, SearchIcon } from "$lib/assets/app.asset";

  export let workspaces: any;
  let filterText: string = "";
  const handleFilterTextChange = (e) => {
    filterText = e.target.value;
  };
  const handleEraseSearch = () => {
    filterText = "";
  };
</script>

<div class="p-2">
  <div class={`d-flex search-input-container rounded py-2 px-2 mb-4`}>
    <SearchIcon width={14} height={14} classProp={`my-auto me-3`} />
    <input
      type="text"
      id="search-input"
      class={`bg-transparent w-100 border-0 my-auto`}
      placeholder="Search workspaces in John’s Team"
      bind:value={filterText}
      on:input={(e) => handleFilterTextChange(e)}
    />
    {#if filterText !== ""}
      <button class="border-0 bg-transparent ms-2" on:click={handleEraseSearch}>
        <CrossIcon color="#45494D" />
      </button>
    {/if}
  </div>
  <div
    class="d-flex flex-wrap gap-5 row-gap-0 overflow-y-auto workspace-scrollbar"
    style="height: 59vh;"
  >
    <button class="col-5 py-0 add-new-workspace"> + Add New Workspace </button>
    {#each workspaces.filter( (item) => item.name.startsWith(filterText), ) as workspace}
      <WorkspaceCard {workspace} />
    {/each}
  </div>
</div>

<style>
  .workspace-scrollbar::-webkit-scrollbar {
    width: 2px;
  }
  .workspace-scrollbar::-webkit-scrollbar-thumb {
    background: #888;
  }
  .search-input-container {
    border: 1px solid var(--border-color);
    background: var(--background-color);
    width: 27vw;
    font-size: 12px;
  }
  .search-input-container > input:focus {
    outline: none;
    caret-color: var(--workspace-hover-color);
  }
  .search-input-container:focus-within {
    border: 1px solid var(--workspace-hover-color);
  }
  .search-input-container:focus-within svg {
    visibility: hidden;
  }
  .add-new-workspace {
    border-radius: 8px;
    background: transparent;
    border: 2px dashed var(--gradiant-2, #6147ff);
    background: var(
      --gradiant-2,
      linear-gradient(270deg, #6147ff -1.72%, #1193f0 100%)
    );
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: 16px;
  }
</style>
