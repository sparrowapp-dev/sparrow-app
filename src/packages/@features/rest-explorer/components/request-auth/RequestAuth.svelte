<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Select } from "$lib/components/inputs";
  import { AuthType } from "$lib/utils/enums/authorization.enum";
  import { ApiKey, BasicAuth, BearerToken, NoAuth } from "./sub-auth";

  export let auth;
  export let environmentVariables = [];
  export let requestStateAuth: string;
  export let onUpdateRequestAuth;

  const dispatch = createEventDispatcher();
</script>

<div class="pb-3 pt-3 ps-1 pe-1 w-100 h-100">
  <div
    class="col-12 d-flex align-items-center"
    style="font-size: 12px; font-weight:500;border-bottom:1px solid var(--border-color)"
  >
    <div class="col-2">
      <p class="text-requestBodyColor ps-1">Auth Type</p>
    </div>
    <div class="col-10">
      <button class="d-flex bg-backgroundColor border-0">
        <p>
          <Select
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
              dispatch("change", id);
            }}
            headerTheme={"transparent"}
            borderType={"none"}
            borderActiveType={"bottom"}
            borderHighlight={"hover-active"}
            headerHighlight={"active"}
            minBodyWidth={"150px"}
            borderRounded={false}
            menuItem={"v2"}
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
        apiData={$auth.apiKey}
        callback={onUpdateRequestAuth}
        {environmentVariables}
      />
    {:else if requestStateAuth === AuthType.BEARER_TOKEN}
      <BearerToken
        bearerToken={$auth.bearerToken}
        callback={onUpdateRequestAuth}
        {environmentVariables}
      />
    {:else if requestStateAuth === AuthType.BASIC_AUTH}
      <BasicAuth
        basicAuth={$auth.basicAuth}
        callback={onUpdateRequestAuth}
        {environmentVariables}
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
