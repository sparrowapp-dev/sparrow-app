<script lang="ts">
  import checkIcon from "$lib/assets/check.svg";
  import { onDestroy, onMount } from "svelte";
  import { slide } from "svelte/transition";
  import { SearchIcon } from "$lib/assets/icons";
  import MenuItemsV1 from "./menu-items/MenuItemsV1.svelte";
  import { GitBranchIcon, DownArrowIcon } from "$lib/assets/icons";
  import MenuItemsv2 from "./menu-items/MenuItemsv2.svelte";
  import { ArrowIcon, CheckIcon } from "@library/icons";
  /**
   * Determines id of the menu item.
   */
  export let titleId: string;
  /**
   * Determines Menu Item data.
   */
  export let data: Array<{
    name: string;
    id: string;
    description?: string;
    color?:
      | "primary"
      | "danger"
      | "dark"
      | "light"
      | "success"
      | "warning"
      | "secondary"
      | "patch";
    default?: boolean;
    hide?: boolean;
    disabled?: boolean;
  }>;

  /**
   * Callback to parent component.
   */
  export let onclick: (tab: string) => void;

  /**
   * Determines unique id of Select.
   */
  export let id: string;

  /**
   * Determines unselected Select.
   */
  export let isError: boolean = false;

  /**
   * Determines the dimensions of a Select.
   */
  export let maxBodyHeight = "200px";
  export let minHeaderWidth = "50px";
  export let maxHeaderWidth = "500px";
  export let minBodyWidth = "50px";

  /**
   * Determines search bar Select body.
   */
  export let search = false;
  export let searchText = "Search";
  export let searchErrorMessage = "No value found.";

  /**
   * Determines the border positioning state for the Select header.
   */
  export let borderType: "all" | "bottom" | "none" = "all"; // normal case
  export let borderActiveType: "all" | "bottom" | "none" = "all"; // active case

  /**
   * Determines the icon state for the Select header.
   */
  export let isDropIconFilled: boolean = false; // normal case

  /**
   * Determines the background state for the Select header.
   */
  export let headerTheme:
    | "dark"
    | "transparent"
    | "violet"
    | "dark-violet"
    | "grey" = "dark";

  /**
   * Determines the background state for the Select body.
   */
  export let bodyTheme: "dark" | "blur" | "violet" | "grey" = "dark";

  /**
   * Determines the background highlighting state for the Select header.
   */
  export let headerHighlight: "active" | "hover" | "hover-active" | "" =
    "hover-active";
  /**
   * Determines the border highlighting state for the Select header.
   */
  export let borderHighlight: "active" | "hover" | "hover-active" | "" =
    "hover-active";
  /**
   * Determines the border radius of Select header.
   */
  export let borderRounded = true;
  /**
   * Determines the z-index of Select.
   */
  export let zIndex = 1;
  /**
   * Determines versions of the Select menu.
   */
  export let menuItem: "v1" | "v2" | "v3" = "v1";
  /**
   * Determines icons used in Select header.
   */
  export let iconRequired = false;
  export let icon = GitBranchIcon;
  export let checkIconColor = "white";

  let selectWrapper: HTMLElement;

  const Icon = icon;
  let searchData = "";
  let isOpen = false;
  let isHover = false;
  let isClicked = false;
  let selectedRequest: {
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
    default?: boolean;
    description?: string;
    hide?: boolean;
    disabled?: boolean;
  };

  let selectBorderClass = "";
  switch (borderType) {
    case "none":
      selectBorderClass = "select-border-none";
      break;
    case "all":
      selectBorderClass = "select-border-all";
      break;
    case "bottom":
      selectBorderClass = "select-border-bottom";
      break;
  }

  let selectActiveBorderClass = "";
  let selectErrorBorderClass = "";
  switch (borderActiveType) {
    case "none":
      selectActiveBorderClass = "select-active-border-none";
      selectErrorBorderClass = "select-error-border-none";
      break;
    case "all":
      selectActiveBorderClass = "select-active-border-all";
      selectErrorBorderClass = "select-error-border-all";
      break;
    case "bottom":
      selectActiveBorderClass = "select-active-border-bottom";
      selectErrorBorderClass = "select-error-border-bottom";
      break;
  }

  let selectBackgroundClass = "";
  switch (headerTheme) {
    case "transparent":
      selectBackgroundClass = "select-background-transparent";
      break;
    case "dark":
      selectBackgroundClass = "select-background-dark";
      break;
    case "violet":
      selectBackgroundClass = "select-background-violet";
      break;
    case "dark-violet":
      selectBackgroundClass = "select-background-dark-violet";
      break;
  }

  let selectBodyBackgroundClass = "";
  switch (bodyTheme) {
    case "blur":
      selectBodyBackgroundClass = "select-body-background-blur";
      break;
    case "dark":
      selectBodyBackgroundClass = "select-body-background-dark";
      break;
    case "violet":
      selectBodyBackgroundClass = "select-body-background-violet";
    case "grey":
      selectBodyBackgroundClass = "select-body-background-grey";
  }

  let leftDistance: number;
  let bottomDistance: number;
  let rightDistance: number;
  const toggleSelect = () => {
    leftDistance = selectWrapper.getBoundingClientRect().left;
    rightDistance = selectWrapper.getBoundingClientRect().right;
    bottomDistance = selectWrapper.getBoundingClientRect().bottom;
    isOpen = !isOpen;
  };

  $: {
    if (titleId) {
      data.forEach((element) => {
        if (element.id === titleId) {
          selectedRequest = element;
        }
      });
    }
  }

  function handleSelectClick(event: MouseEvent) {
    const selectElement = document.getElementById(`color-select-${id}`);
    if (selectElement && !selectElement.contains(event.target as Node)) {
      isOpen = false;
    }
  }

  onDestroy(() => {
    window.removeEventListener("click", handleSelectClick);
  });

  onMount(() => {
    window.addEventListener("click", handleSelectClick);
  });

  const extractHeaderHighlight = (
    _headerHighlight: string,
    _isOpen: boolean,
    _isHover: boolean,
    _isClicked: boolean,
  ) => {
    if (_isClicked && _isHover) {
      let x;
      switch (headerTheme) {
        case "transparent":
          x = "transparent";
          break;
        case "dark":
          x = "dark";
          break;
        case "violet":
          x = "violet";
          break;
        case "dark-violet":
          x = "dark-violet";
          break;
        case "grey":
          x = "grey";
          break;
      }
      return `select-btn-state-clicked-${x}`;
    }
    if (
      (_headerHighlight === "hover" && isHover) ||
      (_headerHighlight === "active" && _isOpen) ||
      (_headerHighlight === "hover-active" && (_isOpen || isHover))
    ) {
      let x;
      switch (headerTheme) {
        case "transparent":
          x = "transparent";
          break;
        case "dark":
          x = "dark";
          break;
        case "violet":
          x = "violet";
          break;
        case "dark-violet":
          x = "dark-violet";
        case "grey":
          x = "grey";
          break;
      }
      return `select-btn-state-active-${x}`;
    } else {
      return "";
    }
  };
  const extractBorderHighlight = (
    _borderHighlight: string,
    _isHover: boolean,
    _isOpen: boolean,
  ) => {
    if (
      (_borderHighlight === "hover" && _isHover) ||
      (_borderHighlight === "active" && _isOpen) ||
      (_borderHighlight === "hover-active" && (_isOpen || _isHover))
    ) {
      return selectActiveBorderClass;
    } else {
      return "";
    }
  };

  const getTextColor = (_color: any) => {
    if (_color === "primary") {
      return "text-primaryColor";
    } else if (_color === "danger") {
      return "text-dangerColor";
    } else if (_color === "dark") {
      return "text-defaultColor";
    } else if (_color === "light") {
      return "text-whiteColor";
    } else if (_color === "success") {
      return "text-getColor";
    } else if (_color === "warning") {
      return "text-postColor";
    } else if (_color === "secondary") {
      return "text-putColor";
    } else if (_color === "patch") {
      return "text-patchColor";
    } else {
      return "text-whiteColor";
    }
  };
