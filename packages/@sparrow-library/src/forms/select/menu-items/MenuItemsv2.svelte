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
    icon?: string;
    iconProps?: Record<string, any>;
  };
  /**
   * selected option
   */
  export let selectedRequest: {
    id: string;
  };

  export let showDescription = true;

  export let getTextColor: (color: any) => string;
  /**
   * marks the tickmark is highlighted
   */
  export let highlightTickedItem: boolean;

  /**
   * body theme - background
   */
  export let variant: "primary" | "secondary" = "secondary";

  let isMenuItemHover = false;
  let isMenuItemClicked = false;

  export let fontSize;

  /**
   * @description - adds CSS class to menu item when hovered or clicked according to the theme
   * @param _bodyTheme - identifies body theme for example dark, light, or violet
   * @param _isMenuItemHover - identifies if menu item is hovered
   * @param _isMenuItemClicked - identifies if menu item is clicked
   */
  const extractHeaderHighlight = (
    _bodyTheme: string,
    _isMenuItemHover: boolean,
    _isMenuItemClicked: boolean,
  ) => {
    if (_bodyTheme === "primary" && _isMenuItemClicked && _isMenuItemHover) {
      return `select-clicked-highlight-surface-btn`;
    } else if (
      _bodyTheme === "secondary" &&
      _isMenuItemClicked &&
      _isMenuItemHover
    ) {
      return `select-clicked-highlight-surface-btn`;
    } else if (
      _bodyTheme === "tertiary" &&
      _isMenuItemClicked &&
      _isMenuItemHover
    ) {
      return `select-clicked-highlight-surface-btn`;
    } else if (
      _bodyTheme === "light-violet" &&
      _isMenuItemClicked &&
      _isMenuItemHover
    ) {
      return `select-clicked-highlight-surface-btn`;
    } else if (_bodyTheme === "primary" && _isMenuItemHover) {
      return `select-hover-highlight-surface-btn`;
    } else if (_bodyTheme === "secondary" && _isMenuItemHover) {
      return `select-hover-highlight-surface-btn`;
    } else if (_bodyTheme === "tertiary" && _isMenuItemHover) {
      return `select-hover-highlight-surface-btn`;
    } else if (_bodyTheme === "light-violet" && _isMenuItemHover) {
      return `select-hover-highlight-surface-btn`;
    } else {
      return "";
    }
  };
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
  class="d-flex px-2 py-2 justify-content-between highlight border-radius-2 select-option-container {extractHeaderHighlight(
    variant,
    isMenuItemHover,
    isMenuItemClicked,
  )}"
  tabindex="0"
>
  {#if list.icon}
    <div class="me-2">
      <svelte:component
        this={list.icon}
        {...list.iconProps}
        class="menu-icon"
      />
    </div>
  {/if}

  <div class="content-wrapper">
    <p
      style="font-size: {fontSize}"
      class="m-0 p-0 ellipsis option-name {getTextColor(
        list?.color,
      )} {extractBodyTextHighlight(list.id, selectedRequest?.id)}"
    >
      {list.name}
    </p>
    {#if list.description && showDescription}
      <div class="description-wrapper">
        <small class="text-textColor description" style="font-size: {fontSize}"
          >{list.description}</small
        >
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
  .select-option-container {
    width: 100%;
  }
  .select-option-container:focus-visible {
    outline: 2px solid var(--bg-ds-primary-300);
    outline-offset: -2px;
    border-radius: 4px;
  }

  .content-wrapper {
    flex: 1;
    min-width: 0;
  }

  .option-name {
    margin-bottom: 4px;
  }

  .description-wrapper {
    width: 100%;
  }

  .description {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    line-height: 1.3;
    word-break: break-word;
  }

  .tick-icon {
    height: 16px;
    width: 16px;
    flex-shrink: 0;
    margin-left: 8px;
  }

  /* hover states */
  .select-hover-highlight-dark-btn {
    background-color: var(--dull-background-color);
  }
  .select-hover-highlight-violet-btn {
    background-color: var(--bg-tertiary-600);
  }
  .select-hover-highlight-surface-btn {
    background-color: var(--bg-ds-surface-400);
  }

  /* clicked states */
  .select-clicked-highlight-dark-btn {
    background-color: var(--bg-secondary-400);
  }
  .select-clicked-highlight-violet-btn {
    background-color: var(--bg-tertiary-700);
  }
  .select-clicked-highlight-surface-btn {
    background-color: var(--bg-ds-surface-500);
  }

  .select-ticked-highlight-text {
    color: var(--text-primary-300) !important;
  }

  /* others */
  .highlight {
    cursor: pointer;
  }

  .color-primary {
    color: var(--text-ds-primary-300);
  }

  .color-danger {
    color: var(--text-ds-danger-300);
  }

  .color-default {
    color: var(--text-ds-surface-500);
  }

  .color-white {
    color: var(--text-ds-neutral-50);
  }

  .color-get {
    color: var(--text-ds-success-300);
  }

  .color-post {
    color: var(--text-ds-warning-300);
  }

  .color-put {
    color: var(--text-ds-secondary-300);
  }

  .color-patch {
    color: var(--bg-ds-accent-300);
  }
</style>
