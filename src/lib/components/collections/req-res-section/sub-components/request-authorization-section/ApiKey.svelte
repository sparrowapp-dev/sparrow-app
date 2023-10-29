<script>
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import { apiKey, apiValue } from "$lib/store/authorization";

  let handleDropdown = (tab) => {
    // console.log(tab);
  };

  const handleAuthKey = (event) => {
    apiKey.set(event.target.value);
  };

  const handleAuthValue = (event) => {
    apiValue.set(event.target.value);
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
      bind:value={$apiKey}
      on:input={handleAuthKey}
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
      bind:value={$apiValue}
      on:input={handleAuthValue}
    />
  </div>
  <div
    class="d-flex align-items-center text-requestBodyColor gap-4"
    style="font-size: 12px; font-weight:500"
  >
    <p>Add to</p>
    <div class="ps-5">
      <button class="d-flex bg-backgroundColor border-0">
        <p class="ps-3">
          <Dropdown
            data={["Header", "Query Parameters", "Cookies"]}
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
