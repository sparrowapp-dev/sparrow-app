<script lang="ts">
  import { ApiKey, BasicAuth, BearerToken, NoAuth } from "./sub-auth/index";
  import { WithSelect } from "@sparrow/workspaces/hoc";
  import type { HttpRequestCollectionLevelAuthTabInterface } from "@sparrow/common/types/workspace";
  import { CollectionAuthTypeBaseEnum } from "@sparrow/common/types/workspace/collection-base";
  import { HttpRequestAuthTypeBaseEnum } from "@sparrow/common/types/workspace/http-request-base";
  import { Button } from "@sparrow/library/ui";
  import { OpenRegular } from "@sparrow/library/icons";

  export let auth;
  export let environmentVariables;
  export let requestStateAuth;
  export let onUpdateRequestAuth = () => {};
  export let onUpdateRequestState = () => {};
  export let onUpdateEnvironment = () => {};
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
                id: HttpRequestAuthTypeBaseEnum.NO_AUTH,
              },
              {
                name: "API Key",
                id: HttpRequestAuthTypeBaseEnum.API_KEY,
              },
              {
                name: "Bearer Token",
                id: HttpRequestAuthTypeBaseEnum.BEARER_TOKEN,
              },
              {
                name: "Basic Auth",
                id: HttpRequestAuthTypeBaseEnum.BASIC_AUTH,
              },
            ]}
            zIndex={499}
            titleId={requestStateAuth?.requestAuthNavigation ??
              HttpRequestAuthTypeBaseEnum.NO_AUTH}
            onclick={(id = "") => {}}
            disabled={false}
          />
        </p>
      </span>
    </div>
  </div>
  <div>
    <p class="text-fs-12 fw-normal" style="color:var(--text-ds-neutral-400)">
      The auth header will be automatically generated when you send the request.
    </p>
  </div>
  <section class="w-100" style="flex:1; overflow:auto;">
    {#if requestStateAuth === HttpRequestAuthTypeBaseEnum.NO_AUTH}
      <NoAuth />
    {:else if requestStateAuth === HttpRequestAuthTypeBaseEnum.API_KEY}
      <ApiKey
        apiData={auth.apiKey}
        callback={onUpdateRequestAuth}
        {environmentVariables}
        {onUpdateEnvironment}
      />
    {:else if requestStateAuth === HttpRequestAuthTypeBaseEnum.BEARER_TOKEN}
      <BearerToken
        bearerToken={auth.bearerToken}
        callback={onUpdateRequestAuth}
        {environmentVariables}
        {onUpdateEnvironment}
      />
    {:else if requestStateAuth === HttpRequestAuthTypeBaseEnum.BASIC_AUTH}
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
