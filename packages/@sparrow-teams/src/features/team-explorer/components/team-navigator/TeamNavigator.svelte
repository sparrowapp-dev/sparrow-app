<script lang="ts">
  import { Label, Tooltip } from "@sparrow/library/ui";
  export let tabs = [];
  export let activeTeamTab: string;
  export let onUpdateActiveTab: (data: string) => void;
  export let isWebApp;
</script>

{#if isWebApp}
  <div class="">
    <!-- Tabs -->
    <div class="d-flex mb-2">
      {#each tabs as tab}
        {#if tab?.visible && tab.id === activeTeamTab}
          <button
            class="navigation__link-web border-0 sparrow-fs-12 request-tab pb-2 me-3"
            role="tab"
          >
            <span
              class="d-flex align-items-center text-fs-16"
              style="font-weight:700"
              ><span>{tab.name}</span>
              {#if tab.count}
                <span class="ms-1"></span>
                <Label number={tab.count} size={"18px"} />
              {/if}
            </span>
          </button>
        {/if}
      {/each}
    </div>
  </div>
{:else}
  <div class="">
    <!-- Tabs -->
    <div class="d-flex mb-2">
      {#each tabs as tab}
        {#if tab?.visible}
          <button
            class="navigation__link border-0 sparrow-fs-12 request-tab me-3 {tab.id ===
            activeTeamTab
              ? 'tab-active'
              : ''} {tab.disabled ? 'tab-disabled' : ''}"
            role="tab"
            on:click={() => {
              if (!tab.disabled) {
                onUpdateActiveTab(tab.id);
              }
            }}
            disabled={tab.disabled}
          >
            <span
              class="d-flex align-items-center ps-1 pe-1 {tab.id !==
              activeTeamTab
                ? 'tab-active-text'
                : ''}"
              style="font-size: 12px; font-weight:700"
              ><span>{tab.name}</span>
              {#if tab.count}
                <span class="ms-1"></span>
                <Label number={tab.count} />
              {/if}
            </span>
          </button>
        {/if}
      {/each}
    </div>
  </div>
{/if}

<style>
  .navigation__link {
    color: var(--text-secondary-100);
    background-color: transparent;
    border-bottom: 2px transparent;
  }

  .navigation__link:hover {
    background-color: var(--text-secondary-500);
    border-radius: 2px;
  }
  .tab-active {
    color: var(--text-secondary-100);
    border-bottom: 2px solid var(--border-primary-300) !important;
  }
  .tab-active-text {
    color: var(--text-secondary-200);
  }

  .tab-disabled {
    opacity: 0.5;
  }
  .navigation__link-web {
    color: var(--text-secondary-100);
    background-color: transparent;
    border-bottom: 2px transparent;
  }
</style>
