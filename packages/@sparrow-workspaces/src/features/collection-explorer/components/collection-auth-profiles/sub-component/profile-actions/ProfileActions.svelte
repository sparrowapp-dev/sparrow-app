<script lang="ts">
  /**
   * Components
   */
  import { Button, notifications } from "@sparrow/library/ui";

  /**
   * Types
   */
  import type { ProfileForm } from "../../../../types";

  /**
   * Exports
   */
  export let profileForm: ProfileForm;
  export let onCreateProfile: (data: any) => Promise<any>;
  export let onUpdateProfile:
    | ((authId: string, data: any) => Promise<any>)
    | null = null;
  export let handleModalState: (flag: boolean) => void;
  export let isEditMode = false;
  export let authId: string | null = null;

  /**
   * Data
   */
  let isFormSubmitting: boolean = false;

  // Methods
  const validateForm = () => {
    profileForm.name.isTouched = true;
    profileForm.description.isTouched = true;
    profileForm.authType.isTouched = true;
    profileForm.auth.isTouched = true;

    if (!profileForm.name.value || profileForm.name.invalid) return false;
    if (profileForm.authType.value === "select") return false;

    // Validate auth fields based on auth type
    if (profileForm.authType.value === "Bearer Token") {
      if (!profileForm.auth.values.bearerToken) return false;
    } else if (profileForm.authType.value === "Basic Auth") {
      if (
        !profileForm.auth.values.basicAuth.username ||
        !profileForm.auth.values.basicAuth.password
      )
        return false;
    } else if (profileForm.authType.value === "API Key") {
      if (
        !profileForm.auth.values.apiKey.authKey ||
        !profileForm.auth.values.apiKey.authValue
      )
        return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    isFormSubmitting = true;

    const profileData = {
      name: profileForm.name.value,
      description: profileForm.description.value,
      authType: profileForm.authType.value,
      auth: profileForm.auth.values,
      defaultKey: false,
    };

    console.log("submitting :>> ", profileForm);

    let response;
    if (isEditMode && onUpdateProfile && authId) {
      response = await onUpdateProfile(authId, profileData);
    } else if (!isEditMode && onCreateProfile) {
      response = await onCreateProfile(profileData);
    }

    isFormSubmitting = false;

    if (response?.isSuccessful) {
      handleModalState(false);
    } else {
      if (response?.message?.includes("unique name")) {
        profileForm.name.invalid = true;
      } else {
        notifications.error(
          response?.message
            ? response.message
            : "Something went wrong, please try again!",
        );
      }
    }
  };
</script>

<div class="sparrow-modal-footer d-flex justify-content-end mt-3">
  <!-- Cancel Button -->
  <Button
    disable={isFormSubmitting}
    title={`Cancel`}
    type="secondary"
    buttonClassProp={`me-2`}
    onClick={() => {
      handleModalState(false);
    }}
  />

  <!-- Submit Button -->
  <Button
    title={isEditMode ? "Update Profile" : "Add Profile"}
    type="primary"
    disable={isFormSubmitting}
    loader={isFormSubmitting}
    buttonClassProp="me-1"
    onClick={handleSubmit}
  />
</div>
