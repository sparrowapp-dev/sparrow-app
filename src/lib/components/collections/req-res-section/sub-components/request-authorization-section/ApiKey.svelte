<script lang="ts">
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import { AuthSection } from "$lib/utils/enums/authorization.enum";
  import { RequestAuthProperty } from "$lib/utils/enums/request.enum";
  import { EnvironmentHeper } from "$lib/utils/helpers/environment.helper";
  import type { ApiKey } from "$lib/utils/interfaces/request.interface";
  import EnvironmentPicker from "../environment-picker/EnvironmentPicker.svelte";
  export let apiData: ApiKey;
  export let callback;
  export let environmentVariables;

  const environmentHelper = new EnvironmentHeper();
  const handleAuthChange = () => {
    callback(apiData, RequestAuthProperty.API_KEY);
  };

  const handleDropdown = (
    tab: AuthSection.HEADER | AuthSection.QUERY_PARAMETER,
  ) => {
    apiData.addTo = tab;
    callback(apiData, RequestAuthProperty.API_KEY);
  };
  let trackParanthesis: unknown[] = [];
  let trackCursor: number;
  let tempText = "";
  let focusedInput;

  let filterData = [];
  $: {
    if (trackCursor) {
      if (trackParanthesis.length === 2)
        filterData = environmentHelper.filterEnvironments(
          environmentVariables,
          tempText,
          trackParanthesis,
          trackCursor,
        );
    }
    if (trackParanthesis) {
      if (trackParanthesis.length === 2 && trackCursor)
        filterData = environmentHelper.filterEnvironments(
          environmentVariables,
          tempText,
          trackParanthesis,
          trackCursor,
        );
    }
  }
</script>

<div class="d-flex flex-column w-100 ps-1 pt-4 pe-1">
  <div
    class="d-flex align-items-center justify-content-between text-requestBodyColor mb-3"
    style="font-size: 12px; font-weight:500"
  >
    <p class="mb-0">Auth Key</p>

    <div class="position-relative w-75">
      <input
        type="text"
        style="outline: none;"
        class="w-100 bg-backgroundColor border-0 h-75 p-2"
        placeholder="Enter Auth Key"
        bind:value={apiData.authKey}
        on:input={() => {
          handleAuthChange();
          tempText = apiData.authKey;
          trackParanthesis = environmentHelper.balanceParanthesis(tempText);
        }}
        on:keyup={(e) => {
          trackCursor = e.target.selectionStart;
        }}
        on:blur={() => {
          setTimeout(() => {
            tempText = "";
            trackParanthesis = [];
            trackCursor = undefined;
            filterData = [];
          }, 300);
        }}
        on:focus={(e) => {
          tempText = apiData.authKey;
          focusedInput = "first";
          trackParanthesis = environmentHelper.balanceParanthesis(tempText);
        }}
      />
      {#if focusedInput === "first" && trackParanthesis.length === 2 && filterData.length > 0}
        <EnvironmentPicker
          {filterData}
          inputText={apiData.authKey}
          {trackCursor}
          {trackParanthesis}
          updateText={(text) => {
            apiData.authKey = text;
          }}
          handleInputValue={() => {
            handleAuthChange();
            trackParanthesis = [];
            trackCursor = undefined;
            filterData = [];
          }}
        />
      {/if}
    </div>
  </div>
  <div
    class="d-flex align-items-center justify-content-between text-requestBodyColor mb-3"
    style="font-size: 12px; font-weight:500"
  >
    <p class="mb-0">Auth Value</p>
    <div class="position-relative w-75">
      <input
        type="text"
        style="outline: none;"
        class="w-100 h-75 p-2 border-0 bg-backgroundColor"
        placeholder="Enter Auth Value"
        bind:value={apiData.authValue}
        on:input={() => {
          handleAuthChange();
          tempText = apiData.authValue;
          trackParanthesis = environmentHelper.balanceParanthesis(tempText);
        }}
        on:keyup={(e) => {
          trackCursor = e.target.selectionStart;
        }}
        on:blur={() => {
          setTimeout(() => {
            tempText = "";
            trackParanthesis = [];
            trackCursor = undefined;
            filterData = [];
          }, 300);
        }}
        on:focus={(e) => {
          tempText = apiData.authValue;
          focusedInput = "second";
          trackParanthesis = environmentHelper.balanceParanthesis(tempText);
        }}
      />
      {#if focusedInput === "second" && trackParanthesis.length === 2 && filterData.length > 0}
        <EnvironmentPicker
          {filterData}
          inputText={apiData.authValue}
          {trackCursor}
          {trackParanthesis}
          updateText={(text) => {
            apiData.authValue = text;
          }}
          handleInputValue={() => {
            handleAuthChange();
            trackParanthesis = [];
            trackCursor = undefined;
            filterData = [];
          }}
        />
      {/if}
    </div>
  </div>
  <div
    class="d-flex align-items-center justify-content-between text-requestBodyColor gap-4"
    style="font-size: 12px; font-weight:500"
  >
    <p>Add to</p>
    <div class="w-75 p-2">
      <button class="bg-backgroundColor border-0">
        <p class="">
          <Dropdown
            title={apiData.addTo}
            data={[
              {
                name: "Header",
                id: AuthSection.HEADER,
              },
              {
                name: "Query Parameter",
                id: AuthSection.QUERY_PARAMETER,
              },
            ]}
            onclick={handleDropdown}
          />
        </p>
      </button>
    </div>
  </div>
</div>

<style>
  input::placeholder {
    color: var(--button-color);
    font-weight: 500;
  }
</style>
