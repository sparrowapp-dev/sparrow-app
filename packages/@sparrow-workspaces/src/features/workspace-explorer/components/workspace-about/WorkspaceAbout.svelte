<script lang="ts">
  import { WorkspaceRole, WorkspaceType } from "@sparrow/common/enums";
  import { Button, notifications } from "@sparrow/library/ui";

  /**
   * The description of the workspace.
   */
  export let workspaceDescription: string = "";

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
    onUpdateWorkspaceDescription(target.value);
  };
</script>

<div
  class="About d-flex flex-column h-100"
  style="padding-top:0; gap:16px !important; "
>
  <div class="h-100">
    <textarea
      disabled={userRole === WorkspaceRole.WORKSPACE_VIEWER}
      id="updateWorkspaceDescField"
      class=" border-0 text-ds-font-size-12 input-outline shadow-none w-100 p-2"
      value={workspaceDescription || ""}
      placeholder="Describe this workspace's objectives or add links to generate API documentation. Start typing."
      on:input={handleInputDescription}
    />
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
</style>
