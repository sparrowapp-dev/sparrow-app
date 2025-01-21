<script lang="ts">
  import type { RecentItem } from "./types";

  const recentRequests: RecentItem[] = [
    {
      title: "Pet Hospitality",
      workspace: "techdome",
      collection: "my workspace / new collection",
      url: "https://strapi.techdome.io/api/getPetHospitality",
      method: "GET",
    },
    {
      title: "Pet Hospitality",
      workspace: "techdome",
      collection: "domigo / new collection",
      url: "https://strapi.techdome.io/graphql",
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/518cb90db7c525768eab63e5ae3650ccaf35d05d4f8b8e806be7c98112a2c1f7?apiKey=805a55f7a8524d998fb01daccbae8123&",
    },
    {
      title: "New Socket.io",
      workspace: "techdome",
      collection: "domigo / new collection",
      url: "https://strapi.techdome.io/graphql",
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/ab1b51e51d752ffcc170a36a193d24128a6e66e9152ef1efa05cd7f96023e45b?apiKey=805a55f7a8524d998fb01daccbae8123&",
    },
  ];

  const recentCollection: RecentItem = [
    {
      title: "Pet Hospitality",
      workspace: "techdome",
      collection: "my workspace / new collection",
      environment: "new environment",
    },
  ];

  const recentWorkspace: RecentItem = [
    {
      title: "Pet Hospitality",
      workspace: "techdome",
      collection: " new collection",
      environment: "new environment",
    },
  ];

  const recentEnvironment: RecentItem = [
    {
      title: "Pet Hospitality",
      workspace: "techdome",
      collection: " new collection",
      environment: "new environment",
    },
  ];

  const RecentFolder: RecentItem = [
    {
      title: "Pet Hospitality",
      workspace: "techdome",
      collection: "new collection",
      environment: "new environment",
    },
  ];
</script>

<div class="recent-items-container">
  <div class="recent-section">
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

    {#each recentRequests as request}
      <div class="request-item">
        <div class="request-method">
          {#if request.method}
            <span class="method-label">{request.method}</span>
          {:else}
            <img src={request.icon} alt="" class="request-icon" />
          {/if}
        </div>
        <div class="request-details">
          <div class="request-header">
            <span class="request-title">{request.title}</span>
            <span class="request-path"
              >{request.workspace} / {request.collection}</span
            >
          </div>
          <span class="request-url">{request.url}</span>
        </div>
      </div>
    {/each}
  </div>
  <!-- // other recent items -->
  <div style="display:flex;flex-direction:column; gap:8px;">
    <span class="section-title">Recent Collection</span>
    <div class="request-item">
      <div class="request-method">
        {#if recentCollection[0].method}
          <span class="method-label">{recentCollection[0].method}</span>
        {:else}
          <img src={recentCollection[0].icon} alt="" class="request-icon" />
        {/if}
      </div>
      <div class="request-details">
        <div class="request-header">
          <span class="request-title">{recentCollection[0].title}</span>
          <span class="request-path"
            >{recentCollection[0].workspace} / {recentCollection[0].environment}
            / {recentCollection[0].collection}</span
          >
        </div>
      </div>
    </div>
  </div>

  <div style="display:flex;flex-direction:column; gap:8px;">
    <span class="section-title">Recent Environment</span>
    <div class="request-item">
      <div class="request-method">
        {#if recentEnvironment[0].method}
          <span class="method-label">{recentEnvironment[0].method}</span>
        {:else}
          <img src={recentEnvironment[0].icon} alt="" class="request-icon" />
        {/if}
      </div>
      <div class="request-details">
        <div class="request-header">
          <span class="request-title">{recentEnvironment[0].title}</span>
          <span class="request-path"
            >{recentEnvironment[0].workspace} / {recentEnvironment[0]
              .environment} / {recentEnvironment[0].collection}</span
          >
        </div>
      </div>
    </div>
  </div>

  <div style="display:flex;flex-direction:column; gap:8px;">
    <span class="section-title">Recent Folder</span>
    <div class="request-item">
      <div class="request-method">
        {#if RecentFolder[0].method}
          <span class="method-label">{RecentFolder[0].method}</span>
        {:else}
          <img src={RecentFolder[0].icon} alt="" class="request-icon" />
        {/if}
      </div>
      <div class="request-details">
        <div class="request-header">
          <span class="request-title">{RecentFolder[0].title}</span>
          <span class="request-path"
            >{RecentFolder[0].workspace} / {RecentFolder[0].environment} / {RecentFolder[0]
              .collection}</span
          >
        </div>
      </div>
    </div>
  </div>

  <div style="display:flex;flex-direction:column; gap:8px;">
    <span class="section-title">Recent Workspace</span>
    <div class="request-item">
      <div class="request-method">
        {#if recentWorkspace[0].method}
          <span class="method-label">{recentWorkspace[0].method}</span>
        {:else}
          <img src={recentWorkspace[0].icon} alt="" class="request-icon" />
        {/if}
      </div>
      <div class="request-details">
        <div class="request-header">
          <span class="request-title">{recentWorkspace[0].title}</span>
          <span class="request-path"
            >{recentWorkspace[0].workspace} / {recentWorkspace[0].environment} /
            {recentWorkspace[0].collection}</span
          >
        </div>
      </div>
    </div>
  </div>

  <!-- Similar sections for Collections, Environments, Folders, and Workspace -->
</div>

<style>
  .recent-items-container {
    display: flex;
    flex-direction: column;
    padding: 8px;
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
    font:
      400 12px Inter,
      sans-serif;
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
    font:
      400 12px Inter,
      sans-serif;
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
    font:
      700 12px Roboto,
      sans-serif;
  }

  .request-icon {
    width: 20px;
    height: 20px;
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
    font:
      400 12px Inter,
      sans-serif;
  }

  .request-path {
    color: var(--Neutral-500, #62656a);
    font:
      400 12px Inter,
      sans-serif;
  }

  .request-url {
    color: var(--Blue-300, #6894f9);
    font:
      400 12px Inter,
      sans-serif;
  }
</style>
