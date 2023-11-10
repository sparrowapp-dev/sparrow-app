<script lang="ts">
  import { handleRequestAuthChange } from "$lib/store/request-response-section";
  import type { BasicAuth } from "$lib/utils/interfaces/request.interface";

  export let currentTabId: string;
  export let basicAuth: BasicAuth;

  const handleInput = () => {
    handleRequestAuthChange(basicAuth, "basicAuth", currentTabId);
  };
  
</script>

<div class="d-flex flex-column w-100 ps-1 pt-4 pe-1">
  <div
    class="d-flex align-items-center justify-content-between text-requestBodyColor mb-4"
    style="font-size: 12px; font-weight:500"
  >
    <p class="mb-0">Username</p>

    <input
      type="text"
      style="outline: none;"
      class="w-75 bg-backgroundColor border-0 h-75 ps-2"
      placeholder="Enter Username"
      bind:value={basicAuth.username}
      on:input={handleInput}
    />
  </div>

  <div
    class="d-flex align-items-center justify-content-between text-requestBodyColor mb-3"
    style="font-size: 12px; font-weight:500"
  >
    <p class="mb-0">Password</p>

    <input
      type="text"
      style="outline: none;"
      class="w-75 bg-backgroundColor border-0 h-75 ps-2"
      placeholder="Enter Password"
      bind:value={basicAuth.password}
      on:input={handleInput}
    />
  </div>
</div>

<style>
  input::placeholder {
    color: var(--button-color);
    font-weight: 500;
  }
</style>
