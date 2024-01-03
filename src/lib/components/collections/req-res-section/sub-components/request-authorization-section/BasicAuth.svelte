<script lang="ts">
  import { RequestAuthProperty } from "$lib/utils/enums/request.enum";
  import { EnvironmentHeper } from "$lib/utils/helpers/environment.helper";
  import type { BasicAuth } from "$lib/utils/interfaces/request.interface";
  import EnvironmentPicker from "../environment-picker/EnvironmentPicker.svelte";

  export let callback;
  export let basicAuth: BasicAuth;
  export let environmentVariables;

  const environmentHelper = new EnvironmentHeper();
  const handleInput = () => {
    callback(basicAuth, RequestAuthProperty.BASIC_AUTH);
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
    class="d-flex align-items-center justify-content-between text-requestBodyColor mb-4"
    style="font-size: 12px; font-weight:500"
  >
    <p class="mb-0">Username</p>
    <div class="position-relative w-75">
      <input
        type="text"
        style="outline: none;"
        class="w-100 bg-backgroundColor border-0 h-75 ps-2"
        placeholder="Enter Username"
        bind:value={basicAuth.username}
        on:input={() => {
          handleInput();
          tempText = basicAuth.username;
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
          tempText = basicAuth.username;
          focusedInput = "username";
          trackParanthesis = environmentHelper.balanceParanthesis(tempText);
        }}
      />
      {#if focusedInput === "username" && trackParanthesis.length === 2 && filterData.length > 0}
        <EnvironmentPicker
          {filterData}
          inputText={basicAuth.username}
          {trackCursor}
          {trackParanthesis}
          updateText={(text) => {
            basicAuth.username = text;
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

  <div
    class="d-flex align-items-center justify-content-between text-requestBodyColor mb-3"
    style="font-size: 12px; font-weight:500"
  >
    <p class="mb-0">Password</p>

    <div class="position-relative w-75">
      <input
        type="text"
        style="outline: none;"
        class="w-100 bg-backgroundColor border-0 h-75 ps-2"
        placeholder="Enter Password"
        bind:value={basicAuth.password}
        on:input={() => {
          handleInput();
          tempText = basicAuth.password;
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
          tempText = basicAuth.password;
          focusedInput = "password";
          trackParanthesis = environmentHelper.balanceParanthesis(tempText);
        }}
      />
      {#if focusedInput === "password" && trackParanthesis.length === 2 && filterData.length > 0}
        <EnvironmentPicker
          {filterData}
          inputText={basicAuth.password}
          {trackCursor}
          {trackParanthesis}
          updateText={(text) => {
            basicAuth.password = text;
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
