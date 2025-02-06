<script lang="ts">
  import { Label } from "@sparrow/library/ui";
  import { onMount, SvelteComponent } from "svelte";

  export let tabs;
  export let currentTabId;
  export let onTabClick;
  let dist = 0;
  let wd = 0;
  let tabElements = {};
  let img =
    "data:image/jpeg;base64,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";

  const handleClick = (id) => {
    const tab = tabElements[id];
    console.log(tab);
    if (tab && !tab.disabled) {
      dist = tab.offsetLeft;
      wd = tab.offsetWidth;
    }
  };

  onMount(() => {
    handleClick(currentTabId);
  });
</script>

<div>
  <!-- Tabs -->
  <div class="d-flex">
    {#each tabs as tab}
      <button
        bind:this={tabElements[tab.id]}
        tabindex="0"
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
          {#if tab.icon}
            <span class="d-flex align-items-center w-20px h-20px p-2px">
              <svelte:component this={tab.icon} class="icon" />
            </span>
          {/if}
          <span class="text">{tab.name} </span>
          {#if tab.count}
            <span class="ms-1"></span>
            <Label
              textColor={"var(--text-primary-350)"}
              backgroundColor={"var(--bg-tertiary-300)"}
              number={tab.count}
            />
          {/if}
        </span>
      </button>
    {/each}
  </div>
  <div class="slider" style="left: {dist + 1}px; width:{wd - 2}px"></div>
</div>

<style>
  .tab-container {
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
    color: var(--text-ds-neutral-100);
    font-size: 12px;
    line-height: 18px;
    min-height: 28px;
    border: 0px;
  }
  .tab-container:hover {
    background-color: var(--bg-ds-surface-600);
    color: var(--white-color);
  }
  .tab-container:focus-visible {
    background-color: var(--bg-ds-surface-900);
    outline: none;
    border: 2px solid var(--border-ds-primary-300);
  }
  .tab-contianer:active {
    background-color: var(--bg-ds-surface-700);
    color: var(--white-color);
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
    cursor: not-allowed;
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
    background-color: var(--border-primary-400);
    transition: 250ms ease-out;
    position: relative;
    bottom: 0;
    left: 0px;
    top: -3px;
    z-index: 100;
  }
</style>
