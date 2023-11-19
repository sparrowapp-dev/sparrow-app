<script lang="ts">
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
    import { handleRequestStateChange } from "$lib/store/request-response-section";
    import { AuthType } from "$lib/utils/enums/authorization.enum";
    import type { NewTab } from "$lib/utils/interfaces/request.interface";
  import ApiKey from "./ApiKey.svelte";
    import { AuthorizationViewModel } from "./Authorization.ViewModel";
  import BasicAuth from "./BasicAuth.svelte";
  import BearerToken from "./BearerToken.svelte";
  import NoAuth from "./NoAuth.svelte";
  export let request;
  let currentTab: string;
  const _viewModel = new AuthorizationViewModel(); 
  let handleDropdown = (tab: string) => {
    _viewModel.updateRequestState(tab, "auth");
  };

  $ : {
    if(request){
      currentTab = request.state.auth;
    }
  }
</script>

<div class="mt-4 pb-0 ps-1 pe-1 w-100">
  <div
    class="d-flex align-items-center gap-4"
    style="font-size: 12px;font-weight:500;border-bottom:1px solid var(--border-color)"
  >
    <div>
      <p class="text-requestBodyColor ps-1">Auth Type</p>
    </div>
    <div class="ps-5">
      <button class="d-flex bg-backgroundColor border-0">
        <p>
          <Dropdown title= {currentTab}
            data={[
              {
                name: "No Auth",
                id: AuthType.NO_AUTH
              },
              {
                name: "API Key",
                id: AuthType.API_KEY
              },
              {
                name: "Bearer Token",
                id: AuthType.BEARER_TOKEN
              },
              {
                name: "Basic Auth",
                id: AuthType.BASIC_AUTH
              }
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
    <ApiKey  apiData = {request.auth.apiKey} callback={_viewModel.updateRequestAuth} />
  {:else if currentTab === AuthType.BEARER_TOKEN}
    <BearerToken  bearerToken = {request.auth.bearerToken} callback={_viewModel.updateRequestAuth}/>
  {:else if currentTab === AuthType.BASIC_AUTH}
    <BasicAuth  basicAuth = {request.auth.basicAuth} callback={_viewModel.updateRequestAuth}/>
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
