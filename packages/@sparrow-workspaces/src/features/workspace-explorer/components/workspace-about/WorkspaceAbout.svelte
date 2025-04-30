<script lang="ts">
  import { WorkspaceRole, WorkspaceType } from "@sparrow/common/enums";
  import { Button, notifications } from "@sparrow/library/ui";

  /**
   * The description of the workspace.
   */
  export let workspaceDescription: string = "";
  const maxChars = 100;
  export let workspaceName: string = ""; // Shared workspace name

  /**
   * Function to update the workspace description.
   * @param workspaceId - The ID of the workspace.
   * @param workspaceDescription - The updated description of the workspace.
   */
  export let onUpdateWorkspaceDescription;

  /**
   * Role of user in active workspace
   */
  export let userRole;

  export let workspaceType: WorkspaceType = WorkspaceType.PRIVATE;
  export let onMakeWorkspacePublic;
  export let onShareWorkspace;
  let isWorkspaceUpdating = false;

  const handleInputDescription = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.value.length <= maxChars) {
      workspaceDescription = target.value; // Update the description if within the limit
      onUpdateWorkspaceDescription(workspaceDescription); // Call the update function
    } else {
      workspaceDescription = target.value.slice(0, maxChars); // Trim the value to the limit
    }
  };
</script>

<div
  class="About d-flex flex-column h-100"
  style="padding-top:0; gap:16px !important; "
>
  <div class="h-100">
    <div class="d-flex flex-column" style="gap:24px">
      <div class="d-flex flex-column" style="gap:8px">
        <span class="textarea-header">
          Workspace Name
          <span style="color: var(--text-ds-danger-400)">*</span>
        </span>
        <textarea
          disabled={userRole === WorkspaceRole.WORKSPACE_VIEWER}
          id="workspaceNameField"
          class=" border-0 text-ds-font-size-12 input-outline shadow-none w-50 p-1"
          style="height: 28px; overflow:hidden;"
          bind:value={workspaceName}
          placeholder="Write your workspace name"
        />
      </div>
      <div class="d-flex flex-column" style="gap:8px">
        <span class="textarea-header">Workspace Summary</span>
        <div class="d-flex flex-column" style="gap:4px">
          <textarea
            disabled={userRole === WorkspaceRole.WORKSPACE_VIEWER}
            id="updateWorkspaceDescField"
            class=" border-0 text-ds-font-size-12 input-outline shadow-none w-50 p-2"
            bind:value={workspaceDescription}
            placeholder="Write a short summary about your workspace"
            on:input={handleInputDescription}
          />
          <div
            class="d-flex justify-content-between w-50"
            style="margin-bottom: 20px;"
          >
            <span class="description">Max {maxChars} characters</span>
            <span class="description"
              >{workspaceDescription.length}/{maxChars}</span
            >
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-column" style="gap:8px;">
      <span
        class="textarea-header"
        >Make you Workspace public</span
      >
      <div
        class="w-50 mb-3"
        style="color: var(--text-ds-neutral-400); font-size: 12px;"
      >
        This means anyone with the link can view your workspace and its
        contents.
      </div>
    </div>
    {#if workspaceType === WorkspaceType.PUBLIC}
      <Button
        title="Share workspace"
        type={"secondary"}
        onClick={async () => {
          await onShareWorkspace();
        }}
      ></Button>
    {:else if userRole === WorkspaceRole.WORKSPACE_ADMIN}
      <Button
        title="Make it public"
        type={"secondary"}
        loader={isWorkspaceUpdating}
        disable={isWorkspaceUpdating}
        onClick={async () => {
          isWorkspaceUpdating = true;
          await onMakeWorkspacePublic();
          isWorkspaceUpdating = false;
        }}
      ></Button>
    {/if}
  </div>
</div>

<style>
  textarea {
    outline: none;
    height: 168px;
    border: 1px solid transparent !important;
    border-radius: 4px !important;
    background-color: var(--bg-ds-surface-600);
  }
  textarea:focus,
  textarea:hover {
    border: 1px solid var(--border-primary-300) !important;
  }
  .textarea-header {
    font-size: 12px;
    color: var(--text-ds-neutral-200);
    font-size: 12px;
    font-weight: 500;
  }
  .description{
    font-size: 12px;
    color: var(--text-ds-neutral-400);
    font-weight: 400;
  }
</style>
