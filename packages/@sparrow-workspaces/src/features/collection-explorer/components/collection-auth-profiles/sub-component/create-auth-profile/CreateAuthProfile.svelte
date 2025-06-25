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
  export let handleModalState;

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

  $: console.log("updated Profile form :>> ", profileForm);
</script>

<section>
  <ProfileName bind:profileForm />
  <ProfileDescription bind:profileForm />
  <ProfileAuthSector bind:profileForm />
  <ProfileActions bind:profileForm {onCreateProfile} {handleModalState} />
</section>
