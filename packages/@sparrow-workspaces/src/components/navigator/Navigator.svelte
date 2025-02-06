<script lang="ts">
  import { BadgeIcon } from "@sparrow/library/icons";
  export let tabs;
  export let currentTabId;

  export let onTabClick;
</script>

<div class="">
  <!-- Tabs -->
  <div class="d-flex mb-2">
    {#each tabs as tab}
      <button
        class="navigation__link border-0 sparrow-fs-12 request-tab me-3 {tab.id ===
        currentTabId
          ? 'tab-active'
          : ''}"
        role="tab"
        on:click={() => {
          onTabClick(tab.id);
        }}
      >
        <span class="d-flex align-items-center ps-1 pe-1"
          ><span>{tab.name}</span>
          {#if tab.count}
            <BadgeIcon
              badgeValue={true}
              badgeColor="blue"
              inputValue={tab.count}
            />
          {/if}
        </span>
      </button>
    {/each}
  </div>
</div>

<style>
  .navigation__link {
    color: var(--text-secondary-200);
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
</style>
