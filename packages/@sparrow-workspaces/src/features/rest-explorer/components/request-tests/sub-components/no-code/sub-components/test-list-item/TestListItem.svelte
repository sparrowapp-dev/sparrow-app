<script lang="ts">
  import {
    CopyRegular,
    DeleteRegular,
    MoreHorizontalRegular,
  } from "@sparrow/library/icons";
  import { Button, Options, Tooltip } from "@sparrow/library/ui";

  export let test;
  export let selectTest;
  export let deleteTest;
  export let duplicateTest;
  export let index;

  let requestTabWrapper: HTMLElement;
  let showMenu = false;
  function rightClickContextMenu(e: Event) {
    setTimeout(() => {
      showMenu = !showMenu;
    }, 100);
  }

  const handleSelectClick = (event: MouseEvent) => {
    const selectElement = document.getElementById(`show-more-test-${test.id}`);
    if (selectElement && !selectElement.contains(event.target as Node)) {
      showMenu = false;
    }
  };
</script>

<svelte:window
  on:click={handleSelectClick}
  on:contextmenu|preventDefault={handleSelectClick}
/>

{#if showMenu}
  <Options
    xAxis={requestTabWrapper.getBoundingClientRect().right - 180}
    yAxis={[
      requestTabWrapper.getBoundingClientRect().top - 5,
      requestTabWrapper.getBoundingClientRect().bottom + 5,
    ]}
    zIndex={500}
    menuItems={[
      {
        onClick: () => {
          duplicateTest(test);
        },
        icon: CopyRegular,
        displayText: `Duplicate Test`,
      },
      {
        onClick: () => {
          deleteTest(test);
        },
        icon: DeleteRegular,
        displayText: `Remove Test`,
      },
    ]}
  />
{/if}

<div class="d-flex gap-2 pb-1">
  <span
    style="width: 40px; background: var(--bg-ds-surface-400); "
    class="text-muted d-flex ellipsis align-items-center justify-content-center rounded text-fs-12"
    >{index + 1 <= 9 ? "0" : ""}{index + 1}</span
  >

  <div
    bind:this={requestTabWrapper}
    class="d-flex w-100 justify-content-between align-items-center px-2 py-1 rounded ellipsis"
    class:selected={test.isActive}
    style="cursor: pointer; background: {test.isActive
      ? 'var(--bg-ds-surface-400)'
      : ''};"
  >
    <span
      class="ellipsis text-fs-12 h-100 w-100 pt-1"
      on:click={() => selectTest(test)}>{test.name}</span
    >
    <Tooltip
      title={"More"}
      show={!showMenu}
      placement={"bottom-center"}
      zIndex={701}
      distance={17}
    >
      <span class="threedot-icon-container d-flex">
        <Button
          tabindex={-1}
          id={`show-more-test-${test.id}`}
          size="extra-small"
          customWidth={"24px"}
          type="teritiary-regular"
          startIcon={MoreHorizontalRegular}
          onClick={(e) => {
            rightClickContextMenu(e);
          }}
        />
      </span>
    </Tooltip>
  </div>
</div>
