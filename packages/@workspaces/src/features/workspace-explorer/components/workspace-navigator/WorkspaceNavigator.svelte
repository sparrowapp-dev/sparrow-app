<script lang="ts">
  import { InformationIcon, SettingIcon } from "@sparrow/library/icons";
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
    class="side-bar-btn d-flex gap-2"
    style="height:32px; padding:5px; padding-left:12px; border-radius:4px; font-size:12px; font-weight:700; background-color: {workspaceNavigatorId ===
    'about'
      ? 'var(--bg-tertiary-300)'
      : 'transparent'};"
  >
    <div>
      <InformationIcon
        height={"13.33px"}
        width={"13.33px"}
        color={"var(--icon-secondary-200)"}
      />
    </div>
    <div class="active" style="padding-top:0.5px;">About</div>
  </div>
  {#if userRole === WorkspaceRole.WORKSPACE_ADMIN}
    <div
      on:click={() => {
        workspaceNavigatorId = "settings";
      }}
      class="side-bar-btn d-flex gap-1"
      style="padding:5px; padding-left:9px; border-radius:4px; font-size:12px; font-weight:700; background-color: {workspaceNavigatorId ===
      'settings'
        ? 'var(--bg-tertiary-300)'
        : 'transparent'} "
    >
      <div>
        <SettingIcon
          height={"21px"}
          width={"21px"}
          color={"var(--icon-secondary-200)"}
        />
      </div>
      <div class="" style="padding-top: 2px;">Workspace Settings</div>
    </div>
  {/if}
</div>

<style>
  .side-bar-btn:hover {
    background-color: var(--bg-tertiary-600) !important;
  }
</style>
