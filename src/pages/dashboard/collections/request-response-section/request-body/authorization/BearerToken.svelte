<script>
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  let handleDropdown = (tab) => {
    // console.log(tab);
  };
</script>

<div class="d-flex  flex-column w-100 ps-1 pt-4 pe-1">
  <div
    class="d-flex align-items-center justify-content-between text-requestBodyColor mb-3"
    style="font-size: 12px; font-weight:500"
  >
    <p class="mb-0">Token</p>

    <input
      type="text"
      style="outline: none;"
      class="w-75 bg-backgroundColor border-0 h-75 ps-2"
      placeholder="Enter Token"
    />
  </div>
</div>

<style>
  input::placeholder {
    color: var(--button-color);
    font-weight: 500;
  }
</style>
