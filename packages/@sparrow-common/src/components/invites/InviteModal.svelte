<script lang="ts">
  export let open = false;
  export let onClose = () => {};

  export let inviterName = "";
  export let hubName = "";
  export let role = "";
  export let workspaceNames: string[] = [];
  export let notificationId = "";
  export let teamId = "";
  export let workspaceIds: string[] = [];

  export let onAccept: (payload: InviteActionPayload) => void = () => {};
  export let onDecline: (payload: InviteActionPayload) => void = () => {};

  $: isMultiple = (workspaceNames?.length || 0) > 1;

  type InviteActionPayload = {
    notificationId: string;
    teamId: string;
    workspaceIds: string[];
  };
</script>

{#if open}
  <div class="backdrop" on:click={onClose} />

  <div class="invite-modal">
    <!-- close -->
    <button class="close" on:click={onClose}>✕</button>

    <!-- avatar -->
    <div class="avatar">
      {inviterName?.[0]?.toUpperCase()}
    </div>

    <h2>
      Invite from {hubName}
    </h2>

    {#if isMultiple}
      <p>
        {inviterName} has invited you to join the following workspaces under
        <strong>"{hubName}"</strong> Hub.
      </p>
    {:else}
      <p>
        {inviterName} has invited you to
        <strong>"{workspaceNames[0]}"</strong> workspace under
        <strong>"{hubName}"</strong> Hub.
      </p>
    {/if}

    <p class="role">
      Role: <strong>{role}</strong>
    </p>

    {#if isMultiple}
      <div class="list">
        <div class="list-title">Workspaces included in this invite:</div>
        <ul>
          {#each workspaceNames as w}
            <li>{w}</li>
          {/each}
        </ul>
      </div>
    {/if}

    <div class="actions">
      <button
        class="decline"
        on:click={() => onDecline({ notificationId, teamId, workspaceIds })}
      >
        Decline
      </button>

      <button
        class="accept"
        on:click={() => onAccept({ notificationId, teamId, workspaceIds })}
      >
        Accept
      </button>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 999999; /* ⭐ ADD */
  }

  .invite-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 520px;
    background: #1f2430;
    border-radius: 12px;
    padding: 28px;
    z-index: 1000000; /* ⭐ ADD */
  }

  .close {
    position: absolute;
    right: 16px;
    top: 16px;
    background: none;
    border: none;
    color: white;
  }

  .avatar {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: #6a5cff;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
  }

  .accept {
    background: #316cf6;
    border: none;
    padding: 10px 18px;
    border-radius: 8px;
    color: white;
  }

  .decline {
    background: #2b3140;
    border: none;
    padding: 10px 18px;
    border-radius: 8px;
    color: white;
  }
</style>