</script>

<div
  class="parent-select display-inline-block cursor-pointer"
  bind:this={selectWrapper}
  style=" position: relative; z-index:{zIndex};"
  id={`color-select-${id}`}
>
  <div on:click={toggleSelect} role="button" tabindex="0" on:keydown={() => {}}>
    <div
      role="button"
      tabindex="0"
      on:keydown={() => {}}
      on:mouseenter={() => {
        isHover = true;
      }}
      on:mouseleave={() => {
        isHover = false;
      }}
      on:mousedown={() => {
        isClicked = true;
      }}
      on:mouseup={() => {
        isClicked = false;
      }}
      class="select-btn
      {selectBackgroundClass} 
      {extractHeaderHighlight(headerHighlight, isOpen, isHover, isClicked)}  
      {borderRounded ? 'rounded' : ''}  
      {selectBorderClass} 
      {extractBorderHighlight(borderHighlight, isHover, isOpen)} 
      {isError ? selectErrorBorderClass : ''}
        d-flex align-items-center justify-content-between"
      style="min-width:{minHeaderWidth}; max-width:{maxHeaderWidth};"
    >
      <p class=" mb-0 ellipsis text-{selectedRequest?.color}">
        {#if iconRequired}
          <span
            ><Icon
              height={12}
              width={12}
              color={"var(--sparrow-text-color)"}
            /></span
          >
        {/if}
        <span
          class={selectedRequest?.default
            ? "text-textColor"
            : getTextColor(selectedRequest?.color)}
        >
          {selectedRequest?.name}
        </span>
      </p>
      <span class="d-flex ps-2" class:select-logo-active={isOpen}>
        {#if isDropIconFilled}
          <ArrowIcon />
        {:else}
          <DownArrowIcon
            width={12}
            height={14}
            color={"var(--sparrow-text-color)"}
          />
        {/if}
      </span>
    </div>
  </div>

  {#if isOpen}
    <div
      class="d-none z-2 select-data position-fixed {selectBodyBackgroundClass} p-1 border-radius-2"
      class:select-active={isOpen}
      style="min-width:{minBodyWidth}; left: {leftDistance}px; top: {5 +
        bottomDistance}px; right: {window.innerWidth -
        rightDistance}px; z-index:{zIndex};"
      transition:slide={{ duration: 100 }}
    >
      <div
        on:click={() => {
          isOpen = false;
        }}
        role="button"
        tabindex="0"
        on:keydown={() => {}}
      >
        <slot name="pre-select" />
      </div>
      {#if search}
        <div class="position-relative">
          <input
            type="text"
            class="inputField searchField rounded border-0 p-2 w-100 bg-backgroundDark"
            style="font-size: 12px; font-weight:500; padding-left:35px !important;"
            placeholder={searchText}
            bind:value={searchData}
          />
          <span
            class="position-absolute"
            style="top:5px;
                  left: 10px"
          >
            <SearchIcon height={16} width={16} color={"var(--defaultcolor)"} />
          </span>
          <hr class="my-2" />
        </div>
      {/if}
      <div style="max-height:{maxBodyHeight}; overflow:auto;">
        {#each data.filter((element) => {
          return element.name.toLowerCase().includes(searchData.toLowerCase());
        }) as list}
          <div
            class=" {list.hide ? 'd-none' : ''} {list?.disabled
              ? 'disabled-option'
              : ''}"
            on:click={() => {
              isOpen = false;
              onclick(list.id);
            }}
            role="button"
            tabindex="0"
            on:keydown={() => {}}
          >
            {#if menuItem === "v1"}
              <MenuItemsV1
                {list}
                {selectedRequest}
                {checkIcon}
                {getTextColor}
              />
            {:else if menuItem === "v2"}
              <MenuItemsv2
                {list}
                {selectedRequest}
                {CheckIcon}
                {bodyTheme}
                {getTextColor}
                {checkIconColor}
              />
            {/if}
          </div>
        {/each}
      </div>
      {#if data.filter((element) => {
        return element.name.toLowerCase().includes(searchData.toLowerCase());
      }).length === 0 && search}
        <div class="p-2">
          <p class="sparrow-fs-12 mb-0 text-textColor text-center">
            {searchErrorMessage}
          </p>
        </div>
      {/if}
      <div
        on:click={() => {
          isOpen = false;
        }}
        role="button"
        tabindex="0"
        on:keydown={() => {}}
      >
        <slot name="post-select" />
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .select-btn {
    outline: none;
    border: none;
    height: 34px;
    width: auto;
    padding: 0 10px;
  }
  // default states
  .select-background-transparent {
    background-color: transparent;
  }
  .select-background-dark {
    background-color: var(--blackColor);
  }
  .select-background-violet {
    background-color: var(--bg-tertiary-400);
  }
  .select-background-dark-violet {
    background-color: var(--bg-secondary-600);
  }

  // hover or open-body states
  .select-btn-state-active-transparent {
    background-color: var(--bg-tertiary-700);
  }
  .select-btn-state-active-dark {
    background-color: var(--border-color);
  }
  .select-btn-state-active-violet {
    background-color: var(--bg-tertiary-600);
  }
  .select-btn-state-active-dark-violet {
    background-color: var(--bg-tertiary-600);
  }
  .select-btn-state-active-grey {
    background-color: var(--dropdown-container);
  }

  // clicked states
  .select-btn-state-clicked-transparent {
    background-color: var(--bg-tertiary-700);
  }
  .select-btn-state-clicked-dark {
    background-color: var(--border-color);
  }
  .select-btn-state-clicked-violet {
    background-color: var(--bg-tertiary-700);
  }
  .select-btn-state-clicked-dark-violet {
    background-color: var(--bg-tertiary-700);
  }
  .select-btn-state-clicked-grey {
    background-color: var(--bg-tertiary-700);
  }
  //////////////////////////
  .select-data {
    color: white;
    border: 1px solid rgb(44, 44, 44);
  }
  .select-body-background-dark {
    background-color: var(--background-dropdown);
  }
  .select-body-background-violet {
    background-color: var(--bg-tertiary-400);
  }
  .select-body-background-grey {
    background-color: var(--dropdown-container);
  }
  .select-body-background-blur {
    background: var(--background-hover);
    backdrop-filter: blur(2px);
  }
  .select-btn p,
  .select-data p {
    font-size: 12px;
    font-weight: 400;
  }
  .select-active {
    display: block !important;
  }
  .select-logo-active {
    transform: rotateX(180deg) !important;
  }

  input {
    outline: none;
  }

  .select-border-none {
    border: none;
  }

  .select-border-all {
    border: 1px solid var(--border-color);
  }

  .select-border-bottom {
    border-bottom: 1px solid var(--border-color);
  }

  .select-active-border-none {
    border: none;
  }

  .select-active-border-all {
    border: none;
    border: 1px solid var(--send-button);
  }

  .select-active-border-bottom {
    border: none;
    border-bottom: 1px solid var(--send-button);
  }

  .select-error-border-none {
    border: none !important;
  }

  .select-error-border-all {
    border: none !important;
    border: 1px solid var(--error--color) !important;
  }

  .select-error-border-bottom {
    border: none !important;
    border-bottom: 1px solid var(--error--color) !important;
  }

  .cursor-pointer {
    cursor: pointer;
  }

  input:focus {
    border: 1px solid var(--send-button) !important;
    caret-color: var(--send-button) !important;
  }
  .disabled-option {
    pointer-events: none; /* Disable pointer events */
    opacity: 0.6; /* Reduce opacity to visually indicate disabled state */
    color: lightgray; /* Change background color for visual differentiation */
    /* Add any other styles to indicate the disabled state */
  }
</style>
