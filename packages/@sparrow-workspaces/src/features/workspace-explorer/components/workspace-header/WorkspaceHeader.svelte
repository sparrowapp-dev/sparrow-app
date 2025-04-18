<script lang="ts">
  import { WorkspaceRole } from "@sparrow/common/enums";
  import { Input } from "@sparrow/library/forms";
  import { Button } from "@sparrow/library/ui";
  import { PeopleRegular, SaveRegular } from "@sparrow/library/icons";
  import { onDestroy, onMount } from "svelte";
  /**
   * The name of the workspace.
   */
  export let workspaceName: string = "";

  /**
   * The ID of the workspace.
   */
  export let workspaceID: string = "";

  /**
   * Boolean flag to indicate if the workspace invite modal is open.
   */
  export let isWorkspaceInviteModalOpen: boolean;

  /**
   * Function to handle deletion of the workspace.
   */
  export let onDeleteWorkspace;

  /**
   * Function to update the workspace name.
   * @param workspaceID - The ID of the workspace.
   * @param workspaceName - The updated name of the workspace.
   */
  export let onUpdateWorkspaceName: (
    workspaceID: string,
    workspaceName: string,
  ) => void;

  /**
   * Role of user in active workspace
   */
  export let userRole;

  const handleInputName = (event: Event) => {
    onUpdateWorkspaceName(event.detail, "");
  };
  const handleBlurName = (event: Event) => {
    onUpdateWorkspaceName(event.detail, "blur");
  };
  export let onSaveWorkspace;

  export let isSaved;

  const handleKeyDown = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "s") {
      event.preventDefault();
      if (userRole !== WorkspaceRole.WORKSPACE_VIEWER && !isSaved) {
        onSaveWorkspace();
      }
    }
  };

  onMount(() => {
    window.addEventListener("keydown", handleKeyDown);
  });

  onDestroy(() => {
    window.removeEventListener("keydown", handleKeyDown);
  });
</script>

<section>
  <div class="About d-flex flex-column h-100" style="gap:16px !important; ">
    <div class="d-flex" style="justify-content: space-between;">
      <div
        class="ellipsis w-auto"
        style="font-weight: 700; color:var(--text-secondary-100);"
      >
        <Input
          width={"398px"}
          placeholder={""}
          type={"text"}
          value={workspaceName}
          variant={"inline"}
          id="renameInputFieldWorkspace"
          disabled={userRole === WorkspaceRole.WORKSPACE_VIEWER}
          maxlength={100}
          on:input={handleInputName}
          on:blur={handleBlurName}
        />
      </div>
      <div class="d-flex gap-2">
        {#if userRole === WorkspaceRole.WORKSPACE_ADMIN}
          <div class="d-flex gap-2 ms-3">
            <Button
              startIcon={PeopleRegular}
              size={"medium"}
              type={"primary"}
              title={"Invite"}
              onClick={() => {
                isWorkspaceInviteModalOpen = true;
              }}
              disable={userRole !== WorkspaceRole.WORKSPACE_ADMIN}
            />
          </div>
        {/if}

        <Button
          disable={isSaved || userRole === WorkspaceRole.WORKSPACE_VIEWER}
          startIcon={SaveRegular}
          type={"secondary"}
          onClick={() => {
            onSaveWorkspace();
          }}
        />
      </div>
    </div>
  </div>
</section>

<style>
  input {
    outline: none;
    border: 1px solid transparent !important;
  }
  input:focus,
  input:hover {
    border: 1px solid var(--border-primary-300) !important;
  }
</style>
