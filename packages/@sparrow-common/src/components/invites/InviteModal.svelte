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
  let accepting = false;

  $: isMultiple = (workspaceNames?.length || 0) > 1;
  $: isAdmin = role === "admin";
  $: roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : "";

  function roleCapability(role: string) {
    if (role === "admin")
      return "Full access to manage this hub and all workspaces.";
    if (role === "editor")
      return "Can edit APIs and collaborate within the workspace.";
    if (role === "viewer") return "Can view APIs and workspace content.";
    return "";
  }

  async function handleAcceptClick() {
    accepting = true;

    await onAccept({
      notificationId,
      teamId,
      workspaceIds,
      workspaceNames,
      teamName: hubName,
      role,
    });
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

    <h2 class="title">Invite from {hubName}</h2>

    <!-- ================= ADMIN ================= -->
    {#if isAdmin}
      <p class="desc">
        {inviterName} has invited you to join the
        <strong>"{hubName}" Hub</strong> as an <strong>Admin</strong>.
      </p>

      <p class="role">Role: <strong>Admin</strong></p>
      <p class="capability">{roleCapability(role)}</p>

      <p class="accept-info">
        Once you accept, you will gain full access to this hub and all
        workspaces along with administrative controls.
      </p>

      <!-- =============== MULTIPLE WORKSPACES =============== -->
    {:else if isMultiple}
      <p class="desc">
        {inviterName} has invited you to join the following workspaces under
        <strong>"{hubName}" Hub</strong>.
      </p>

      <p class="role">Role: <strong>{roleLabel}</strong></p>
      <p class="capability">{roleCapability(role)}</p>

      <div class="list">
        <div class="list-title">Workspaces included in this invite:</div>
        <ul>
          {#each workspaceNames as w}
            <li><strong>{w}</strong></li>
          {/each}
        </ul>
      </div>

      <p class="accept-info">
        Once you accept, these workspaces will be added to your account under
        the {hubName} Hub with {roleLabel} access and all the tools you need to work
        with your team.
      </p>

      <!-- =============== SINGLE WORKSPACE =============== -->
    {:else}
      <p class="desc">
        {inviterName} has invited you to
        <strong>"{workspaceNames[0]}"</strong> workspace under
        <strong>"{hubName}" Hub</strong>.
      </p>

      <p class="role">Role: <strong>{roleLabel}</strong></p>
      <p class="capability">{roleCapability(role)}</p>

      <p class="accept-info">
        Once you accept you will gain access to the "{workspaceNames[0]}"
        workspace within this hub and all the tools you need to work with your
        team.
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

      <button class="accept" disabled={accepting} on:click={handleAcceptClick}>
        {#if accepting}
          <span class="spinner"></span>
        {:else}
          Accept
        {/if}
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
    background: rgba(0, 0, 0, 0.65);
    z-index: 999999;
  }

  .invite-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    /* ⬅ wider like figma */
    width: 580px;

    /* ⬅ slightly tighter padding */
    padding: 30px 34px;

    border-radius: 14px;
    background: linear-gradient(180deg, #202636 0%, #1a2030 100%);
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.55);
    z-index: 1000000;
  }

  .close {
    position: absolute;
    right: 18px;
    top: 18px;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    font-size: 18px;
    cursor: pointer;
  }

  .avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6a5cff, #7b6cff);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 600;

    /* ⬅ reduced */
    margin-bottom: 14px;
  }

  .title {
    font-size: 26px;
    font-weight: 600;

    /* ⬅ reduced */
    margin-bottom: 10px;
  }

  .desc {
    line-height: 1.45; /* ⬅ tighter lines */
    margin-bottom: 12px;
  }

  .role {
    margin-top: 2px;
    margin-bottom: 4px;
    font-size: 14px;
  }

  .capability {
    color: rgba(255, 255, 255, 0.75);
    margin-bottom: 14px;
    font-size: 13.5px;
  }

  .list {
    margin-top: 10px;
    margin-bottom: 14px;
  }

  .list-title {
    font-size: 13.5px;
    margin-bottom: 4px;
    color: rgba(255, 255, 255, 0.8);
  }

  .list ul {
    padding-left: 18px;
    margin: 4px 0;
  }

  .list li {
    margin-bottom: 4px; /* ⬅ tighter */
  }

  .accept-info {
    margin-top: 10px;
    font-size: 13.5px;
    line-height: 1.45;
    color: rgba(255, 255, 255, 0.75);
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 14px;

    /* ⬅ reduced */
    margin-top: 22px;
  }

  .accept,
  .decline {
    padding: 11px 22px;
    border-radius: 10px;
    border: none;
    font-size: 14px;
    cursor: pointer;
  }

  .decline {
    background: #2b3140;
    color: white;
  }

  .accept {
    background: #3f6df0;
    color: white;
    min-width: 110px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .footer-note {
    margin-top: 14px; /* ⬅ reduced */
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .spinner {
    width: 18px;
    height: 18px;
    border: 2.5px solid rgba(255, 255, 255, 0.35);
    border-top: 2.5px solid #ffffff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
