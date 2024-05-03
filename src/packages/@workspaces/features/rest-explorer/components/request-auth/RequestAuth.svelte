<script lang="ts">
  import { Select } from "$lib/components/inputs";
  import { AuthType } from "$lib/utils/enums/authorization.enum";
  import { ApiKey, BasicAuth, BearerToken, NoAuth } from "./sub-auth";
  import { WithSelect } from "@workspaces/common/hoc";

  export let auth;
  export let environmentVariables = [];
  export let requestStateAuth;
  export let onUpdateRequestAuth;
  export let onUpdateRequestState;
  export let onUpdateEnvironment;
</script>

<div class="pb-3 pt-3 ps-1 pe-1 w-100 h-100">
  <div class="pb-2" style="font-size: 12px; font-weight:500;">
    <div class="">
      <button class="d-flex bg-backgroundColor border-0">
        <p class="mb-0">
          <WithSelect
            wrappedComponent={Select}
            id={"hash999"}
            data={[
              {
                name: "No Auth",
                id: AuthType.NO_AUTH,
              },
              {
                name: "API Key",
                id: AuthType.API_KEY,
              },
              {
                name: "Bearer Token",
                id: AuthType.BEARER_TOKEN,
              },
              {
                name: "Basic Auth",
                id: AuthType.BASIC_AUTH,
              },
            ]}
            titleId={requestStateAuth}
            onclick={(id) => {
              onUpdateRequestState({ requestAuthNavigation: id });
            }}
          />
        </p>
      </button>
    </div>
  </div>
  <section class="w-100" style="height: calc(100% - 80px); overflow-y: scroll;">
    {#if requestStateAuth === AuthType.NO_AUTH}
      <NoAuth />
    {:else if requestStateAuth === AuthType.API_KEY}
      <ApiKey
        apiData={auth.apiKey}
        callback={onUpdateRequestAuth}
        {environmentVariables}
        {onUpdateEnvironment}
      />
    {:else if requestStateAuth === AuthType.BEARER_TOKEN}
      <BearerToken
        bearerToken={auth.bearerToken}
        callback={onUpdateRequestAuth}
        {environmentVariables}
        {onUpdateEnvironment}
      />
    {:else if requestStateAuth === AuthType.BASIC_AUTH}
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
