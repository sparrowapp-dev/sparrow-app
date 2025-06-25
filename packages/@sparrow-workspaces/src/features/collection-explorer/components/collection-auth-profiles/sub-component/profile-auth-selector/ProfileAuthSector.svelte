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

  const onUpdateRequestState = async (
    selectedRequestStateId: CollectionAuthTypeBaseEnum,
  ) => {
    profileForm.authType.value = selectedRequestStateId;
  };
  const onUpdateRequestAuth = async (updatedAuthData) => {
    // const updatedAuthType = updatedAuthData;
    // console.log("changing auth values :>> ", updatedAuthType);
    profileForm.auth.values = {
      ...profileForm.auth.values,
      ...updatedAuthData,
    };
  };

  //   onMount(() => {
  //     setTimeout(() => {
  //       const selectElement = document.getElementById(
  //         "color-select-auth-profile-selection",
  //       );
  //       console.log("came 0", selectElement);
  //       if (selectElement) {
  //         // Listen for clicks on the select element to detect when dropdown opens
  //         selectElement.addEventListener("click", () => {
  //           dropdownOpened = true;
  //           showErrors = false;
  //         });

  //         // Listen for clicks outside the select element to detect when dropdown closes
  //         const handleClickOutside = (event) => {
  //           console.log("camer 1");
  //           if (!selectElement.contains(event.target)) {
  //             console.log("camer 2");
  //             // If dropdown was opened and user clicked outside without selecting
  //             if (dropdownOpened && selectedAuth === defaultAuth) {
  //               showErrors = true;
  //               hasInteracted = true;
  //             }
  //             dropdownOpened = false;
  //           }
  //         };

  //         document.addEventListener("click", handleClickOutside);

  //         // Cleanup event listener
  //         return () => {
  //           document.removeEventListener("click", handleClickOutside);
  //         };
  //       }
  //     }, 2);
  //   });
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
        isError={showErrors && selectedAuth === defaultAuth && hasInteracted}
      />
      {#if showErrors && selectedAuth === defaultAuth && hasInteracted}
        <p class="error-text sparrow-fs-12 m-0">Auth cannot be empty.</p>
      {/if}
    </LabelField>
  </div>
  <p
    class="text-fs-12 fw-normal mb-2"
    style="color: var(--text-ds-neutral-400); max-width:500px;"
  >
    This authorization will set for every requests in this collection and can be
    modified within specified request.
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
