<script lang="ts">
  import { Label } from "@sparrow/library/ui";
  import { type UpdateRequestStateType } from "@sparrow/workspaces/type";
  import { ResponseSectionEnum } from "@sparrow/common/types/workspace";
  import { onMount } from "svelte";
  export let requestStateSection: string;
  export let updateResponseNavigation;
  export let responseHeadersLength = 0;

  let tabs: {
    name: string;
    id: ResponseSectionEnum;
    count: number;
  }[] = [];

  /**
   * @description - refresh tabs label count
   * @param _responseHeadersLength - response headers length
   */
  const refreshTabs = (_responseHeadersLength: number) => {
    return [
      { name: "Body", id: ResponseSectionEnum.RESPONSE, count: 0 },
      {
        name: "Headers",
        id: ResponseSectionEnum.HEADERS,
        count: _responseHeadersLength,
      },
    ];
  };

  /**
   * @description - re-calculates value when dependency changes
   */
  $: {
    if (responseHeadersLength) {
      tabs = refreshTabs(responseHeadersLength);
    }
  }
  onMount(() => {
    tabs = refreshTabs(responseHeadersLength);
  });
</script>

<div class="py-2">
  <!-- Tabs -->
  <div class="d-flex mb-2">
    {#each tabs as tab}
      <button
        class="navigation__link border-0 me-2 sparrow-fs-12 me-4 request-tab {tab.id ===
        requestStateSection
          ? 'tab-active'
          : ''}"
        role="tab"
        on:click={() => {
          updateResponseNavigation(tab.id);
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
  .navigation__link {
    color: var(--text-secondary-100);
    background-color: transparent;
    border-bottom: 2px transparent;
    padding: 2px;
  }
  .navigation__link:hover {
    background-color: var(--text-secondary-500);
    border-radius: 2px;
  }
  .tab-active {
    color: var(--text-secondary-100);
    border-bottom: 2px solid var(--border-primary-300) !important;
  }
</style>
