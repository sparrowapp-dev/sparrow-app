<script>
  import MemberDropdown from "$lib/components/dropdown/MemberDropdown.svelte";
  import { TeamRole, WorkspaceRole } from "$lib/utils/enums/team.enum";

  export let workspace;
  export let user;
  export let userType;

  const handleDropdown = (id) => {
    if (id === "remove") {
      // perform remove perations
    } else if (
      workspace.position === WorkspaceRole.EDITOR &&
      id === WorkspaceRole.VIEWER
    ) {
      // demote editor to viewer
    } else if (
      workspace.position === WorkspaceRole.VIEWER &&
      id === WorkspaceRole.EDITOR
    ) {
      // promote viewer to editor
    }
  };
</script>

<section>
  <div class="d-flex justify-content-between align-items-center">
    <span style="font-size:12px;" class="text-whiteColor">{workspace.name}</span
    >
    <div class="dropdown-workspace-access">
      {#if (userType === TeamRole.OWNER && user.role === TeamRole.MEMBER) || (userType === TeamRole.ADMIN && user.role === TeamRole.MEMBER)}
        <MemberDropdown
          id={workspace._id + "member-workspace"}
          data={[
            {
              name: "Editor",
              id: WorkspaceRole.EDITOR,
              color: "whiteColor",
            },
            {
              name: "Viewer",
              id: WorkspaceRole.VIEWER,
              color: "whiteColor",
            },
            {
              name: "Remove",
              id: "remove",
              color: "dangerColor",
            },
          ]}
          method={workspace.position ? workspace.position : ""}
          onclick={handleDropdown}
        />
      {:else}
        <MemberDropdown
          id={workspace._id + "member-workspace"}
          disabled={true}
          data={[
            {
              name: "Editor",
              id: WorkspaceRole.EDITOR,
              color: "whiteColor",
            },
            {
              name: "Viewer",
              id: WorkspaceRole.VIEWER,
              color: "whiteColor",
            },
            {
              name: "Admin",
              id: TeamRole.ADMIN,
              color: "whiteColor",
            },
            {
              name: "Owner",
              id: TeamRole.OWNER,
              color: "whiteColor",
            },
          ]}
          method={user.role === TeamRole.OWNER
            ? TeamRole.OWNER
            : workspace.position
            ? workspace.position
            : ""}
          onclick={handleDropdown}
        />
      {/if}
    </div>
  </div>
</section>

<style>
  .dropdown-workspace-access {
    width: 100px;
  }
</style>
