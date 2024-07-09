<script lang="ts">
  export let workspaceDescription: string = "";
  export let workspaceID: string = "";
  export let onUpdateWorkspaceDescription: (
    workspaceId: string,
    workspaceDescription: string,
  ) => void;

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
