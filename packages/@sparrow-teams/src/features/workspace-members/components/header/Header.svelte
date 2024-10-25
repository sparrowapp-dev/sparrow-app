<script lang="ts">
  import { WorkspaceRole } from "@sparrow/common/enums";
  import { Button } from "@sparrow/library/ui";

  /**
   * The name of the workspace.
   */
  export let workspaceName: string = "";

  /**
   * Boolean flag to indicate if the workspace invite modal is open.
   */
  export let isWorkspaceInviteModalOpen: boolean;

  /**
   * Function to handle deletion of the workspace.
   */
  export let onDeleteWorkspace;

  /**
   * Role of user in active workspace
   */
  export let userRole;

  /**
   * Current workspace which is active
   */
  export let activeWorkspace;
</script>

<section>
  <div
    class="About d-flex flex-column h-100"
    style="padding-bottom:4px; gap:16px !important; "
  >
    <div
      class="d-flex"
      style="justify-content: space-between; align-items:center; margin-top:8px"
    >
      <div
        class="ellipsis w-100"
        style="font-weight: 500; color:var(--text-secondary-100); margin-top:20px"
      >
        <p
          class="bg-transparent input-outline border-0 text-fs-18 text-left w-100 ps-2 py-0"
        >
          {workspaceName}
        </p>
      </div>
      {#if userRole === WorkspaceRole.WORKSPACE_ADMIN}
        <div class="d-flex gap-2 ms-3">
          <Button
            type={"dark"}
            title={"Delete Workspace"}
            textClassProp={"fs-12 "}
            textStyleProp={"font-weight:400; font-size:12px;"}
            onClick={() => {
              onDeleteWorkspace(activeWorkspace);
            }}
            disable={userRole !== WorkspaceRole.WORKSPACE_ADMIN}
          />
          <Button
            type={"primary"}
            title={"Invite"}
            textClassProp={"fs-12"}
            textStyleProp={"font-weight:400; font-size:12px;"}
            onClick={() => {
              isWorkspaceInviteModalOpen = true;
            }}
            disable={userRole !== WorkspaceRole.WORKSPACE_ADMIN}
          ></Button>
        </div>
      {/if}
    </div>
  </div>
</section>
