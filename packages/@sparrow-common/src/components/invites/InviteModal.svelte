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
  $: isAdmin = role === "admin";

  function roleCapability(role: string) {
    if (role === "admin")
      return "Full access to manage hub and all workspaces.";
    if (role === "editor")
      return "Can edit APIs and collaborate within this workspace.";
    if (role === "viewer") return "Can view APIs and workspace content.";
    return "";
  }

  type InviteActionPayload = {
    notificationId: string;
    teamId: string;
    workspaceIds: string[];
    workspaceNames: string[];
    teamName: string;
    role: string;
  };
</script>

{#if open}
  <div class="backdrop" on:click|stopPropagation={onClose} />
  <div class="invite-modal" on:click|stopPropagation>
    <button class="close" on:click|stopPropagation={onClose}>✕</button>

    <div class="avatar">
      {inviterName?.[0]?.toUpperCase()}
    </div>

    <h2>Invite from {hubName}</h2>

    <!-- ================= ADMIN ================= -->
    {#if isAdmin}
      <p class="desc">
        {inviterName} has invited you to join the
        <strong>"{hubName}"</strong> hub as an <strong>Admin</strong>.
      </p>

      <p class="role">
        Role: <strong>Admin</strong>
      </p>

      <p class="capability">
        {roleCapability(role)}
      </p>

      <p class="accept-info">
        Once you accept, you will gain full access to all workspaces and
        administrative controls within this hub.
      </p>

      <!-- =============== MULTIPLE WORKSPACES =============== -->
    {:else if isMultiple}
      <p class="desc">
        {inviterName} has invited you to join the following workspaces under
        <strong>"{hubName}"</strong> hub.
      </p>

      <p class="role">
        Role: <strong>{role}</strong>
      </p>

      <p class="capability">
        {roleCapability(role)}
      </p>

      <div class="list">
        <div class="list-title">Workspaces included in this invite:</div>
        <ul>
          {#each workspaceNames as w}
            <li>{w}</li>
          {/each}
        </ul>
      </div>

      <p class="accept-info">
        Once you accept, these workspaces will be added to your account under
        the {hubName} hub with {role} access.
      </p>

      <!-- =============== SINGLE WORKSPACE =============== -->
    {:else}
      <p class="desc">
        {inviterName} has invited you to
        <strong>"{workspaceNames[0]}"</strong> workspace under
        <strong>"{hubName}"</strong> hub.
      </p>

      <p class="role">
        Role: <strong>{role}</strong>
      </p>

      <p class="capability">
        {roleCapability(role)}
      </p>

      <p class="accept-info">
        Once you accept you will gain access to this workspace and all the tools
        needed to collaborate with the team.
      </p>
    {/if}

    <div class="actions">
      <button
        class="decline"
        on:click={() =>
          onDecline({
            notificationId,
            teamId,
            workspaceIds,
            workspaceNames,
            teamName: hubName,
            role,
          })}
      >
        Decline
      </button>

      <button
        class="accept"
        on:click={() =>
          onAccept({
            notificationId,
            teamId,
            workspaceIds,
            workspaceNames,
            teamName: hubName,
            role,
          })}
      >
        Accept
      </button>
    </div>

    <p class="footer-note">
      You can manage pending invites later from Notifications.
    </p>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 999999;
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
    z-index: 1000000;
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

  .admin-note {
    margin-top: 6px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
  }

  .desc {
    margin-top: 8px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.9);
  }

  .role {
    margin-top: 12px;
    font-size: 14px;
  }

  .capability {
    margin-top: 4px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
  }

  .list {
    margin-top: 14px;
  }

  .list-title {
    font-size: 13px;
    margin-bottom: 6px;
    color: rgba(255, 255, 255, 0.8);
  }

  .list ul {
    padding-left: 18px;
    margin: 6px 0;
  }

  .list li {
    margin-bottom: 4px;
  }

  .accept-info {
    margin-top: 14px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.5;
  }

  .footer-note {
    margin-top: 16px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }
</style>
