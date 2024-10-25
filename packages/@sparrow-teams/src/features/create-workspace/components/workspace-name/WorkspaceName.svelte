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
    height={"36px"}
    id={inputId}
    placeholder={NAME_CONFIG.PLACEHOLDER}
    class="text-fs-14 bg-tertiary-300 fw-normal px-2 border-radius-4"
    style="outline:none;"
    defaultBorderColor={!workspaceForm.name.value.trim() &&
    workspaceForm.name.isTouched
      ? "var(--border-danger-200)"
      : "transparent"}
    hoveredBorderColor={!workspaceForm.name.value.trim() &&
    workspaceForm.name.isTouched
      ? "var(--border-danger-200)"
      : "transparent"}
    focusedBorderColor={!workspaceForm.name.value.trim() &&
    workspaceForm.name.isTouched
      ? "var(--border-danger-200)"
      : "transparent"}
    isEditIconRequired={false}
    type={"text"}
    placeholderColor={"var(--text-secondary-200)"}
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
