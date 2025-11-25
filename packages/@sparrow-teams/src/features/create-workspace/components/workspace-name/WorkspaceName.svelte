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

  const isValidWorkspaceName = (name: string) => {
    const trimmedName = name.trim();
    // Check if empty
    if (!trimmedName) return false;
    // Check if contains at least one alphanumeric character
    const hasAlphanumeric = /[a-zA-Z0-9]/.test(trimmedName);
    // Check if contains only allowed characters (letters, digits, spaces, ., -, _)
    const onlyAllowedChars = /^[a-zA-Z0-9._\- ]+$/.test(trimmedName);
    return hasAlphanumeric && onlyAllowedChars;
  };
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
    isError={(!workspaceForm.name.value.trim() &&
      workspaceForm.name.isTouched) ||
      workspaceForm.name.invalid}
    errorMessage={!workspaceForm.name.value.trim() &&
    workspaceForm.name.isTouched
      ? NAME_CONFIG.REQUIRED_ERROR_MESSAGE
      : workspaceForm.name.invalid
        ? NAME_CONFIG.INVALID_ERROR_MESSAGE
        : ""}
  >
    <Input
      bind:value={workspaceForm.name.value}
      on:blur={() => {
        workspaceForm.name.isTouched = true;
        workspaceForm.name.value = workspaceForm.name.value.trim();
        if (
          workspaceForm.name.value &&
          !isValidWorkspaceName(workspaceForm.name.value)
        ) {
          workspaceForm.name.invalid = true;
        } else {
          workspaceForm.name.invalid = false;
        }
      }}
      height={"36px"}
      id={inputId}
      placeholder={NAME_CONFIG.PLACEHOLDER}
      class="text-fs-14 bg-tertiary-300 fw-normal px-2 border-radius-4"
      style="outline:none;"
      isError={(!workspaceForm.name.value.trim() &&
        workspaceForm.name.isTouched) ||
        workspaceForm.name.invalid}
      isEditIconRequired={false}
      type={"text"}
      placeholderColor={"var(--text-secondary-200)"}
    />
  </LabelField>
</div>
