<script lang="ts">
  /**
   * Components
   */
  import { Input, LabelField } from "@sparrow/library/forms";

  /**
   * Types
   */
  import type { ProfileForm } from "../../../../types";

  /**
   * Constants
   */
  import { NAME_CONFIG } from "../../../../constants";

  /**
   * Exports
   */
  export let profileForm: ProfileForm;

  /**
   * Data
   */
  const inputId: string = "team-name-input";

  const isOnlySpecialCharacters = (profileForm: string) => {
    // This regex checks if the string contains ONLY non-alphanumeric characters
    return /^[^a-zA-Z0-9]+$/.test(profileForm);
  };
</script>

<div class="pb-2 mt-1">
  <!-- 
    -- Input with Label Text
  -->
  <LabelField
    inputLabelId={inputId}
    inputValueRequired={true}
    headerLabelText={NAME_CONFIG.TITLE}
    helpLabel={true}
    isError={(!profileForm.name.value && profileForm.name.isTouched) ||
      profileForm.name.invalid}
    errorMessage={profileForm.name.invalid
      ? NAME_CONFIG.INVALID_ERROR_MESSAGE
      : NAME_CONFIG.REQUIRED_ERROR_MESSAGE}
  >
    <Input
      bind:value={profileForm.name.value}
      on:blur={() => {
        profileForm.name.isTouched = true;
        profileForm.name.value = profileForm.name.value.trim(); // Trim the value on blur
        if (isOnlySpecialCharacters(profileForm.name.value)) {
          profileForm.name.invalid = true;
        } else {
          profileForm.name.invalid = false;
        }
      }}
      height={"36px"}
      id={inputId}
      placeholder={NAME_CONFIG.PLACEHOLDER}
      class="text-ds-font-size-14 bg-tertiary-300 px-2 border-radius-4 text-ds-font-weight-regular text-ds-line-height-143"
      style="outline:none;"
      isError={!profileForm.name.value && profileForm.name.isTouched}
      isEditIconRequired={false}
      type={"text"}
      maxlength={NAME_CONFIG.MAX_TEXT_SIZE}
      placeholderColor={"var(--text-secondary-200)"}
    />
  </LabelField>
</div>
