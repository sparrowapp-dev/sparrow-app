<script lang="ts">
  import { MoreHorizontalRegular } from "@sparrow/library/icons";
  import { Button, Options, Tooltip } from "@sparrow/library/ui";

  export let test;
  export let selectTest;
  export let deleteTest;
  export let duplicateTest;

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
    xAxis={requestTabWrapper.getBoundingClientRect().right - 30}
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
        displayText: `Duplicate Test`,
      },
      {
        onClick: () => {
          deleteTest(test);
        },
        displayText: `Remove Test`,
      },
    ]}
  />
{/if}

<div
  bind:this={requestTabWrapper}
  class="d-flex justify-content-between align-items-center p-2 mb-1 rounded"
  class:selected={test.isActive}
  on:click={() => selectTest(test)}
  style="cursor: pointer; background: {test.isActive ? '#333' : '#222'};"
>
  <span>{test.name}</span>
  <!-- <span class="text-muted">⋮</span> -->
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
