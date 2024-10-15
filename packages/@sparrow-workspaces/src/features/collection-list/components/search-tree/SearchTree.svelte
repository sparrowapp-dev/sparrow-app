<script lang="ts">
  import { folderIcon as folder } from "@sparrow/library/assets";
  import Request from "./Request.svelte";
  import { collectionIconIcon as collectionIcon } from "@sparrow/library/assets";
  let folderExpand: boolean = false;
  let collectionExpand: boolean = false;

  export let onItemOpened: (entityType: string, args: any) => void;
  export let workspaceId: string;
  export let explorer: any;
  export let explorerData: any;
  export let searchData: string = "";
  function getIndex(text: string, searchData: string): number {
    return text.toLowerCase().indexOf(searchData.toLowerCase());
  }
</script>

<div>
  {#if explorerData.type === "FOLDER"}
    <div>
      <button
        style="height:36px;"
        class="folder rounded d-flex align-items-center p-1 bg-transparent border-0 text-left"
        on:click={() => {
          folderExpand = !folderExpand;
          onItemOpened("folder", {
            workspaceId,
            collection: {
              id: explorer.collectionId,
              activeSync: explorer.activeSync,
            },
            folder: explorerData,
          });
        }}
      >
        <img src={folder} alt="" style="height:16px; width:16px;" />
        <span
          class="ellipsis"
          style=" padding-left: 8px; cursor:pointer; font-size:14px; font-weight:400;color:#999999"
          >{explorerData.name.substring(
            0,
            getIndex(explorerData.name, searchData),
          )}<span class="highlight"
            >{explorerData.name.substring(
              getIndex(explorerData.name, searchData),
              getIndex(explorerData.name, searchData) + searchData.length,
            )}</span
          >{explorerData.name.substring(
            getIndex(explorerData.name, searchData) + searchData.length,
          )}
        </span>
      </button>
      <div
        style="padding-left: 15px; cursor:pointer; display: {folderExpand
          ? 'block'
          : 'none'};"
      >
        {#if explorerData.items.length === 0}
          <small>Folder is empty</small>
        {/if}
        {#each explorerData.items as exp}
          <svelte:self explorerData={exp} {explorer} />
        {/each}
      </div>
    </div>
  {:else if explorerData.type === "REQUEST"}
    <div
      style="padding-left: 0; cursor:pointer;width:100%; text-align:left;"
      class="request rounded"
    >
      <Request
        {explorer}
        {workspaceId}
        {onItemOpened}
        request={explorerData}
        {searchData}
        {getIndex}
        folderDetails={explorer}
      />
    </div>
  {:else}
    <button
      class="bg-transparent border-0 w-100"
      style="cursor:pointer;"
      on:click={() => {
        onItemOpened("collection", {
          workspaceId,
          collection: explorerData,
        });
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
          {explorerData.name.substring(
            0,
            getIndex(explorerData.name, searchData),
          )}<span class="highlight"
            >{explorerData.name.substring(
              getIndex(explorerData.name, searchData),
              getIndex(explorerData.name, searchData) + searchData.length,
            )}</span
          >{explorerData.name.substring(
            getIndex(explorerData.name, searchData) + searchData.length,
          )}
        </p>
      </button>
      <div
        style="padding-left: 15px; cursor:pointer; display: {collectionExpand
          ? 'block'
          : 'none'};"
      >
        {#if explorerData.items.length === 0}
          <small>Collection is empty</small>
        {/if}
        {#each explorerData.items as exp}
          <svelte:self explorerData={exp} {explorer} />
        {/each}
      </div>
    </button>
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
