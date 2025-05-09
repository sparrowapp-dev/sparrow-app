<script lang="ts">
  import { WorkspaceRole, WorkspaceType } from "@sparrow/common/enums";
  import { Input } from "@sparrow/library/forms";
  import { Button, Tag } from "@sparrow/library/ui";
  import {
    GlobeRegular,
    LockClosedRegular,
    PeopleRegular,
    SaveRegular,
  } from "@sparrow/library/icons";
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

  /**
   * Indicate whether workspace is public or not.
   */
  export let isSharedWorkspace = false;

  const handleInputName = (event: Event) => {
    onUpdateWorkspaceName(event.detail, "");
  };
  const handleBlurName = (event: Event) => {
    onUpdateWorkspaceName(event.detail, "blur");
  };
  export let onSaveWorkspace;

  export let isSaved;

  export let workspaceType: WorkspaceType = WorkspaceType.PRIVATE;

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
        class="ellipsis w-auto d-flex"
        style="font-weight: 700; color:var(--text-secondary-100); align-items:center;"
      >
        <!-- <Input
          width={"200px"}
          placeholder={""}
          type={"text"}
          value={workspaceName}
          variant={"inline"}
          id="renameInputFieldWorkspace"
          disabled={true}
          maxlength={100}
          on:input={handleInputName}
          on:blur={handleBlurName}
        /> -->
        <p
          style="color: var(--text-ds-neutral-50); margin:0px;"
          class="text-ds-font-size-20 text-ds-font-weight-semi-bold ellipsis"
        >
          {workspaceName}
        </p>
        <div style="margin-left: 10px;">
          {#if workspaceType === WorkspaceType.PUBLIC}
            <Tag
              text={WorkspaceType.PUBLIC}
              type="green"
              endIcon={GlobeRegular}
            />
          {:else}
            <Tag
              text={WorkspaceType.PRIVATE}
              type="cyan"
              endIcon={LockClosedRegular}
            />
          {/if}
        </div>
      </div>
      <div class="d-flex gap-2">
        {#if userRole === WorkspaceRole.WORKSPACE_ADMIN}
          <div class="d-flex gap-2 ms-3">
            <Button
              startIcon={PeopleRegular}
              size={"medium"}
              type={"primary"}
              title={"Invite collaborators"}
              onClick={() => {
                isWorkspaceInviteModalOpen = true;
              }}
              disable={userRole !== WorkspaceRole.WORKSPACE_ADMIN}
            />
          </div>
        {/if}

        {#if !isSharedWorkspace}
          <Button
            disable={isSaved ||
              userRole === WorkspaceRole.WORKSPACE_VIEWER ||
              isSharedWorkspace}
            startIcon={SaveRegular}
            type={"secondary"}
            onClick={() => {
              onSaveWorkspace();
            }}
          />
        {/if}
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
