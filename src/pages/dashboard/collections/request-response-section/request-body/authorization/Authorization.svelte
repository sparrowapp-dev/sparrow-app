<script>
  //   import angleDown from "$lib/assets/angle-down.svg";

  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import ApiKey from "./ApiKey.svelte";
  import BasicAuth from "./BasicAuth.svelte";
  import BearerToken from "./BearerToken.svelte";
  import NoAuth from "./NoAuth.svelte";

  let currentTab = "No Auth";
  let handleDropdown = (tab) => {
    currentTab = tab;
    console.log(currentTab);
    // console.log(tab);
  };
</script>

<div class="mt-4 pb-0 ps-1 pe-1 w-100">
  <div
    class="d-flex align-items-center gap-4"
    style="font-size: 12px;font-weight:500;border-bottom:1px solid var(--border-color)"
  >
    <div>
      <p class="text-requestBodyColor ps-1">Auth Type</p>
    </div>
    <div class="ps-5">
      <button class="d-flex bg-backgroundColor border-0">
        <p>
          <Dropdown
            data={["No Auth", "API Key", "Bear Token", "Basic Auth"]}
            onclick={handleDropdown}
          />
        </p>
      </button>
    </div>
  </div>
  {#if currentTab === "No Auth"}
    <NoAuth />
  {:else if currentTab === "API Key"}
    <ApiKey />
  {:else if currentTab === "Bear Token"}
    <BearerToken />
  {:else}
    <BasicAuth />
  {/if}
</div>

<style>
  button:hover {
    border-bottom: 2px solid red; /* Replace 'yourColor' with the desired color */
  }

  /* Add a border bottom when the button is pressed (active) */
  button:active {
    border-bottom: 2px solid red; /* Replace 'yourColor' with the desired color */
  }
</style>
