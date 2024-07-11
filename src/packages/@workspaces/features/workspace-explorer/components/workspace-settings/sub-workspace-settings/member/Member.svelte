<script lang="ts">
  /**
   * user at workspace level
   */
  export let user;

  /**
   * Indicates if the current user is active.
   */
  export let isActiveUser;
</script>

<div class="d-flex align-items-center mb-2 w-100" style="height: 46px;">
  <div
    class="rounded-5 me-2 border border-defaultColor d-flex justify-content-center align-items-center"
    style="height: 32px; width: 32px;"
  >
    <p class="mb-0">
      {user?.name[0]}
    </p>
  </div>
  <div
    class="d-flex flex-column"
    style="width:calc(100% - 100px); font-size:12px; "
  >
    <div style="color: var(--text-secondary-100);">
      <p class="mb-0">
        {user?.name}
        {#if isActiveUser}
          (You)
        {/if}
      </p>
    </div>
    <div style="color: var(--text-secondary-200) ;">
      <p class="mb-0">{user?.email}</p>
    </div>
  </div>
  <div style="color: var(--text-secondary-100); font-size:12px;">
    <p class="mb-0">
      {user?.role}
    </p>
  </div>
</div>
