<script lang="ts">
  import { notifications, unreadCount } from "@sparrow/common/store";
  import { onMount, onDestroy } from "svelte";
  import InviteModal from "../invites/InviteModal.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let activeTab: "all" | "unread" = "all";
  let showMenu = false;
  let menuRef: HTMLElement;
  let showInviteModal = false;
  let selectedNotification: any = null;

  async function handleClearAll() {
    const list = $notifications;

    if (!list.length) return;

    dispatch("clearAllNotifications", list);
  }

  function handleMarkAllRead() {
    dispatch("markAllRead");
    showMenu = false;
  }

  function handleAccept(n) {
    showInviteModal = false; // ⭐ close modal

    dispatch("acceptInvite", n);
    dispatch("closeDropdown"); // ⭐ NEW
  }

  function handleDecline(n) {
    showInviteModal = false; // ⭐ close modal

    dispatch("declineInvite", n);
    dispatch("closeDropdown"); // ⭐ NEW
  }

  function handleClickOutside(event: MouseEvent) {
    if (!menuRef) return;

    if (!menuRef.contains(event.target as Node)) {
      showMenu = false;
    }
  }

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  function openInvite(n) {
    selectedNotification = n;
    showInviteModal = true;

    dispatch("openInvite", n); // ⭐ tell parent

    console.log("Opening invite modal for notification:", n);
  }

  onMount(() => {
    document.addEventListener("click", handleClickOutside);
  });

  onDestroy(() => {
    document.removeEventListener("click", handleClickOutside);
  });
</script>

