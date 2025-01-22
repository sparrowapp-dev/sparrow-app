<script lang="ts">
  import { onMount } from 'svelte';
  import { RxDB } from "../../../../../../apps/@sparrow-desktop/src/database/database";
  import getIcon from "../../../../static/getIcon.png";
  import hexIcon from "../../../../static/iconHex.png";
  import folderIcon from "../../../../static/folderIcon.png";
  import environmentIcon from "../../../../static/envLayer.png";
  import collectionIcon from "../../../../static/collectionStack.png";
  import workspaceIcon from "../../../../static/workspaceBoard.png";
  import { WorkspaceRepository} from "../../../../../../apps/@sparrow-desktop/src/repositories/workspace.repository";
  import type {
    CollectionDocument,
    EnvironmentDocument,
    WorkspaceDocument,
  } from "@app/database/database";

  
export let searchQuery = "";
export let filteredCollection = [];
export let filteredFolder = [];
export let filteredRequest = [];

export let recentEnvironment: RecentItem | null = null;
export let recentWorkspace: RecentItem | null = null;

let filteredWorkspaces = [];
let workspaceRepository = new WorkspaceRepository();

  interface RecentItem {
    title: string;
    workspace: string;
    collection?: string;
    environment?: string;
    url?: string;
    method?: string;
  }

$: console.log("The search query: recnet ", searchQuery);
$: console.log("filteredCollection is recent ", filteredCollection);
$: console.log("filteredFolder s\is", filteredFolder);
$: console.log("filteredRequest is", filteredRequest);
$: console.log("filteredWorkspace is", filteredWorkspaces);

$: {
  updateWorkspaces(searchQuery);
}


async function updateWorkspaces(query: string) {
  try {
    filteredWorkspaces = await workspaceRepository.searchWorkspaces(query);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    filteredWorkspaces = [];
  }
}

onMount(async () => {
  // Initially load recent workspaces
  try {
    filteredWorkspaces = await workspaceRepository.getRecentWorkspaces();
  } catch (error) {
    console.error('Error fetching recent workspaces:', error);
  }
});
 
</script>

<div class="recent-items-container">
  <div class="recent-section">
    

   {#if filteredRequest.length > 0}
   <div class="section-header">
      <span class="section-title">Recent Requests</span>
      <div class="keyboard-shortcut">
        <div class="shortcut-key">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/f47f7a2f6011ca132b561b5ff754edeec46a5f8d29a864d4188fda2fc37cb0a9?apiKey=805a55f7a8524d998fb01daccbae8123&"
            alt=""
            class="shortcut-icon"
          />
        </div>
        <span class="key">Shift</span>
        <span class="key">A</span>
      </div>
    </div>
    {#each filteredRequest as request}
      <div class="request-item">
        <div class="request-method">
          {#if request.method}
            <span class="method-label">{request.tree.name}</span>
          {:else}
            <img src={hexIcon} alt="" class="request-icon" />
          {/if}
        </div>
        <div class="request-details">
          <div class="request-header">
            <span class="request-title">{request.tree.name}</span>
            <span class="request-path">{request.path}</span>
          </div>
          <span class="request-url">{request.tree.request.url ||""}</span>
        </div>
      </div>
    {/each}
   {/if}
  </div>

  {#if filteredCollection[0]}
    <div style="display:flex;flex-direction:column; gap:8px;">
      <span class="section-title">Recent Collection</span>
      <div class="request-item">
        <div class="request-method">
          <img src={collectionIcon} alt="" class="other-icon" />
        </div>
        <div class="request-details">
          <div class="request-header">
            <span class="request-title">{filteredCollection[0]?.tree.name}</span>
            <span class="request-path">
            {filteredCollection[0]?.path}
            </span>
          </div>
        </div>
      </div>
    </div>
  {/if}

  {#if recentEnvironment}
    <div style="display:flex;flex-direction:column; gap:8px;">
      <span class="section-title">Recent Environment</span>
      <div class="request-item">
        <div class="request-method">
          <img src={environmentIcon} alt="" class="other-icon" />
        </div>
        <div class="request-details">
          <div class="request-header">
            <span class="request-title">{recentEnvironment.title}</span>
            <span class="request-path">
              {recentEnvironment.workspace} / {recentEnvironment.environment} / {recentEnvironment.collection}
            </span>
          </div>
        </div>
      </div>
    </div>
  {/if}

  {#if filteredFolder[0]}
    <div style="display:flex;flex-direction:column; gap:8px;">
      <span class="section-title">Recent Folder</span>
      <div class="request-item">
        <div class="request-method">
          <img src={folderIcon} alt="" class="other-icon" />
        </div>
        <div class="request-details">
          <div class="request-header">
            <span class="request-title">{filteredFolder[0].tree.name}</span>
            <span class="request-path">
              {filteredFolder[0].path}
            </span>
          </div>
        </div>
      </div>
    </div>
  {/if}

  {#if recentWorkspace}
    <div style="display:flex;flex-direction:column; gap:8px;">
      <span class="section-title">Recent Workspace</span>
      <div class="request-item">
        <div class="request-method">
          <img src={workspaceIcon} alt="" class="other-icon" />
        </div>
        <div class="request-details">
          <div class="request-header">
            <span class="request-title">{recentWorkspace.title}</span>
            <span class="request-path">
              {recentWorkspace.workspace} / {recentWorkspace.environment} / {recentWorkspace.collection}
            </span>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .recent-items-container {
    display: flex;
    flex-direction: column;
    padding: 8px;
    gap: 12px;
  }

  .recent-section {
    margin-bottom: 12px;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2px;
    margin-bottom: 4px;
  }

  .section-title {
    color: var(--Neutral-500, #62656a);
    font: 400 12px Inter, sans-serif;
  }

  .keyboard-shortcut {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .shortcut-key {
    border-radius: 4px;
    background-color: rgba(24, 28, 38, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 2px;
  }

  .key {
    border-radius: 4px;
    background-color: rgba(24, 28, 38, 1);
    color: var(--Neutral-100, #d8d8d9);
    padding: 2px 4px;
    font: 400 12px Inter, sans-serif;
  }

  .request-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px;
    margin-bottom: 2px;
  }

  .request-method {
    border-radius: 2px;
    background-color: rgba(29, 33, 43, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    padding: 4px;
    gap: 8px;
  }

  .method-label {
    color: rgba(105, 214, 150, 1);
    font: 700 12px Roboto, sans-serif;
  }

  .request-icon, .other-icon {
    width: 16px;
    height: 16px;
  }

  .request-details {
    display: flex;
    flex-direction: column;
    min-width: 240px;
    flex: 1;
    gap: 3px;
  }

  .request-header {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .request-title {
    color: var(--Neutral-300, #9b9da1);
    font: 400 12px Inter, sans-serif;
  }

  .request-path {
    color: var(--Neutral-500, #62656a);
    font: 400 12px Inter, sans-serif;
  }

  .request-url {
    color: var(--Blue-300, #6894f9);
    font: 400 12px Inter, sans-serif;
  }
</style>