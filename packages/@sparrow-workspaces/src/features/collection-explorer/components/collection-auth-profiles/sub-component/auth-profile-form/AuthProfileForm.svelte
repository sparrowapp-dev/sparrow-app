<script lang="ts">
  /**
   * Components
   */
  import {
    ProfileName,
    ProfileDescription,
    ProfileActions,
    ProfileAuthSector,
  } from "../index";

  /**
   * Types
   */
  import type { ProfileForm } from "../../../../types";

  /**
   * Exports
   */
  export let onCreateProfile;
  export let onUpdateProfile = null;
  export let handleModalState;
  export let profileData = null;
  export let isEditMode = false;

  /**
   * data
   */
  let profileForm: ProfileForm = {
    name: {
      value: "",
      isTouched: false,
      invalid: false,
    },
    description: {
      value: "",
      isTouched: false,
      invalid: false,
    },
    authType: {
      value: "select",
      isTouched: false,
      invalid: false,
    },
    defaultKey: false,
    auth: {
      isTouched: false,
      invalid: false,
      invalidAuthType: "None",
      values: {
        bearerToken: "",
        basicAuth: {
          username: "",
          password: "",
        },
        apiKey: {
          authKey: "",
          authValue: "",
          addTo: "Header",
        },
      },
    },
  };

  // Methods
  const populateFormData = (data) => {
    if (!data) return;

    profileForm.name.value = data.name || "";
    profileForm.description.value = data.description || "";
    profileForm.authType.value = data.authType || "select";
    profileForm.authId = data.authId;
    profileForm.defaultKey = data.defaultKey;

    if (data.auth) {
      profileForm.auth.values = {
        bearerToken: data.auth.bearerToken || "",
        basicAuth: {
          username: data.auth.basicAuth?.username || "",
          password: data.auth.basicAuth?.password || "",
        },
        apiKey: {
          authKey: data.auth.apiKey?.authKey || "",
          authValue: data.auth.apiKey?.authValue || "",
          addTo: data.auth.apiKey?.addTo || "Header",
        },
      };
    }
  };

  const resetForm = () => {
    profileForm = {
      name: {
        value: "",
        isTouched: false,
        invalid: false,
      },
      description: {
        value: "",
        isTouched: false,
        invalid: false,
      },
      authType: {
        value: "select",
        isTouched: false,
        invalid: false,
      },
      defaultKey: false,
      auth: {
        isTouched: false,
        invalid: false,
        invalidAuthType: "None",
        values: {
          bearerToken: "",
          basicAuth: {
            username: "",
            password: "",
          },
          apiKey: {
            authKey: "",
            authValue: "",
            addTo: "Header",
          },
        },
      },
    };
  };

  $: {
    if (isEditMode && profileData) {
      populateFormData(profileData);
    } else if (!isEditMode) {
      resetForm();
    }
  }
</script>

<section>
  <ProfileName bind:profileForm />
  <ProfileDescription bind:profileForm />
  <ProfileAuthSector bind:profileForm />
  <ProfileActions
    bind:profileForm
    {isEditMode}
    {onCreateProfile}
    {onUpdateProfile}
    {handleModalState}
  />
</section>
