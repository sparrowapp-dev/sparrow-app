<script lang="ts">
  import { onMount } from "svelte";
  import { Badge } from "@sparrow/library/ui";
  export let tabs;
  export let currentTabId;
  export let onTabClick;
  export let type: "segmentedTab" | "default" = "default";
  let leftSliderDistance = 0;
  let sliderWidth = 0;
  let tabElements: { [key: string]: HTMLButtonElement | undefined } = {};

  const handleClick = (id: string) => {
    const tab = tabElements[id];
    if (tab && !tab.disabled) {
      leftSliderDistance = tab.offsetLeft;
      sliderWidth = tab.offsetWidth;
    }
  };
  let allDisableState = false;
  $: {
    let tab1 = tabs;
    for (let tab of tab1) {
      if (tab.disabled) {
        // allDisableState = true;
        break;
      }
    }
  }
  onMount(() => {
    let tab1 = tabs;
    for (let tab of tab1) {
      if (tab.disabled) {
        // allDisableState = true;
        break;
      }
    }
    handleClick(currentTabId);
  });

  // Add reactive statement to watch currentTabId changes
  $: {
    if (currentTabId && Object.keys(tabElements).length > 0) {
      handleClick(currentTabId);
    }
  }
</script>

<div tabindex={allDisableState ? -1 : 0}>
  <!-- Tabs -->
  <div
    class={"d-flex position-relative gap-1"}
    style={type === "segmentedTab"
      ? "border: 1px solid var(--border-ds-surface-100); border-radius: 6px; padding: 4px; width:fit-content"
      : ""}
  >
    {#each tabs as tab}
      <button
        bind:this={tabElements[tab.id]}
        tabindex={allDisableState ? -1 : 0}
        class={`${tab.disabled ? "tab-container-disabled" : "tab-container"} ${tab.id === currentTabId ? "selected" : ""}  text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium`}
        role="tab"
        on:click={() => {
          if (!tab.disabled) {
            handleClick(tab.id);
            onTabClick(tab.id);
          }
        }}
      >
        <span class="d-flex align-items-center">
          {#if tab?.icon}
            <span class="d-flex align-items-center w-3 h-3 me-1">
              <svelte:component this={tab.icon} class="icon" size="16px" />
            </span>
          {/if}
          <span class="text">{tab.name} </span>
          {#if tab?.count}
            <span class="ms-1" style="margin-right: -4px;">
              <Badge count={tab.count} variant={"neutral"} size={"medium"} />
            </span>
          {/if}
        </span>
      </button>
    {/each}
  </div>
  {#if !allDisableState && type != "segmentedTab"}
    <div
      class="slider"
      style="left: {leftSliderDistance + 1}px; width:{sliderWidth - 1.5}px"
    ></div>
  {/if}
</div>

<style>
  .tab-container {
    display: flex;
    justify-content: center;
    align-items: center;

    min-width: fit-content;
    max-width: 182px;
    text-align: center;
    border-radius: 4px;
    padding: 0px 6px;
    gap: 4px;
    background-color: transparent;
    color: var(--text-ds-neutral-100);
    min-height: 28px;
    border: 0px;
  }
  .tab-container:hover {
    background-color: var(--bg-ds-surface-400);
    color: var(--bg-ds-neutral-50);
  }
  .tab-container:focus-visible {
    background-color: var(--bg-ds-surface-900);
    outline: 2px solid var(--border-ds-primary-300);
    outline-offset: -2px;
    color: var(--bg-ds-neutral-100) !important;
  }

  .tab-container.selected {
    background-color: var(--bg-ds-surface-600);
    color: var(--bg-ds-neutral-50);
  }
  .tab-container.selected:hover {
    background-color: var(--bg-ds-surface-400) !important;
    color: var(--bg-ds-neutral-50);
  }
  /* .tab-container:focus-visible .slider {
    left: calc(var(--left-distance) + 1px) !important;
  } */
  .tab-contianer:active {
    background-color: var(--bg-ds-surface-700);
    color: var(--bg-ds-neutral-50);
  }

  .tab-container-disabled {
    display: flex;
    justify-content: center;
    align-items: center;
    max-width: 182px;
    min-width: 96px;
    text-align: center;
    border-radius: 4px;
    padding: 4px, 8px;
    gap: 4px;
    background-color: transparent;
    color: var(--text-ds-neutral-500);
    min-height: 28px;
    border: 0px;
    cursor: default;
  }

  .icon {
    max-width: 12px;
    max-height: 12px;
    margin-right: 5px;
    border-radius: 50%;
  }
  .slider {
    width: 30px;
    height: 2px;
    border-radius: 2px;
    background-color: var(--bg-ds-primary-400);
    transition: all 250ms ease-out;
    position: relative;
    bottom: 0;
    left: 0px;
    top: 0px;
    z-index: 0;
  }
</style>
