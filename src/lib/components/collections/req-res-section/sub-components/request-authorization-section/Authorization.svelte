<script lang="ts">
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
    import { handleRequestStateChange } from "$lib/store/request-response-section";
    import { AuthType } from "$lib/utils/enums/authorization.enum";
    import type { NewTab } from "$lib/utils/interfaces/request.interface";
  import ApiKey from "./ApiKey.svelte";
  import BasicAuth from "./BasicAuth.svelte";
  import BearerToken from "./BearerToken.svelte";
  import NoAuth from "./NoAuth.svelte";
  export let currentTabId : string;
  export let requestData : NewTab;
  let currentTab: string;
  let tabId: string;
  let handleDropdown = (tab: string) => {
    currentTab = tab;
    handleRequestStateChange(currentTab,"auth", tabId);
  };

  $ : {
    if(requestData){
      tabId = currentTabId;
      currentTab = requestData.request.state.auth;
    }
  }

  $ : {
    if(currentTabId){
      tabId = currentTabId;
      currentTab = requestData.request.state.auth;
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
            data={[AuthType.NO_AUTH, AuthType.API_KEY, AuthType.BEARER_TOKEN, AuthType.BASIC_AUTH]}
            onclick={handleDropdown}
          />
        </p>
      </button>
    </div>
  </div>
  {#if currentTab === AuthType.NO_AUTH}
    <NoAuth />
  {:else if currentTab === AuthType.API_KEY}
    <ApiKey currentTabId = {currentTabId} apiData = {requestData.request.auth.apiKey} />
  {:else if currentTab === AuthType.BEARER_TOKEN}
    <BearerToken currentTabId = {currentTabId} bearerToken = {requestData.request.auth.bearerToken} />
  {:else if currentTab === AuthType.BASIC_AUTH}
    <BasicAuth currentTabId = {currentTabId} basicAuth = {requestData.request.auth.basicAuth} />
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
