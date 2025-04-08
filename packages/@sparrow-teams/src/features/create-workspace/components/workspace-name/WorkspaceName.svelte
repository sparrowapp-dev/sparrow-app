<script lang="ts">
  /**
   * Components
   */
  import { Input, LabelField } from "@sparrow/library/forms";

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
      -- Input with Label Text 
    -->
  <LabelField
    inputLabelId={inputId}
    inputValueRequired={true}
    headerLabelText={NAME_CONFIG.TITLE}
    helpLabel={true}
    isError={!workspaceForm.name.value.trim() && workspaceForm.name.isTouched}
    errorMessage={NAME_CONFIG.REQUIRED_ERROR_MESSAGE}
  >
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
      isError={!workspaceForm.name.value.trim() && workspaceForm.name.isTouched}
      isEditIconRequired={false}
      type={"text"}
      placeholderColor={"var(--text-secondary-200)"}
    />
  </LabelField>
</div>
