<script lang="ts">
  import folder from "$lib/assets/folder.svg";
  import Request from "$lib/components/collections/collections-list/searchTree/Request.svelte";
  import collectionIcon from "$lib/assets/collection-icon.svg";
  import {
    handleCollectionClick,
    handleFolderClick,
  } from "$lib/utils/helpers/handle-clicks.helper";
  let folderExpand: boolean = false;
  let collectionExpand: boolean = false;
  export let explorer: any;
  export let editable: boolean = false;
  export let workspaceId: string = "";
  export let collectionId: string = "";
  export let folderDetails: { id: string; name: string };
  export let path: string = "";
  export let searchData: string = "";
  function getIndex(text: string, searchData: string): number {
    return text.toLowerCase().indexOf(searchData.toLowerCase());
  }
  export let activeSync;
</script>

<div>
  {#if explorer.type === "FOLDER"}
    <div>
      <div
        style="height:36px;"
        class="folder rounded d-flex align-items-center p-1"
        on:click={() => {
          folderExpand = !folderExpand;
          handleFolderClick(explorer, workspaceId, collectionId, activeSync);
        }}
      >
        <img src={folder} alt="" style="height:16px; width:16px;" />
        <span
          class="ellipsis"
          style=" padding-left: 8px; cursor:pointer; font-size:14px; font-weight:400;color:#999999"
          >{explorer.name.substring(
            0,
            getIndex(explorer.name, searchData),
          )}<span class="highlight"
            >{explorer.name.substring(
              getIndex(explorer.name, searchData),
              getIndex(explorer.name, searchData) + searchData.length,
            )}</span
          >{explorer.name.substring(
            getIndex(explorer.name, searchData) + searchData.length,
          )}
        </span>
      </div>
      <div
        style="padding-left: 15px; cursor:pointer; display: {folderExpand
          ? 'block'
          : 'none'};"
      >
        {#if explorer.items.length === 0}
          <small>Folder is empty</small>
        {/if}
        {#each explorer.items as exp}
          <svelte:self explorer={exp} />
        {/each}
      </div>
    </div>
  {:else if explorer.type === "REQUEST"}
    <div
      style="padding-left: 0; cursor:pointer;width:100%"
      class="request rounded"
    >
      <Request
        {path}
        request={explorer}
        {searchData}
        {getIndex}
        folderDetails={explorer}
        {collectionId}
        {workspaceId}
        {activeSync}
      />
    </div>
  {:else}
    <div
      style="cursor:pointer;"
      on:click={() => {
        handleCollectionClick(explorer, workspaceId, collectionId);
      }}
    >
      <button
        on:click={() => {
          collectionExpand = !collectionExpand;
        }}
        style="height:36px;"
        class="collection btn btn-primary d-flex w-100 align-items-center justify-content-start border-0 py-1"
      >
        <img
          src={collectionIcon}
          style="height:14px; width:14px; margin-right:8px; {collectionExpand
            ? 'transform:rotate(90deg);'
            : 'transform:rotate(0deg);'}"
          alt="angleRight"
        />
        <p class="mb-0 ellipsis" style="font-size: 14px; color:#999999">
          {explorer.name.substring(0, getIndex(explorer.name, searchData))}<span
            class="highlight"
            >{explorer.name.substring(
              getIndex(explorer.name, searchData),
              getIndex(explorer.name, searchData) + searchData.length,
            )}</span
          >{explorer.name.substring(
            getIndex(explorer.name, searchData) + searchData.length,
          )}
        </p>
      </button>
      <div
        style="padding-left: 15px; cursor:pointer; display: {collectionExpand
          ? 'block'
          : 'none'};"
      >
        {#if explorer.items.length === 0}
          <small>Collection is empty</small>
        {/if}
        {#each explorer.items as exp}
          <svelte:self explorer={exp} />
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .btn-primary {
    padding-left: 0;
    background-color: #1e1e1e;
    color: #fff;
  }

  .btn-primary:hover {
    background-color: #232527;
    color: #fff;
  }
  .highlight {
    color: var(--white-color);
  }
  .folder,
  .collection,
  .request {
    width: 100%;
  }
  .folder:hover,
  .collection:hover,
  .request:hover {
    background-color: var(--border-color);
  }
</style>
