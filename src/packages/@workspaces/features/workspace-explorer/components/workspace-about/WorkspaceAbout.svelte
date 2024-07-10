<script lang="ts">
  /**
   * The description of the workspace.
   */
  export let workspaceDescription: string = "";

  /**
   * The ID of the workspace.
   */
  export let workspaceID: string = "";

  /**
   * Function to update the workspace description.
   * @param workspaceId - The ID of the workspace.
   * @param workspaceDescription - The updated description of the workspace.
   */
  export let onUpdateWorkspaceDescription: (
    workspaceId: string,
    workspaceDescription: string,
  ) => void;

  /**
   * Handles the update of workspace description.
   * Calls with current workspaceID and workspaceDescription.
   */
  const handleWorkspaceDescription = async () => {
    await onUpdateWorkspaceDescription(workspaceID, workspaceDescription);
  };
</script>

<div
  class="About d-flex flex-column h-100"
  style="padding:24px; padding-top:0; gap:16px !important; "
>
  <div>
    <textarea
      bind:value={workspaceDescription}
      on:blur={handleWorkspaceDescription}
      class="text-area w-100"
      style="height: 121px; background-color:transparent; border:none;"
      placeholder="This is your personal workspace. Describe the objectives of the workspace and how it is meant to be used. Or create a comprehensive API documentation by including links to your collections and requests. Start typing. "
    ></textarea>
  </div>
</div>

<style>
  .text-area::placeholder {
    font-size: 12px;
    color: var(--bg-secondary-950);
  }
  .text-area {
    outline: none;
  }
</style>
