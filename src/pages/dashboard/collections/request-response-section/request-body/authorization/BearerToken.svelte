<script>
  import { BearerToken } from "$lib/store/requestSection";
  let isOverflowing = false; // Track whether content overflows

  const handleInput = (event) => {
    BearerToken.set(event.target.value);

    // Check if content overflows
    const inputElement = event.target;
    if (inputElement.scrollWidth > inputElement.clientWidth) {
      isOverflowing = true;
    } else {
      isOverflowing = false;
    }
  };
</script>

<div class="d-flex flex-column w-100 ps-1 pt-4 pe-1">
  <div
    class="d-flex align-items-center justify-content-between text-requestBodyColor mb-3"
    style="font-size: 12px; font-weight:500"
  >
    <p class="mb-0">Token</p>

    {#if isOverflowing}
      <textarea
        style="outline: none; height: auto;"
        class="w-75 bg-backgroundColor border-0 h-100 ps-2"
        bind:value={$BearerToken}
        on:input={handleInput}
      />
    {:else}
      <input
        type="text"
        style="outline: none;"
        class="w-75 bg-backgroundColor border-0 h-75 ps-2"
        placeholder="Enter Token"
        bind:value={$BearerToken}
        on:input={handleInput}
      />
    {/if}
  </div>
</div>

<style>
  input::placeholder {
    color: var(--button-color);
    font-weight: 500;
  }
</style>
