<script lang="ts">
  import { AuthType } from "@sparrow/common/enums/authorization.enum";
  import { ApiKey, BasicAuth, BearerToken, NoAuth } from "./sub-auth";
  import { WithSelect } from "@sparrow/workspaces/hoc";
  import type { HttpRequestCollectionLevelAuthTabInterface } from "@sparrow/common/types/workspace";
  import { CollectionAuthTypeBaseEnum } from "@sparrow/common/types/workspace/collection-base";

  export let auth;
  export let environmentVariables;
  export let requestStateAuth;
  export let onUpdateRequestAuth;
  export let onUpdateRequestState;
  export let onUpdateEnvironment;
  export let collectionAuth: HttpRequestCollectionLevelAuthTabInterface;
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
                id: AuthType.NO_AUTH,
              },
              {
                name: "Inherit Auth",
                id: AuthType.INHERIT_AUTH,
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
    <p class="text-secondary-300 text-fs-12 fw-normal">
      The auth header will be automatically generated when you send the request.
    </p>
  </div>
  <section class="w-100" style="flex:1; overflow:auto;">
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
    {:else if requestStateAuth === AuthType.INHERIT_AUTH}
      {#if collectionAuth.collectionAuthNavigation === CollectionAuthTypeBaseEnum.NO_AUTH}
        <p class="text-fs-16">No Auth</p>
        <NoAuth />
      {:else if collectionAuth.collectionAuthNavigation === CollectionAuthTypeBaseEnum.API_KEY}
        <p class="text-fs-16">API Key</p>
        <ApiKey
          apiData={collectionAuth.auth.apiKey}
          callback={() => {}}
          {environmentVariables}
          {onUpdateEnvironment}
          disabled={true}
        />
      {:else if collectionAuth.collectionAuthNavigation === CollectionAuthTypeBaseEnum.BEARER_TOKEN}
        <p class="text-fs-16">Bearer Token</p>
        <BearerToken
          bearerToken={collectionAuth.auth.bearerToken}
          callback={() => {}}
          {environmentVariables}
          {onUpdateEnvironment}
          disabled={true}
        />
      {:else if collectionAuth.collectionAuthNavigation === CollectionAuthTypeBaseEnum.BASIC_AUTH}
        <p class="text-fs-16">Basic Auth</p>
        <BasicAuth
          basicAuth={collectionAuth.auth.basicAuth}
          callback={() => {}}
          {environmentVariables}
          {onUpdateEnvironment}
          disabled={true}
        />
      {/if}
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