<div class="panel">
  <!-- Header -->
  <div class="header">
    <span class="title">Notifications</span>

    <button
      class="menu-btn"
      on:click|stopPropagation={() => (showMenu = !showMenu)}
    >
      ⋮
    </button>
  </div>

  {#if showMenu}
    <div class="menu-panel" bind:this={menuRef} on:click|stopPropagation>
      <button class="menu-item" on:click={handleMarkAllRead}>
        <span class="menu-icon">✓</span>
        <span>Mark all as read</span>
      </button>

      <button class="menu-item" on:click={handleClearAll}>
        <span class="menu-icon">✕</span>
        <span>Clear all</span>
      </button>
    </div>
  {/if}

  <!-- Tabs -->
  <div class="tabs">
    <div
      class="tab"
      class:active={activeTab === "all"}
      on:click={() => (activeTab = "all")}
    >
      <span>All</span>
      <span class="count">{$notifications.length}</span>
    </div>

    <div
      class="tab"
      class:active={activeTab === "unread"}
      on:click={() => (activeTab = "unread")}
    >
      <span>Unread</span>
      <span class="count">{$unreadCount}</span>
    </div>
  </div>

  <!-- List -->
  <div class="list">
    {#if $notifications.length === 0}
      <div class="empty">No notifications</div>
    {/if}

    {#each $notifications as n}
      <div class="notification-item">
        <!-- Avatar -->
        <div class="avatar">
          {n.data?.inviterName?.[0]?.toUpperCase() || "U"}
        </div>

        <!-- Content -->
        <div class="content">
          <div class="message">
            <strong>'{n.data?.inviterName}'</strong>
            has invited you as a {n.data?.role} to
            <strong>'{n.data?.workspaceNames?.[0]}'</strong>
            workspace.
          </div>

          <div class="time">
            {formatTime(n.createdAt)}
          </div>

          <button
            class="action-btn"
            on:click|stopPropagation={() => openInvite(n)}
          >
            {showInviteModal && selectedNotification?._id === n._id
              ? "Review and Accept"
              : "View Invite"}
          </button>
        </div>

        <!-- Unread indicator -->
        {#if !n.isRead}
          <div class="unread-dot"></div>
        {/if}
      </div>
    {/each}
  </div>
</div>

<InviteModal
  open={showInviteModal}
  onClose={() => {
    showInviteModal = false;
    selectedNotification = null;
  }}
  inviterName={selectedNotification?.data?.inviterName}
  hubName={selectedNotification?.data?.teamName}
  role={selectedNotification?.data?.role}
  workspaceNames={selectedNotification?.data?.workspaceNames || []}
  notificationId={selectedNotification?._id}
  teamId={selectedNotification?.data?.teamId}
  workspaceIds={selectedNotification?.data?.workspaceIds || []}
  onAccept={handleAccept}
  onDecline={handleDecline}
/>

<style>
  .panel {
    position: absolute;

    /* attach to bell container */
    top: 100%;
    right: 0;

    width: 380px;
    background: #1f2430;
    border-radius: 10px;
    padding: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    z-index: 9999;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 8px;
  }

  .title {
    font-weight: 600;
    font-size: 14px;
  }

  .menu-btn {
    background: transparent;
    border: none;
    color: inherit;
    cursor: pointer;
    font-size: 18px;
    padding: 4px 6px;
    border-radius: 6px;
  }

  .menu-btn:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .actions button {
    font-size: 12px;
    margin-left: 6px;
  }

  .action-btn {
    margin-top: 6px;
    background: #316cf6;
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
    color: white;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;

    width: fit-content; /* ⭐ key fix */
  }

  .menu-btn {
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
  }

  .menu-btn:focus,
  .menu-btn:focus-visible {
    outline: none !important;
    box-shadow: none !important;
  }

  .action-btn:hover {
    background: #3f6df0;
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

  .menu-panel {
    position: absolute;
    top: 40px;
    right: 10px;
    background: #232938;
    border-radius: 10px;
    padding: 8px;
    width: 190px;
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35);
    z-index: 100;
  }

  .menu-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    background: transparent;
    border: none;
    color: #ffffff;
    text-align: left;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 450;
  }

  .menu-item:hover {
    background: rgba(255, 255, 255, 0.07);
  }

  .menu-icon {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 2.2px solid rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #ffffff;
  }

  .tabs {
    display: flex;
    gap: 22px;
    margin-top: 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .tab {
    position: relative;
    display: flex;
    align-items: center;
    gap: 6px;
    padding-bottom: 10px;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    font-weight: 500;
  }

  .tab.active {
    color: #ffffff;
  }

  .tab.active::after {
    content: "";
    position: absolute;
    left: -6px;
    bottom: -1px;
    width: calc(100% + 12px);
    height: 2.5px;
    background: #4f7cff;
    border-radius: 2px;
  }

  .count {
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 999px;
    background: rgba(79, 124, 255, 0.2);
    color: #4f7cff;
  }

  .notification-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 6px;
    position: relative;
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6147ff, #6147ff);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 16px;
    flex-shrink: 0;
    box-shadow: 0 4px 10px rgba(79, 124, 255, 0.35);
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .message {
    font-size: 14px;
    line-height: 1.45;
    color: rgba(255, 255, 255, 255);
    font-weight: 250; /* ⭐ important */
  }
  .message strong {
    font-weight: 600;
    color: #ffffff;
    letter-spacing: 0.2px;
  }

  .time {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.55);
  }

  .notification-item button:focus,
  .menu-btn:focus,
  .menu-item:focus {
    outline: none;
    box-shadow: none;
  }

  .menu-btn:focus-visible {
    outline: none;
    box-shadow: none;
  }

  :global(button) {
    outline: none !important;
    box-shadow: none !important;
  }

  .unread-dot {
    position: absolute;
    right: 6px;
    top: 18px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4f7cff;
  }

  .notification-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px 6px;
    position: relative;
  }

  .notification-item:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
  .notification-item:hover {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
  }

  .list {
    margin-top: 12px;
    max-height: 340px;
    overflow-y: auto;

    /* Firefox */
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.25) rgba(255, 255, 255, 0.06);
  }

  /* Chrome / Edge / Electron */
  .list::-webkit-scrollbar {
    width: 8px;
  }

  .list::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }

  .list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.28);
    border-radius: 10px;
    border: 2px solid rgba(0, 0, 0, 0); /* creates floating thumb look */
    background-clip: content-box;
  }

  .list::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.4);
  }
</style>
