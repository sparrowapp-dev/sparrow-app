<script lang="ts">
  import { HttpRequestSavedAuthModeBaseEnum } from "@sparrow/common/types/workspace/http-request-saved-base";
  import { ApiKey, BasicAuth, BearerToken, NoAuth } from "./sub-auth";
  import { WithSelect } from "@sparrow/workspaces/hoc";

  export let auth;
  export let environmentVariables;
  export let requestStateAuth;
  export let onUpdateRequestAuth;
  export let onUpdateRequestState;
  export let onUpdateEnvironment;
</script>

<div class="d-flex flex-column w-100 h-100">
  <div class="pb-2 text-ds-font-size-12 text-ds-font-weight-medium">
    <div class="">
      <span class="d-flex">
        <p class="mb-0">
          <WithSelect
            id={"hash999"}
            data={[
              {
                name: "No Auth",
                id: HttpRequestSavedAuthModeBaseEnum.NO_AUTH,
              },
              {
                name: "Inherit Auth",
                id: HttpRequestSavedAuthModeBaseEnum.INHERIT_AUTH,
              },
              {
                name: "API Key",
                id: HttpRequestSavedAuthModeBaseEnum.API_KEY,
              },
              {
                name: "Bearer Token",
                id: HttpRequestSavedAuthModeBaseEnum.BEARER_TOKEN,
              },
              {
                name: "Basic Auth",
                id: HttpRequestSavedAuthModeBaseEnum.BASIC_AUTH,
              },
            ]}
            zIndex={499}
            titleId={requestStateAuth}
            onclick={(id = "") => {
              onUpdateRequestState({ requestAuthNavigation: id });
            }}
            disabled={true}
          />
        </p>
      </span>
    </div>
  </div>
  <div>
    <p
      class="text-secondary-300 text-ds-font-size-12 text-ds-font-weight-regular"
    >
      The auth header will be automatically generated when you send the request.
    </p>
  </div>
  <section class="w-100" style="flex:1; overflow:auto;">
    {#if requestStateAuth === HttpRequestSavedAuthModeBaseEnum.NO_AUTH}
      <NoAuth />
    {:else if requestStateAuth === HttpRequestSavedAuthModeBaseEnum.API_KEY}
      <ApiKey
        apiData={auth.apiKey}
        callback={onUpdateRequestAuth}
        {environmentVariables}
        {onUpdateEnvironment}
      />
    {:else if requestStateAuth === HttpRequestSavedAuthModeBaseEnum.BEARER_TOKEN}
      <BearerToken
        bearerToken={auth.bearerToken}
        callback={onUpdateRequestAuth}
        {environmentVariables}
        {onUpdateEnvironment}
      />
    {:else if requestStateAuth === HttpRequestSavedAuthModeBaseEnum.BASIC_AUTH}
      <BasicAuth
        basicAuth={auth.basicAuth}
        callback={onUpdateRequestAuth}
        {environmentVariables}
        {onUpdateEnvironment}
      />
    {:else if requestStateAuth === HttpRequestSavedAuthModeBaseEnum.INHERIT_AUTH}
      <p class="text-ds-font-size-12">
        Inherit Auth can't be shown on saved response, click "try" button to see
        the Inherit Auth.
      </p>
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
</style>
