<script lang="ts">
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import { AuthType } from "$lib/utils/enums/authorization.enum";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import ApiKey from "./ApiKey.svelte";
  import BasicAuth from "./BasicAuth.svelte";
  import BearerToken from "./BearerToken.svelte";
  import NoAuth from "./NoAuth.svelte";

  export let request;
  export let collectionsMethods: CollectionsMethods;
  export let environmentVariables;

  let currentTab: string;

  let handleDropdown = (tab: string) => {
    collectionsMethods.updateRequestState(tab, "auth");
  };

  $: {
    if (request) {
      currentTab = request.state.auth;
    }
  }
</script>

<div class="mt-4 pb-0 ps-1 pe-1 w-100">
  <div
    class="col-12 d-flex align-items-center"
    style="font-size: 12px;font-weight:500;border-bottom:1px solid var(--border-color)"
  >
    <div class="col-2">
      <p class="text-requestBodyColor ps-1">Auth Type</p>
    </div>
    <div class="col-10">
      <button class="d-flex bg-backgroundColor border-0">
        <p>
          <Dropdown
            dropDownType={{ type: "text", title: currentTab }}
            data={[
              {
                name: "No Auth",
                id: AuthType.NO_AUTH,
                dynamicClasses: "text-whiteColor",
              },
              {
                name: "API Key",
                id: AuthType.API_KEY,
                dynamicClasses: "text-whiteColor",
              },
              {
                name: "Bearer Token",
                id: AuthType.BEARER_TOKEN,
                dynamicClasses: "text-whiteColor",
              },
              {
                name: "Basic Auth",
                id: AuthType.BASIC_AUTH,
                dynamicClasses: "text-whiteColor",
              },
            ]}
            onclick={handleDropdown}
          />
        </p>
      </button>
    </div>
  </div>
  {#if currentTab === AuthType.NO_AUTH}
    <NoAuth />
  {:else if currentTab === AuthType.API_KEY}
    <ApiKey
      apiData={request.auth.apiKey}
      callback={collectionsMethods.updateRequestAuth}
      {environmentVariables}
    />
  {:else if currentTab === AuthType.BEARER_TOKEN}
    <BearerToken
      bearerToken={request.auth.bearerToken}
      callback={collectionsMethods.updateRequestAuth}
      {environmentVariables}
    />
  {:else if currentTab === AuthType.BASIC_AUTH}
    <BasicAuth
      basicAuth={request.auth.basicAuth}
      callback={collectionsMethods.updateRequestAuth}
      {environmentVariables}
    />
  {/if}
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
