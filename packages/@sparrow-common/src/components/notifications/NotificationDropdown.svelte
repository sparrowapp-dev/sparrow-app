<script lang="ts">
  import { notifications, unreadCount } from "@sparrow/common/store";
  import { onMount } from "svelte";

  let activeTab: "all" | "unread" = "all";
</script>

<div class="panel">
  <!-- Header -->
  <div class="header">
    <span class="title">Notifications</span>

    <div class="actions">
      <button>Mark all as read</button>
      <button>Clear all</button>
    </div>
  </div>

  <!-- Tabs -->
  <div class="tabs">
    <button
      class:selected={activeTab === "all"}
      on:click={() => (activeTab = "all")}
    >
      All ({$notifications.length})
    </button>

    <button
      class:selected={activeTab === "unread"}
      on:click={() => (activeTab = "unread")}
    >
      Unread ({$unreadCount})
    </button>
  </div>

  <!-- List -->
  <div class="list">
    {#if $notifications.length === 0}
      <div class="empty">No notifications</div>
    {/if}

    {#each $notifications as n}
      <div class="item">
        <div class="message">
          Workspace invite from {n.data?.teamName}
        </div>

        {#if !n.isRead}
          <button class="view">View Invite</button>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .panel {
    position: absolute;

    /* attach to bell container */
    top: 100%;
    right: 0;

    width: 320px;
    background: #1f2430;
    border-radius: 10px;
    padding: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    z-index: 9999;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .title {
    font-weight: 600;
  }

  .actions button {
    font-size: 12px;
    margin-left: 6px;
  }

  .tabs {
    display: flex;
    gap: 10px;
    margin-top: 12px;
  }

  .tabs button.selected {
    color: #4f7cff;
  }

  .list {
    margin-top: 12px;
    max-height: 300px;
    overflow: auto;
  }

  .item {
    background: #181c26;
    padding: 10px;
    border-radius: 8px;
    margin-bottom: 8px;
  }

  .view {
    margin-top: 6px;
  }

  .empty {
    text-align: center;
    opacity: 0.6;
  }
</style>
