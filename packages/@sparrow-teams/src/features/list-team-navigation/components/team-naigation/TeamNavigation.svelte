<script lang="ts">
  export let tab = [];
  export let activeTeamTab: string;
  export let onUpdateActiveTab: (data: string) => void;
</script>

<button
  class="p-2 mb-1 w-100 navigation__link border-0 sparrow-fs-12 request-tab border-radius-4 {tab.id ===
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
    class="d-flex align-items-center ps-1 pe-1 {tab.id !== activeTeamTab
      ? 'tab-active-text'
      : ''}"
    style="font-size: 12px; font-weight:700"
    ><span>{tab.name}</span>
  </span>
</button>

<style>
  .navigation__link {
    color: var(--text-secondary-100);
    background-color: transparent;
    border-bottom: 2px transparent;
    padding-left: 40px !important;
  }

  .navigation__link:hover {
    background-color: var(--bg-tertiary-750);
    border-radius: 2px;
  }
  .tab-active {
    background-color: var(--bg-tertiary-750);
  }

  .tab-disabled {
    opacity: 0.5;
  }
</style>
