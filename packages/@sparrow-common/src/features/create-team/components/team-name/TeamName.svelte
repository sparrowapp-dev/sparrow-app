<script lang="ts">
  /**
   * Components
   */
  import { Input, LabelField } from "@sparrow/library/forms";

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

  const isValidHubName = (name: string) => {
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
    isError={(!teamForm.name.value && teamForm.name.isTouched) ||
      teamForm.name.invalid}
    errorMessage={!teamForm.name.value && teamForm.name.isTouched
      ? NAME_CONFIG.REQUIRED_ERROR_MESSAGE
      : teamForm.name.invalid
        ? NAME_CONFIG.INVALID_ERROR_MESSAGE
        : ""}
  >
    <Input
      bind:value={teamForm.name.value}
      on:blur={() => {
        teamForm.name.isTouched = true;
        teamForm.name.value = teamForm.name.value.trim();
        if (teamForm.name.value && !isValidHubName(teamForm.name.value)) {
          teamForm.name.invalid = true;
        } else {
          teamForm.name.invalid = false;
        }
      }}
      height={"36px"}
      id={inputId}
      placeholder={NAME_CONFIG.PLACEHOLDER}
      class="text-ds-font-size-14 bg-tertiary-300 px-2 border-radius-4 text-ds-font-weight-regular text-ds-line-height-143"
      style="outline:none;"
      isError={(!teamForm.name.value && teamForm.name.isTouched) ||
        teamForm.name.invalid}
      isEditIconRequired={false}
      type={"text"}
      maxlength={NAME_CONFIG.MAX_TEXT_SIZE}
      placeholderColor={"var(--text-secondary-200)"}
    />
  </LabelField>
</div>
