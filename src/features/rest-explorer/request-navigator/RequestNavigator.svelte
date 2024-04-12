<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { RequestSection } from "$lib/utils/enums";
  export let requestStateSection: string;
  const dispatch = createEventDispatcher();

  let tabs: {
    name: string;
    id: string;
    count: number;
  }[] = [
    { name: "Parameters", id: RequestSection.PARAMETERS, count: 0 },
    { name: "Request Body", id: RequestSection.REQUEST_BODY, count: 0 },
    { name: "Headers", id: RequestSection.HEADERS, count: 0 },
    { name: "Authorization", id: RequestSection.AUTHORIZATION, count: 0 },
  ];
</script>

<div class="py-2 px-3">
  <!-- Tabs -->
  <div class="d-flex mb-3">
    {#each tabs as tab}
      <button
        class="team-menu__link border-0 me-2 sparrow-fs-12 request-tab {tab.id ===
        requestStateSection
          ? 'tab-active'
          : ''}"
        role="tab"
        on:click={() => {
          dispatch("change", tab.id);
        }}
      >
        <span class="">{tab.name}</span>
        {#if tab.count !== undefined && tab.count > 0}
          <span class="text-labelColor">({tab.count})</span>
        {/if}
      </button>
    {/each}
  </div>
</div>

<style>
  .team-menu__link {
    color: #8a9299;
    background-color: transparent;
    border-bottom: 3px transparent;
  }
  .tab-active {
    color: white;
    border-bottom: 3px solid var(--send-button) !important;
  }
</style>
