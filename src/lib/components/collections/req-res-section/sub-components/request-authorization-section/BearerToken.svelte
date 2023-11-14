<script lang="ts">
  import { handleRequestAuthChange } from "$lib/store/request-response-section";
    import { RequestAuthProperty } from "$lib/utils/enums/request.enum";

  export let bearerToken: string;
  export let currentTabId: string;

  const handleInput = () => {
    handleRequestAuthChange(bearerToken, RequestAuthProperty.BEARER_TOKEN, currentTabId);
  };
  
</script>

<div class="d-flex flex-column w-100 ps-1 pt-4 pe-1">
  <div
    class="d-flex justify-content-between text-requestBodyColor mb-3"
    style="font-size: 12px; font-weight:500"
  >
    <p class="mb-0">Token</p>

      <textarea
        style="outline: none; "
        class="w-75 bg-backgroundColor border-0 ps-2"
        rows="6"
        placeholder="Enter Token"
        bind:value={bearerToken}
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
