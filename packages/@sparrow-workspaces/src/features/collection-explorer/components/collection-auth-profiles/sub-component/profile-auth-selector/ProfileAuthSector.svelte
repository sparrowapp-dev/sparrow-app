<script lang="ts">
  import { CollectionAuthTypeBaseEnum } from "@sparrow/common/types/workspace/collection-base";
  import { ApiKey, BasicAuth, BearerToken, NoAuth } from "../sub-auth";
  import { LabelField, Select } from "@sparrow/library/forms";
  import { onMount } from "svelte";

  export let profileForm;

  let auth;
  let requestStateAuth;
  const inputId: string = "auth-type-input";
  const defaultAuth: string = "select";
  let selectedAuth: string = defaultAuth;
  let showErrors: boolean = false;
  let dropdownOpened: boolean = false;
  let hasInteracted: boolean = false;

  $: auth = profileForm.auth.values;
  $: requestStateAuth = profileForm.authType.value;
  $: showErrors = profileForm.auth.invalid || profileForm.authType.invalid;

  const onUpdateRequestState = async (
    selectedRequestStateId: CollectionAuthTypeBaseEnum,
  ) => {
    profileForm.authType.value = selectedRequestStateId;
    // if (showErrors) {
    profileForm.authType.invalid = false;
    showErrors = false;
    // }
  };
  const onUpdateRequestAuth = async (updatedAuthData) => {
    profileForm.auth.values = {
      ...profileForm.auth.values,
      ...updatedAuthData,
    };
    // if (showErrors) {
    profileForm.auth.invalid = false;
    showErrors = false;
    // }
  };
</script>

<div class="d-flex flex-column w-100 h-100">
  <div class="pb-2" style="font-size: 12px; font-weight:500;">
    <LabelField
      inputLabelId={inputId}
      inputValueRequired={true}
      headerLabelText={"Auth Type"}
      helpLabel={false}
    >
      <Select
        id={"auth-profile-selection"}
        data={[
          {
            name: "Select",
            id: defaultAuth,
            hide: true,
          },
          {
            name: "No Auth",
            id: CollectionAuthTypeBaseEnum.NO_AUTH,
            hide: true,
            disabled: true,
          },
          {
            name: "API Key",
            id: CollectionAuthTypeBaseEnum.API_KEY,
          },
          {
            name: "Bearer Token",
            id: CollectionAuthTypeBaseEnum.BEARER_TOKEN,
          },
          {
            name: "Basic Auth",
            id: CollectionAuthTypeBaseEnum.BASIC_AUTH,
          },
        ]}
        zIndex={499}
        titleId={requestStateAuth}
        onclick={(id = "") => {
          selectedAuth = id;
          hasInteracted = true;
          dropdownOpened = false;

          // If user selected a valid option, hide errors
          if (id !== defaultAuth) {
            showErrors = false;
          }
          onUpdateRequestState(id);
        }}
        disabled={false}
        position={"absolute"}
        menuItem={"v2"}
        variant={"tertiary"}
        minHeaderWidth={"100%"}
        size={"medium"}
        isError={showErrors}
      />
      <!-- isError={showErrors && selectedAuth === defaultAuth && hasInteracted} -->
      <!-- {#if showErrors && selectedAuth === defaultAuth && hasInteracted} -->
      {#if showErrors}
        <p class="error-text sparrow-fs-12 m-0">
          Please select a valid auth type and fill in the details properly.
        </p>
      {/if}
    </LabelField>
  </div>
  <p
    class="text-fs-12 fw-normal mb-2"
    style="color: var(--text-ds-neutral-400); max-width:500px;"
  >
    This authorization can be assigned to any request in this collection and
    managed from the Auth Profiles tab.
  </p>
  <section class="w-100" style="flex:1; overflow:auto;">
    {#if requestStateAuth === CollectionAuthTypeBaseEnum.NO_AUTH}
      <NoAuth />
    {:else if requestStateAuth === CollectionAuthTypeBaseEnum.API_KEY}
      <ApiKey
        apiData={auth.apiKey}
        callback={onUpdateRequestAuth}
        environmentVariables={[]}
        onUpdateEnvironment={() => {}}
      />
    {:else if requestStateAuth === CollectionAuthTypeBaseEnum.BEARER_TOKEN}
      <BearerToken
        bearerToken={auth.bearerToken}
        callback={onUpdateRequestAuth}
        environmentVariables={[]}
        onUpdateEnvironment={() => {}}
      />
    {:else if requestStateAuth === CollectionAuthTypeBaseEnum.BASIC_AUTH}
      <BasicAuth
        basicAuth={auth.basicAuth}
        callback={onUpdateRequestAuth}
        environmentVariables={[]}
        onUpdateEnvironment={() => {}}
      />
    {/if}
  </section>
</div>

<style>
  button:hover {
    border-bottom: 2px solid red; /* Replace 'yourColor' with the desired color */
  }

  /* Add a border bottom when the button is pressed (active) */
  button:active {
    border-bottom: 2px solid red; /* Replace 'yourColor' with the desired color */
  }

  .error-text {
    color: var(--text-danger-200);
  }
</style>
