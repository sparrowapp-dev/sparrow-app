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
  <div class="d-flex mb-2">
    {#each tabs as tab}
      <button
        class="team-menu__link px-1 border-0 me-2 sparrow-fs-12 me-3 request-tab {tab.id ===
        requestStateSection
          ? 'tab-active'
          : ''}"
        role="tab"
        on:click={() => {
          onUpdateRequestState({ responseNavigation: tab.id });
        }}
      >
        <span class="d-flex align-items-center"
          ><span>{tab.name}</span>
          {#if tab.count}
            <span class="ms-1"></span>
            <Label number={tab.count} />
          {/if}
        </span>
      </button>
    {/each}
  </div>
</div>

<style>
  .team-menu__link {
    color: var(--text-secondary-300);
    background-color: transparent;
    border-bottom: 2px transparent;
  }
  .team-menu__link:hover {
    color: var(--text-secondary-100);
  }
  .tab-active {
    color: var(--text-secondary-100);
    border-color: var(--border-primary-200) !important;
    border-bottom-width: 2px !important;
    border-bottom-style: solid !important;
  }
</style>
