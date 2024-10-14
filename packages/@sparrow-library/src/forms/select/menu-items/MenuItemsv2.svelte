<script lang="ts">
  /**
   * select option list
   */
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
  export let tickIcon: any;
  export let getTextColor: (color: any) => {};
  /**
   * marks the tickmark is highlighted
   */
  export let highlightTickedItem: boolean;

  /**
   * body theme - background
   */
  export let bodyTheme: string;

  let isMenuItemHover = false;
  let isMenuItemClicked = false;

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
    if (_bodyTheme === "violet" && _isMenuItemClicked && _isMenuItemHover) {
      return `select-clicked-highlight-violet-btn`;
    } else if (
      _bodyTheme === "dark" &&
      _isMenuItemClicked &&
      _isMenuItemHover
    ) {
      return `select-clicked-highlight-dark-btn`;
    } else if (_bodyTheme === "violet" && _isMenuItemHover) {
      return `select-hover-highlight-violet-btn`;
    } else if (_bodyTheme === "dark" && _isMenuItemHover) {
      return `select-hover-highlight-dark-btn`;
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
  class="d-flex px-2 py-2 justify-content-between highlight border-radius-2 {extractHeaderHighlight(
    bodyTheme,
    isMenuItemHover,
    isMenuItemClicked,
  )}"
>
  <p
    class="m-0 p-0 {getTextColor(
      list?.color,
    )} ellipsis {extractBodyTextHighlight(list.id, selectedRequest?.id)}"
    style="font-size: 12px;"
  >
    {list.name}<br />
    {#if list.description}
      <small class="text-textColor">{list.description}</small>
    {/if}
  </p>
  {#if selectedRequest?.id === list.id}
    <span
      class="d-flex align-items-center justify-content-center"
      style="height:16px; width:16px;"
    >
      <!-- <CheckIcon
        color={highlightTickedItem ? "var(--text-primary-200)" : "white"}
      /> -->
      <img src={tickIcon} alt="" />
    </span>
  {/if}
</div>

<style>
  /* hover states */
  .select-hover-highlight-dark-btn {
    background-color: var(--dull-background-color);
  }
  .select-hover-highlight-violet-btn {
    background-color: var(--bg-tertiary-600);
  }

  /* clicked states */
  .select-clicked-highlight-dark-btn {
    background-color: var(--bg-secondary-400);
  }
  .select-clicked-highlight-violet-btn {
    background-color: var(--bg-tertiary-700);
  }

  .select-ticked-highlight-text {
    color: var(--text-primary-300) !important;
  }

  /* others */
  .highlight {
    cursor: pointer;
  }
</style>
