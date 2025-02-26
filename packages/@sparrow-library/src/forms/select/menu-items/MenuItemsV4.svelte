<script lang="ts">
  /**
   * select option list
   */
  import { CheckMarkIcon } from "@sparrow/library/icons";
  export let list: {
    name: string;
    id: string;
    color?:
      | "primary"
      | "danger"
      | "dark"
      | "light"
      | "success"
      | "warning"
      | "secondary"
      | "patch";
    description?: string;
    default?: boolean;
    hide?: boolean;
  };
  /**
   * selected option
   */
  export let selectedRequest: {
    id: string;
  };

  /**
   * Ticked mark icon
   */
  export let getTextColor: (color: any) => {};
  /**
   * marks the tickmark is highlighted
   */
  export let highlightTickedItem: boolean;

  /**
   * body theme - background
   */
  export let showDescription = true;

  $: console.log(showDescription);

  let isMenuItemHover = false;
  let isMenuItemClicked = false;

  /**
   * @description - adds CSS class to menu item when hovered or clicked according to the theme
   * @param _isMenuItemHover - identifies if menu item is hovered
   * @param _isMenuItemClicked - identifies if menu item is clicked
   */

  /**
   * @description - add classes to ticked options
   * @param _id - item id (rows iteration)
   * @param _selectedId - selected item id
   */
  const extractBodyTextHighlight = (_id: string, _selectedId: string) => {
    if (_id === _selectedId && highlightTickedItem) {
      return `select-ticked-highlight-text`;
    } else return "";
  };
</script>

<div
  on:mouseenter={() => {
    isMenuItemHover = true;
  }}
  on:mouseleave={() => {
    isMenuItemHover = false;
  }}
  on:mousedown={() => {
    isMenuItemClicked = true;
  }}
  on:mouseup={() => {
    isMenuItemClicked = false;
  }}
  class="d-flex px-2 justify-content-between border-radius-2 select-option-container"
  style={isMenuItemHover
    ? `background-color: var(--bg-ds-surface-400) `
    : `background-color: var(--bg-ds-surface-600)`}
  aria-selected={selectedRequest?.id === list.id}
  role="option"
  tabindex="0"
>
  <div class="content-wrapper">
    <p
      class="m-0 p-0 option-name ellipsis {getTextColor(
        list?.color,
      )} {extractBodyTextHighlight(list.id, selectedRequest?.id)}"
    >
      {list.name}
    </p>
    {#if list.description && showDescription}
      <div class="description-wrapper">
        <small class="text-textColor description">{list.description}</small>
      </div>
    {/if}
  </div>
  {#if selectedRequest?.id === list.id}
    <span class="d-flex align-items-center justify-content-center tick-icon">
      <CheckMarkIcon color="var(--text-primary-300)" size="medium" />
    </span>
  {/if}
</div>

<style>
  .select-option-container[tabindex="0"]:focus-visible {
    outline: 2px solid var(--border-ds-primary-300) !important;
    box-shadow: none !important;
    outline-offset: -2px !important;
    border-radius: 4px;
  }
  .select-option-container:active {
    background-color: var(--bg-ds-surface-700) !important;
    color: var(--text-ds-neutral-50);
    border-width: 0px;
  }
  .select-option-container {
    padding: 7px 0px;
  }
  .content-wrapper {
    flex: 1;
    min-width: 0;
  }

  .option-name {
    font-size: 12px;
    margin-bottom: 4px;
  }

  .description-wrapper {
    width: 100%;
    color: var(--text-ds-neutral-300);
  }

  .description {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    font-size: 11px;
    line-height: 1.3;
    word-break: break-word;
  }

  .tick-icon {
    height: 16px;
    width: 16px;
    margin-right: 4px;
  }

  /* hover states */
  .select-hover-highlight-dark-btn {
    background-color: var(--dull-background-color);
  }
  /* clicked states */
  .select-clicked-highlight-dark-btn {
    background-color: var(--bg-secondary-400);
  }

  .select-ticked-highlight-text {
    color: var(--text-ds-primary-300) !important;
  }

  /* others */
  .highlight {
    cursor: pointer;
  }
</style>
