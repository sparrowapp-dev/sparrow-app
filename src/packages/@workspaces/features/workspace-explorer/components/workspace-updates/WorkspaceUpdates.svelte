<script lang="ts">
  /**
   * The last modified user of the workspace.
   */
  export let modifiedUser;
</script>

<div
  style="border-bottom:1px solid #2A2C3C; margin-top:16px; margin-bottom:8px;"
></div>
<div
  class="d-flex flex-column"
  style="gap: 8px; height:430px; flex-grow:1 !important;"
>
  <div
    class="ps-0"
    style="color: var( --text-secondary-200); font-weight:700; font-size:12px; padding:8px; "
  >
    WORKSPACE UPDATES
  </div>
  <div class="d-flex flex-column">
    <div
      style="color: var(--text-secondary-100); font-weight:700; font-size:12px;"
    >
      Last Activity by -
    </div>
    <div
      class="d-flex"
      style="color: var( --text-secondary-200); font-weight:700; font-size:12px; justify-content:space-between"
    >
      <p>{modifiedUser?.name}</p>
    </div>
  </div>
</div>
