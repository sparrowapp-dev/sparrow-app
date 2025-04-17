<script lang="ts">
  import { InfoRegular, SettingsRegular } from "@sparrow/library/icons";
  import { WorkspaceRole } from "@sparrow/common/enums";

  /**
   * The ID of the currently selected workspace navigator item.
   */
  export let workspaceNavigatorId: string = "";

  /**
   * Role of user in active workspace
   */
  export let userRole;
</script>

<div class="d-flex flex-column gap-1" style="color: var(--text-secondary-100);">
  <div
    on:click={() => {
      workspaceNavigatorId = "about";
    }}
    class="side-bar-btn d-flex align-items-center gap-1 text-ds-font-size-12 text-ds-font-weight-medium"
    style="height:32px; padding:5px; padding-left:9px; border-radius:4px;  background-color: {workspaceNavigatorId ===
    'about'
      ? 'var(--bg-tertiary-300)'
      : 'transparent'};"
  >
    <div>
      <InfoRegular size="20px" color="var(--icon-secondary-200)" />
    </div>
    <div
      class="active text-ds-font-size-12 text-ds-font-weight-semi-bold"
      style="padding-top:1px;"
    >
      About
    </div>
  </div>
  {#if userRole === WorkspaceRole.WORKSPACE_ADMIN}
    <div
      on:click={() => {
        workspaceNavigatorId = "settings";
      }}
      class="side-bar-btn d-flex align-items-center gap-1"
      style="height:32px; padding:5px; padding-left:9px; border-radius:4px; font-size:12px; font-weight:700; background-color: {workspaceNavigatorId ===
      'settings'
        ? 'var(--bg-tertiary-300)'
        : 'transparent'} "
    >
      <div>
        <SettingsRegular size="20px" color="var(--icon-secondary-200)" />
      </div>
      <div
        class="text-ds-font-size-12 text-ds-font-weight-semi-bold text-ds-line-height-130"
        style="padding-top: 2px;"
      >
        Workspace Settings
      </div>
    </div>
  {/if}
</div>

<style>
  .side-bar-btn:hover {
    background-color: var(--bg-tertiary-600) !important;
  }
</style>
