<script lang="ts">
  import WorkspaceCard from "../workspace-card/WorkspaceCard.svelte";
  import {
    CrossIcon,
    DoubleLeftIcon,
    DoubleRightIcon,
    LeftIcon,
    RightIcon,
    SearchIcon,
  } from "$lib/assets/app.asset";
  export let currTeamName: string;
  export let workspaces: any;
  let filterText: string = "";
  let workspacePerPage: number = 5,
    currPage = 1;
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
      placeholder="Search workspaces in {currTeamName}"
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
    {#if workspaces.filter( (item) => item.name.startsWith(filterText), ).length == 0}
      <span class="not-found-text mx-auto ellipsis"
        >No existing workspace found with the given keyword. You can add a new
        workspace using the term '{filterText}'.</span
      >
    {/if}
    {#if currPage === 1 && workspaces.filter( (item) => item.name.startsWith(filterText), ).length > 0}
      <button class="col-5 flex-grow-1 py-0 mb-4 add-new-workspace">
        + Add New Workspace
      </button>
    {:else if currPage == 1}
      <button class="col-5 flex-grow-1 py-0 mb-4 add-new-workspace empty">
        + Add New Workspace
      </button>
    {/if}
    {#each workspaces
      .filter((item) => item.name.startsWith(filterText))
      .slice((currPage - 1) * workspacePerPage, currPage * workspacePerPage) as workspace, index}
      <WorkspaceCard {workspace} />
    {/each}
  </div>
  <div
    class="justify-content-between bottom-0 position-sticky bg-backgroundColor d-flex z-3"
  >
    <div class="tab-head">
      showing {(currPage - 1) * workspacePerPage + 1} - {Math.min(
        currPage * workspacePerPage,
        workspaces?.filter((item) => item.name.startsWith(filterText)).length,
      )} of {workspaces?.filter((item) => item.name.startsWith(filterText))
        .length}
    </div>
    <div class="tab-head tab-change">
      <button on:click={() => (currPage = 1)} class="bg-transparent border-0"
        ><DoubleLeftIcon color={currPage === 1 ? "#313233" : "white"} /></button
      >
      <button
        on:click={() => {
          if (currPage > 1) currPage -= 1;
        }}
        class="bg-transparent border-0"
        ><LeftIcon color={currPage === 1 ? "#313233" : "white"} /></button
      >
      <button
        on:click={() => {
          if (
            currPage <
            Math.ceil(
              workspaces?.filter((item) => item.name.startsWith(filterText))
                .length / workspacePerPage,
            )
          )
            currPage += 1;
        }}
        class="bg-transparent border-0"
        ><RightIcon
          color={currPage ===
          Math.ceil(
            workspaces?.filter((item) => item.name.startsWith(filterText))
              .length / workspacePerPage,
          )
            ? "#313233"
            : "white"}
        /></button
      >
      <button
        on:click={() =>
          (currPage = Math.ceil(
            workspaces?.filter((item) => item.name.startsWith(filterText))
              .length / workspacePerPage,
          ))}
        class="bg-transparent border-0"
        ><DoubleRightIcon
          color={currPage ===
          Math.ceil(
            workspaces?.filter((item) => item.name.startsWith(filterText))
              .length / workspacePerPage,
          )
            ? "#313233"
            : "white"}
        /></button
      >
    </div>
    <div></div>
  </div>
</div>

<style>
  .workspace-scrollbar::-webkit-scrollbar {
    width: 2px;
  }
  .workspace-scrollbar::-webkit-scrollbar-thumb {
    background: #888;
  }
  .tab-head {
    padding: 8px;
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
    color: #8a9299;
    background-color: transparent;
  }
  .tab-change {
    margin-right: 120px;
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
    max-width: 50%;
    max-height: 32%;
  }
  .add-new-workspace.empty {
    max-width: 80%;
  }
  .add-new-workspace:hover {
    border: 2px dashed var(--workspace-hover-color);
    background: var(--dull-background-color);
    color: var(--workspace-hover-color);
    background-clip: initial;
    -webkit-background-clip: initial;
    -webkit-text-fill-color: initial;
  }
  .not-found-text {
    color: var(--request-arc);
    font-size: 16px;
    text-align: center;
  }
</style>
