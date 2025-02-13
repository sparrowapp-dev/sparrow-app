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
  // import { NewInput } from "@sparrow/library/forms";

  /**
   * Exports
   */
  export let teamForm: TeamForm;

  /**
   * Data
   */
  const inputId: string = "team-name-input";
  $: defaultBorderColor =
    !teamForm.name.value && teamForm.name.isTouched
      ? "1px solid var(--border-ds-danger-300) !important"
      : "transparent";
  $: hoveredBorderColor =
    !teamForm.name.value && teamForm.name.isTouched
      ? "1px solid var(--border-ds-danger-300) !important"
      : "1px solid var(--border-ds-neutral-300)";

  $: focusedBorderColor =
    !teamForm.name.value && teamForm.name.isTouched
      ? "2px solid var(--border-ds-danger-300) !important"
      : "2px solid var(--border-ds-primary-300)";
  $: typedBorderColor =
    !teamForm.name.value && teamForm.name.isTouched
      ? "1px soild var(--border-ds-danger-300) !important"
      : "transparent";
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
    bind:value={teamForm.name.value}
    on:blur={() => {
      teamForm.name.isTouched = true;
      teamForm.name.value = teamForm.name.value.trim();
    }}
    isEditIconRequired={false}
    {defaultBorderColor}
    {hoveredBorderColor}
    {focusedBorderColor}
    {typedBorderColor}
    type={"text"}
    maxlength={NAME_CONFIG.MAX_TEXT_SIZE}
    height={"36px"}
    id={inputId}
    placeholder={NAME_CONFIG.PLACEHOLDER}
    style="outline:none;"
    class="text-fs-14 fw-normal py-2 px-1  border-radius-4"
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
