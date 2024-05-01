<script lang="ts">
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
  export let selectedRequest: {
    id: string;
  };
  export let checkIcon: string;
  export let getTextColor: (color: any) => {};

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
  class="d-flex px-2 py-2 justify-content-between highlight rounded {extractHeaderHighlight(
    bodyTheme,
    isMenuItemHover,
    isMenuItemClicked,
  )}"
>
  <p
    class="m-0 p-0 {getTextColor(list?.color)} ellipsis"
    style="font-size: 12px;"
  >
    {list.name}<br />
    {#if list.description}
      <small class="text-textColor">{list.description}</small>
    {/if}
  </p>
  {#if selectedRequest?.id === list.id}
    <img src={checkIcon} alt="" />
  {/if}
</div>

<style>
  .select-hover-highlight-dark-btn {
    background-color: var(--dull-background-color);
  }
  .select-hover-highlight-violet-btn {
    background-color: var(--bg-tertiary-600);
  }
  .select-clicked-highlight-dark-btn {
    background-color: var(--dull-background-color);
  }
  .select-clicked-highlight-violet-btn {
    background-color: var(--bg-tertiary-700);
  }
  .highlight {
    cursor: pointer;
  }
</style>
