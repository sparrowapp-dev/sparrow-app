<script lang="ts">
  import { WorkspaceRole, WorkspaceType } from "@sparrow/common/enums";
  import { Input } from "@sparrow/library/forms";
  import { CopyRegular } from "@sparrow/library/icons";
  import { Button, notifications } from "@sparrow/library/ui";
  import { policyConfig } from "../../../../../../@sparrow-common/src/store/policyStore";

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
  export let isWorkspaceSharing = false;
  export let onUpdateWorkspaceName;
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
  const handleInputName = (event: Event) => {
    onUpdateWorkspaceName(event.detail, "");
  };
  const handleBlurName = (event: Event) => {
    onUpdateWorkspaceName(event.detail, "blur");
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
        <Input
          width={"410px"}
          placeholder={""}
          type={"text"}
          value={workspaceName}
          size="small"
          variant={"secondary"}
          id="workspaceNameField"
          disabled={userRole === WorkspaceRole.WORKSPACE_VIEWER}
          maxlength={100}
          on:input={handleInputName}
          on:blur={handleBlurName}
        />
      </div>
      <div class="d-flex flex-column" style="gap:8px">
        <span class="textarea-header">Workspace Summary</span>
        <div class="d-flex flex-column" style="gap:4px">
          <textarea
            disabled={userRole === WorkspaceRole.WORKSPACE_VIEWER}
            id="updateWorkspaceDescField"
            class=" border-0 text-ds-font-size-12 input-outline shadow-none p-2"
            maxlength="100"
            style="width: 410px;"
            bind:value={workspaceDescription}
            placeholder="Write a short summary about your workspace"
            on:input={handleInputDescription}
          />
          <div
            class="d-flex justify-content-between"
            style="margin-bottom: 20px; width:410px"
          >
            <span class="description">Max {maxChars} characters</span>
            <span class="description"
              >{workspaceDescription.length}/{maxChars}</span
            >
          </div>
        </div>
      </div>
    </div>

    {#if workspaceType === WorkspaceType.PRIVATE && !$policyConfig.restrictPublicWorkspaceCreation}
      <div class="flex flex-column" style="gap:8px;">
        <span class="textarea-header">Make your Workspace public</span>
        <div
          class="w-50 mb-3"
          style="color: var(--text-ds-neutral-400); font-size: 12px;"
        >
          This means anyone with the link can view your workspace and its
          contents.
        </div>
      </div>
    {/if}
    {#if workspaceType === WorkspaceType.PUBLIC}
      <Button
        title={isWorkspaceSharing ? "Link Copied" : "Share workspace"}
        type={"secondary"}
        onClick={async () => {
          await onShareWorkspace();
          isWorkspaceSharing = true;
          setTimeout(() => {
            isWorkspaceSharing = false;
          }, 3000);
        }}
        startIcon={isWorkspaceSharing ? CopyRegular : ""}
      ></Button>
    {:else if userRole === WorkspaceRole.WORKSPACE_ADMIN && !$policyConfig.restrictPublicWorkspaceCreation}
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
  .description {
    font-size: 12px;
    color: var(--text-ds-neutral-400);
    font-weight: 400;
  }
</style>
