<script lang="ts">
  import { ResponseSection } from "$lib/utils/enums";
  import { Label } from "@library/ui";
  export let requestStateSection;
  export let onUpdateRequestState;
  export let responseHeadersLength = 0;

  let tabs: {
    name: string;
    id: string;
    count: number;
  }[] = [
    { name: "Body", id: ResponseSection.RESPONSE, count: 0 },
    { name: "Headers", id: ResponseSection.HEADERS, count: 0 },
  ];
  $: {
    if (responseHeadersLength) {
      tabs = [
        { name: "Body", id: ResponseSection.RESPONSE, count: 0 },
        {
          name: "Headers",
          id: ResponseSection.HEADERS,
          count: responseHeadersLength,
        },
      ];
    }
  }
</script>

<div class="py-2">
  <!-- Tabs -->
  <div class="d-flex mb-3">
    {#each tabs as tab}
      <button
        class="team-menu__link border-0 me-2 sparrow-fs-12 me-4 request-tab {tab.id ===
        requestStateSection
          ? 'tab-active'
          : ''}"
        role="tab"
        on:click={() => {
          onUpdateRequestState({ responseNavigation: tab.id });
        }}
      >
        <span class=""
          >{tab.name}
          {#if tab.count}
            <Label number={tab.count} />
          {/if}
        </span>
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
