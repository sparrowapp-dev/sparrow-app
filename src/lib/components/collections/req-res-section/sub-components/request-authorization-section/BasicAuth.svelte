<script lang="ts">
  import {
    basicAuth1,
    basicAuth2,
    createBasicAuthHeader,
  } from "$lib/store/requestSection";

  const handleUsername = (event) => {
    basicAuth1.set(event.target.value);
  };

  const handlePassword = (event) => {
    basicAuth2.set(event.target.value);
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
      bind:value={$basicAuth1}
      on:input={handleUsername}
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
      bind:value={$basicAuth2}
      on:input={handlePassword}
    />
  </div>
</div>

<button on:click={createBasicAuthHeader}>Create Basic Auth Header</button>

<style>
  input::placeholder {
    color: var(--button-color);
    font-weight: 500;
  }
</style>
