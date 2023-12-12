<script lang="ts">
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import { AuthSection } from "$lib/utils/enums/authorization.enum";
    import { RequestAuthProperty } from "$lib/utils/enums/request.enum";
  import type { ApiKey } from "$lib/utils/interfaces/request.interface";
  export let apiData: ApiKey;
  export let callback;

  const handleAuthChange = () => {
    callback(apiData, RequestAuthProperty.API_KEY)
  };

  const handleDropdown = (
    tab: AuthSection.HEADER | AuthSection.QUERY_PARAMETER,
  ) => {
    apiData.addTo = tab;
    callback(apiData, RequestAuthProperty.API_KEY);
  };
  
</script>

<div class="d-flex flex-column w-100 ps-1 pt-4 pe-1">
  <div
    class="d-flex align-items-center justify-content-between text-requestBodyColor mb-3"
    style="font-size: 12px; font-weight:500"
  >
    <p class="mb-0">Auth Key</p>

    <input
      type="text"
      style="outline: none;"
      class="w-75 bg-backgroundColor border-0 h-75 p-2"
      placeholder="Enter Auth Key"
      bind:value={apiData.authKey}
      on:input={handleAuthChange}
    />
  </div>
  <div
    class="d-flex align-items-center justify-content-between text-requestBodyColor mb-3"
    style="font-size: 12px; font-weight:500"
  >
    <p class="mb-0">Auth Value</p>

    <input
      type="text"
      style="outline: none;"
      class="w-75 h-75 p-2 border-0 bg-backgroundColor"
      placeholder="Enter Auth Value"
      bind:value={apiData.authValue}
      on:input={handleAuthChange}
    />
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
                id: AuthSection.HEADER 
              },
              {
                name: "Query Parameter",
                id: AuthSection.QUERY_PARAMETER 
              }
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
