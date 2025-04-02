<script lang="ts">
  import { GraphqlRequestAuthModeBaseEnum } from "@sparrow/common/types/workspace/graphql-request-base";
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
  <div class="pb-2" style="font-size: 12px; font-weight:500;">
    <div class="">
      <span class="d-flex">
        <p class="mb-0">
          <WithSelect
            id={"hash999"}
            data={[
              {
                name: "No Auth",
                id: GraphqlRequestAuthModeBaseEnum.NO_AUTH,
              },
              {
                name: "API Key",
                id: GraphqlRequestAuthModeBaseEnum.API_KEY,
              },
              {
                name: "Bearer Token",
                id: GraphqlRequestAuthModeBaseEnum.BEARER_TOKEN,
              },
              {
                name: "Basic Auth",
                id: GraphqlRequestAuthModeBaseEnum.BASIC_AUTH,
              },
            ]}
            zIndex={499}
            titleId={requestStateAuth}
            onclick={(id = "") => {
              onUpdateRequestState({ requestAuthNavigation: id });
            }}
            disabled={false}
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
    {#if requestStateAuth === GraphqlRequestAuthModeBaseEnum.NO_AUTH}
      <NoAuth />
    {:else if requestStateAuth === GraphqlRequestAuthModeBaseEnum.API_KEY}
      <ApiKey
        apiData={auth.apiKey}
        callback={onUpdateRequestAuth}
        {environmentVariables}
        {onUpdateEnvironment}
      />
    {:else if requestStateAuth === GraphqlRequestAuthModeBaseEnum.BEARER_TOKEN}
      <BearerToken
        bearerToken={auth.bearerToken}
        callback={onUpdateRequestAuth}
        {environmentVariables}
        {onUpdateEnvironment}
      />
    {:else if requestStateAuth === GraphqlRequestAuthModeBaseEnum.BASIC_AUTH}
      <BasicAuth
        basicAuth={auth.basicAuth}
        callback={onUpdateRequestAuth}
        {environmentVariables}
        {onUpdateEnvironment}
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
</style>
