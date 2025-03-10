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
  $: ErrorValue = !teamForm.name.value && teamForm.name.isTouched;
</script>

<div class="pb-4 mt-3">
  <!-- 
    -- Title 
  -->
  <!-- <label for={inputId} class="text-fs-14 pb-1 text-secondary-1000"
    >{NAME_CONFIG.TITLE}</label
  >
  <span class="text-danger-200">*</span> -->

  <!-- 
    -- Input 
  -->
  <Input
    bind:value={teamForm.name.value}
    on:blur={() => {
      teamForm.name.isTouched = true;
      teamForm.name.value = teamForm.name.value.trim();
    }}
    headerLabel={true}
    headerLabelText={NAME_CONFIG.TITLE}
    inputValueRequired={true}
    isError={ErrorValue}
    helpLabel={true}
    errorMessage={NAME_CONFIG.REQUIRED_ERROR_MESSAGE}
    type={"text"}
    variant={"primary"}
    maxlength={NAME_CONFIG.MAX_TEXT_SIZE}
    size="medium"
    id={inputId}
    placeholder={NAME_CONFIG.PLACEHOLDER}
    style="outline:none;"
  />

  <!-- 
    -- Error Messages 
  -->
  <!-- {#if !teamForm.name.value && teamForm.name.isTouched}
    <p class="mb-0 mt-1 text-fs-12 text-danger-200">
      {NAME_CONFIG.REQUIRED_ERROR_MESSAGE}
    </p>
  {/if} -->
</div>
