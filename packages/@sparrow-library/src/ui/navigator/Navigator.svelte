<script lang="ts">
  import { onMount } from "svelte";
  import { Badge } from "@sparrow/library/ui";
  export let tabs;
  export let currentTabId;
  export let onTabClick;
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
        allDisableState = true;
        break;
      }
    }
  }
  onMount(() => {
    let tab1 = tabs;
    for (let tab of tab1) {
      if (tab.disabled) {
        allDisableState = true;
        break;
      }
    }
    handleClick(currentTabId);
  });
</script>

<div tabindex={allDisableState ? -1 : 0}>
  <!-- Tabs -->
  <div class="d-flex">
    {#each tabs as tab}
      <button
        bind:this={tabElements[tab.id]}
        tabindex={allDisableState ? -1 : 0}
        class={tab.disabled ? "tab-container-disabled" : "tab-container "}
        role="tab"
        on:click={() => {
          if (!tab.disabled) {
            handleClick(tab.id);
            onTabClick(tab.id);
          }
        }}
      >
        <span class="d-flex align-items-center ps-1 pe-1">
          {#if tab?.icon}
            <span class="d-flex align-items-center w-20px h-20px p-2px">
              <svelte:component this={tab.icon} class="icon" />
            </span>
          {/if}
          <span class="text">{tab.name} </span>
          {#if tab?.count}
            <span class="ms-1"></span>
            <Badge count={tab.count} variant={"neutral"} size={"medium"} />
          {/if}
        </span>
      </button>
    {/each}
  </div>
  {#if !allDisableState}
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

    min-width: 96px;
    text-align: center;
    border-radius: 4px;
    padding: 4px, 8px;
    gap: 4px;
    background-color: var(--bg-ds-surface-900);
    color: var(--text-ds-neutral-100);
    font-size: 12px;
    line-height: 18px;
    min-height: 28px;
    border: 0px;
  }
  .tab-container:hover {
    background-color: var(--bg-ds-surface-600);
    color: var(--bg-ds-neutral-50);
  }
  .tab-container:focus-visible {
    background-color: var(--bg-ds-surface-900);
    outline: none;
    border: 2px solid var(--border-ds-primary-300);
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
    background-color: var(--bg-ds-surface-900);
    color: var(--text-ds-neutral-500);
    font-size: 12px;
    line-height: 18px;
    min-height: 28px;
    border: 0px;
    cursor: default;
  }

  .icon {
    width: 12px;
    height: 12px;
    margin-right: 5px;
    border-radius: 50%;
  }
  .slider {
    width: 30px;
    height: 2px;
    border-radius: 2px;
    background-color: var(--bg-ds-primary-400);
    transition: 250ms ease-out;
    position: relative;
    bottom: 0;
    left: 0px;
    top: -3px;
    z-index: 100;
  }
</style>
