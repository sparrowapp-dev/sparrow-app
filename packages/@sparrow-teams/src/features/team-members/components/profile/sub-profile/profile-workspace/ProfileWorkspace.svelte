<script lang="ts">
  import { TeamRole, WorkspaceRole } from "@sparrow/common/enums/team.enum";
  import type { workspaceDocumentWithPosition } from "@sparrow/common/interfaces";
  import { CaretDownFilled } from "@sparrow/library/icons";
  import { Select } from "@sparrow/library/forms";
  export let workspace: workspaceDocumentWithPosition;
  export let user;
  export let userType;
  export let handleMemberPopUpSuccess;
  export let workspaceCount;
  export let owner;

  /**
   * function to remove member from workspace
   */
  export let onRemoveUserFromWorkspace;
  /**
   * function to change user role at workspace
   */
  export let onChangeUserRoleAtWorkspace;

  const handleDropdown = async (id) => {
    if (id === "remove") {
      // perform remove operations
      await onRemoveUserFromWorkspace(
        workspace._id,
        workspace.name,
        user.id,
        user.name,
      );
    } else if (
      workspace.position === WorkspaceRole.WORKSPACE_EDITOR &&
      id === WorkspaceRole.WORKSPACE_VIEWER
    ) {
      // demote editor to viewer
      await onChangeUserRoleAtWorkspace(
        workspace._id,
        workspace.name,
        user.id,
        user.name,
        WorkspaceRole.WORKSPACE_VIEWER,
      );
    } else if (
      workspace.position === WorkspaceRole.WORKSPACE_VIEWER &&
      id === WorkspaceRole.WORKSPACE_EDITOR
    ) {
      // promote viewer to editor
      await onChangeUserRoleAtWorkspace(
        workspace._id,
        workspace.name,
        user.id,
        user.name,
        WorkspaceRole.WORKSPACE_EDITOR,
      );
    }
  };
</script>

<section style="padding-top:4px; padding-bottom:2px">
  <div
    class="d-flex justify-content-between align-items-center mb-1"
    style="height: 34px; "
  >
    <span
      style="font-size:12px; font-weight:400; width:calc(100% - 120px);"
      class="text-whiteColor ellipsis"
      ><span style="color:var(--text-ds-neutral-400);">{workspace.name}</span
      ></span
    >
    <div class="dropdown-workspace-access">
      {#if (userType === TeamRole.TEAM_OWNER && user.role === TeamRole.TEAM_MEMBER) || (userType === TeamRole.TEAM_ADMIN && user.role === TeamRole.TEAM_MEMBER)}
        <Select
          id={workspace._id}
          titleId={workspace.position ? workspace.position : ""}
          data={[
            {
              name: "Editor",
              id: WorkspaceRole.WORKSPACE_EDITOR,
              color: "light",
            },
            {
              name: "Viewer",
              id: WorkspaceRole.WORKSPACE_VIEWER,
              color: "light",
            },
            {
              name: "Remove",
              id: "remove",
              color: "danger",
            },
          ]}
          onclick={handleDropdown}
          menuItem={"v2"}
          headerTheme={"violet"}
          borderType={"none"}
          disabled={owner}
          isArrowIconRequired={!owner}
          bodyTheme={"violet"}
          headerFontSize={"10px"}
          borderRounded={"4px"}
        />
      {:else}
        <Select
          id={workspace._id + "member-workspace"}
          data={[
            {
              name: "Editor",
              id: WorkspaceRole.WORKSPACE_EDITOR,
            },
            {
              name: "Viewer",
              id: WorkspaceRole.WORKSPACE_VIEWER,
            },
            {
              name: "Admin",
              id: TeamRole.TEAM_ADMIN,
            },
            {
              name: "Owner",
              id: TeamRole.TEAM_OWNER,
            },
            {
              name: "Remove",
              id: "remove",
              color: "danger",
            },
          ]}
          titleId={workspace.position ? workspace.position : ""}
          onclick={handleDropdown}
          menuItem={"v2"}
          headerTheme={"transparent"}
          bodyTheme={"violet"}
          borderType={"none"}
          disabled={true}
          isArrowIconRequired={false}
          headerFontSize={"10px"}
        />
      {/if}
    </div>
    <!-- {#if user.role !== TeamRole.TEAM_MEMBER}
      <div style="position: relative; right: 2.8rem; padding-right: 2px;">
        <CaretDownFilled size="16px" color="var(--bg-ds-neutral-600)" />
      </div>
    {/if} -->
  </div>
</section>

<style>
  .dropdown-workspace-access {
    width: 100px;
  }
</style>
