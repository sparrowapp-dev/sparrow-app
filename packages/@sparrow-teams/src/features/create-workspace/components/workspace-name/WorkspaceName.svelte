<script lang="ts">
  /**
   * Components
   */
  import { Input } from "@sparrow/library/forms";

  /**
   * Types
   */
  import type { WorkspaceForm } from "../../types";

  /**
   * Constants
   */
  import { NAME_CONFIG } from "../../constants";

  /**
   * Exports
   */
  export let workspaceForm: WorkspaceForm;

  /**
   * Data
   */
  const inputId: string = "team-name-input";
</script>

<div class="pb-4 mt-3">
  <!-- 
      -- Title 
    -->
  <label for={inputId} class="text-fs-14 pb-1 text-secondary-1000"
    >{NAME_CONFIG.TITLE}</label
  >
  <span class="text-danger-200">*</span>

  <!-- 
      -- Input 
    -->
  <Input
    bind:value={workspaceForm.name.value}
    on:blur={() => {
      workspaceForm.name.isTouched = true;
    }}
    size="medium"
    variant="primary"
    id={inputId}
    placeholder={NAME_CONFIG.PLACEHOLDER}
    style="outline:none;"
    isError={Boolean(
      !workspaceForm.name.value.trim() && workspaceForm.name.isTouched,
    )}
    type={"text"}
  />

  <!-- 
      -- Error Messages 
    -->
  {#if !workspaceForm.name.value.trim() && workspaceForm.name.isTouched}
    <p class="mb-0 mt-1 text-fs-12 text-danger-200">
      {NAME_CONFIG.REQUIRED_ERROR_MESSAGE}
    </p>
  {/if}
</div>
