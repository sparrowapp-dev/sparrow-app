<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { RequestSection } from "$lib/utils/enums";
  import type { UpdateRequestStateType } from "@workspaces/shared/type";
  export let requestStateSection: string = "";
  export let onUpdateRequestState: UpdateRequestStateType;
  const dispatch = createEventDispatcher();

  let tabs: {
    name: string;
    id: string;
    count: number;
  }[] = [
    { name: "Parameters", id: RequestSection.PARAMETERS, count: 0 },
    { name: "Body", id: RequestSection.REQUEST_BODY, count: 0 },
    { name: "Headers", id: RequestSection.HEADERS, count: 0 },
    { name: "Auth", id: RequestSection.AUTHORIZATION, count: 0 },
  ];
</script>

<div class="py-2">
  <!-- Tabs -->
  <div class="d-flex mb-3">
    {#each tabs as tab}
      <button
        class="team-menu__link border-0 me-2 sparrow-fs-12 request-tab me-4 {tab.id ===
        requestStateSection
          ? 'tab-active'
          : ''}"
        role="tab"
        on:click={() => {
          onUpdateRequestState({ requestNavigation: tab.id });
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
    border-bottom: 2px transparent;
  }
  .tab-active {
    color: white;
    border-bottom: 2px solid var(--send-button) !important;
  }
</style>
