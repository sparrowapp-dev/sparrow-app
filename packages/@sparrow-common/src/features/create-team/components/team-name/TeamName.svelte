<script lang="ts">
  /**
   * Components
   */
  import { Input } from "@sparrow/library/forms";

  /**
   * Types
   */
  import type { TeamForm } from "../../types";

  /**
   * Constants
   */
  import { NAME_CONFIG } from "../../constants";

  /**
   * Exports
   */
  export let teamForm: TeamForm;

  /**
   * Data
   */
  const inputId: string = "team-name-input";
</script>

<div class="pb-4 mt-3">
  <!-- 
    -- Title 
  -->
  <label
    for={inputId}
    class="text-fs-14 pb-1 text-secondary-1000"
    style="color:var(--text-ds-neutral-200)">{NAME_CONFIG.TITLE}</label
  >
  <span class="text-danger-200" style="color:var(--bg-ds-danger-400)">*</span>

  <!-- 
    -- Input 
  -->
  <Input
    bind:value={teamForm.name.value}
    on:blur={() => {
      teamForm.name.isTouched = true;
      teamForm.name.value = teamForm.name.value.trim();
    }}
    height={"36px"}
    id={inputId}
    placeholder={NAME_CONFIG.PLACEHOLDER}
    class="text-fs-14 bg-tertiary-300 fw-normal px-2 border-radius-4"
    style="outline:none;"
    isError={!teamForm.name.value && teamForm.name.isTouched}
    isEditIconRequired={false}
    type={"text"}
    maxlength={NAME_CONFIG.MAX_TEXT_SIZE}
    placeholderColor={"var(--text-secondary-200)"}
  />

  <!-- 
    -- Error Messages 
  -->
  {#if !teamForm.name.value && teamForm.name.isTouched}
    <p class="mb-0 mt-1 text-fs-12 text-danger-200">
      {NAME_CONFIG.REQUIRED_ERROR_MESSAGE}
    </p>
  {/if}
</div>
