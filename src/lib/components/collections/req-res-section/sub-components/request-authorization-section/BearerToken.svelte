<script lang="ts">
  import { RequestAuthProperty } from "$lib/utils/enums/request.enum";
  import { EnvironmentHeper } from "$lib/utils/helpers/environment.helper";
  import EnvironmentPicker from "../environment-picker/EnvironmentPicker.svelte";

  export let bearerToken: string;
  export let callback;
  export let environmentVariables;
  const environmentHelper = new EnvironmentHeper();
  const handleInput = () => {
    callback(bearerToken, RequestAuthProperty.BEARER_TOKEN);
  };

  let trackParanthesis: unknown[] = [];
  let trackCursor: number;
  let tempText = "";

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
    class="d-flex justify-content-between text-requestBodyColor mb-3"
    style="font-size: 12px; font-weight:500"
  >
    <p class="mb-0">Token</p>
    <div class="position-relative w-75">
      <textarea
        style="outline: none;"
        class="w-100 bg-backgroundColor border-0 ps-2"
        placeholder="Enter Token"
        bind:value={bearerToken}
        on:input={() => {
          handleInput();
          tempText = bearerToken;
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
          tempText = bearerToken;
          trackParanthesis = environmentHelper.balanceParanthesis(tempText);
        }}
      />
      {#if trackParanthesis.length === 2 && filterData.length > 0}
        <EnvironmentPicker
          {filterData}
          inputText={bearerToken}
          {trackCursor}
          {trackParanthesis}
          updateText={(text) => {
            bearerToken = text;
          }}
          handleInputValue={() => {
            handleInput();
            trackParanthesis = [];
            trackCursor = undefined;
            filterData = [];
          }}
        />
      {/if}
    </div>
  </div>
</div>

<style>
  input::placeholder {
    color: var(--button-color);
    font-weight: 500;
  }
</style>
