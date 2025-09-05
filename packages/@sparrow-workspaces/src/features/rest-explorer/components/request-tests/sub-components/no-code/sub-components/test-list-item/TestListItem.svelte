<script lang="ts">
  import {
    CopyRegular,
    DeleteRegular,
    MoreHorizontalRegular,
  } from "@sparrow/library/icons";
  import { Button, Modal, Options, Tooltip } from "@sparrow/library/ui";

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
  let isDeletePopup = false;
  export let testResults;
  let errors = false;

  $: {
    errors = false;
    if (testResults) {
      for (let testResult of testResults) {
        if (
          test &&
          testResult.testId === test.id &&
          testResult.testStatus === false
        ) {
          errors = true;
          break;
        }
      }
    }
  }
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
          isDeletePopup = true;
        },
        icon: DeleteRegular,
        displayText: `Remove Test`,
      },
    ]}
  />
{/if}

<Modal
  title={"Remove Test?"}
  type={"danger"}
  width={"35%"}
  zIndex={1000}
  isOpen={isDeletePopup}
  handleModalState={() => (isDeletePopup = false)}
>
  <div
    class="text-lightGray mb-1 text-ds-font-size-14 text-ds-font-weight-medium"
  >
    <p>
      Are you sure you want to remove <b
        style="color: var(--text-ds-neutral-100)">"{test?.name}"</b
      >?
    </p>
  </div>

  <div
    class="d-flex align-items-center justify-content-end gap-3 mt-1 mb-0 rounded w-100 text-ds-font-size-16"
  >
    <Button
      title={"Cancel"}
      type={"secondary"}
      loader={false}
      onClick={() => {
        isDeletePopup = false;
      }}
    />

    <Button
      title={"Remove"}
      type={"danger"}
      onClick={() => {
        deleteTest(test);
        isDeletePopup = false;
      }}
    />
  </div></Modal
>

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
      : ''}; border: {errors ? '1px solid var(--text-ds-danger-300)' : ''}"
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
