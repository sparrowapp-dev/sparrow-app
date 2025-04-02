<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { SearchIcon } from "@sparrow/library/assets";
  import MenuItemsV1 from "./menu-items/MenuItemsV1.svelte";
  import { GitBranchIcon } from "@sparrow/library/assets";
  import MenuItemsv2 from "./menu-items/MenuItemsv2.svelte";
  import MenuItemsV3 from "./menu-items/MenuItemsV3.svelte";
  import { CaretDownFilled, CaretDownRegular } from "@sparrow/library/icons";
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
    display?: string;
  }>;

  export let iconColor = "grey";

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
  let headerHeight = "28px";
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
    | "violet2"
    | "dark-violet"
    | "dark-violet2"
    | "primary"
    | "secondary" = "dark";

  /**
   * Determines the background state for the Select body.
   */
  export let bodyTheme: "dark" | "blur" | "violet" | "surface" = "dark";

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
  let borderRounded = "2px";
  /**
   * Determines the z-index of Select.
   */
  export let zIndex = 1;
  /**
   * Determines versions of the Select menu.
   */
  export let menuItem: "v1" | "v2" | "v3"  = "v1";
  /**
   * Determines icons used in Select header.
   */
  export let iconRequired = false;
  export let icon = GitBranchIcon;

  export let bodyDirection: "up" | "down" = "down";

  /**
   * typography
   */
  let headerFontSize: string = "12px";
  let headerFontWeight: number = 500;

  /**
   * ticked state
   */
  export let highlightTickedItem = true;

  /**
   * makes the dropdown unclickable
   */
  export let disabled = false;
  export let position: "absolute" | "fixed" = "fixed";
  export let placeholderText = "";
  export let isHeaderCombined = false;
  export let showDescription = true;

  export let isArrowIconRequired = true;

  export let bodyAlignment: 'right' | 'left' = 'right';

  export let size: "small" | "medium" | "large" | "extra-small" = "small";

  $: {
    if (size === "small") {
      headerFontSize = "12px";
      headerHeight = "28px";
    } else if (size === "medium") {
      headerFontSize = "12px";
      headerHeight = "36px";
    } else if (size === "large") {
      headerFontSize = "12px";
      headerHeight = "36px";
    } else {
      headerFontSize = "12px";
      headerHeight = "36px";
    }
  }
  let selectHeaderWrapper: HTMLElement;
  let selectBodyWrapper: HTMLElement;

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
    display?: string;
    logo?: string;
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
    case "violet2":
      selectBackgroundClass = "select-background-violet2";
      break;
    case "dark-violet":
      selectBackgroundClass = "select-background-dark-violet";
      break;
    case "dark-violet2":
      selectBackgroundClass = "select-background-dark-violet2";
      break;
    case "primary":
      selectBackgroundClass = "select-background-primary";
      break;
    case "secondary":
      selectBackgroundClass = "select-background-secondary";
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
      break;
    case "surface":
      selectBodyBackgroundClass = "select-body-background-surface";
      break;
  }

  let bodyLeftDistance: number;
  let bodyRightDistance: number;
  let bodyTopDistance: number;
  const toggleSelect = () => {
    const bodyHeight =
      data.filter((element) => {
        return !element.hide;
      }).length * 36;
    bodyLeftDistance = selectHeaderWrapper.getBoundingClientRect().left;
    bodyTopDistance =
      bodyHeight + selectHeaderWrapper.getBoundingClientRect().bottom >
      window.innerHeight
        ? selectHeaderWrapper.getBoundingClientRect().top - 5 - bodyHeight
        : 5 + selectHeaderWrapper.getBoundingClientRect().bottom;
    bodyRightDistance =
      window.innerWidth - selectHeaderWrapper.getBoundingClientRect().right;
    isOpen = !isOpen;
  };

  $: {
    if (titleId) {
      data.forEach((element) => {
        if (element.id === titleId && element.display !== "none") {
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
    if (_isClicked && _isHover && headerHighlight !== "") {
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
        case "violet2":
          x = "violet2";
          break;
        case "dark-violet":
          x = "dark-violet";
          break;
        case "dark-violet2":
          x = "dark-violet2";
          break;
        case "primary":
          x = "primary";
          break;
        case "secondary":
          x = "secondary";
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
        case "violet2":
          x = "violet2";
          break;
        case "dark-violet":
          x = "dark-violet";
          break;
        case "dark-violet2":
          x = "dark-violet2";
          break;
        case "primary":
          x = "primary";
          break;
        case "secondary":
          x = "secondary";
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
      return "color-primary";
    } else if (_color === "danger") {
      return "color-danger";
    } else if (_color === "dark") {
      return "color-default";
    } else if (_color === "light") {
      return "color-white";
    } else if (_color === "success") {
      return "color-get";
    } else if (_color === "warning") {
      return "color-post";
    } else if (_color === "secondary") {
      return "color-put";
    } else if (_color === "patch") {
      return "color-patch";
    } else {
      return "color-grey";
    }
  };
</script>

<div
  class="parent-select display-inline-block cursor-pointer"
  bind:this={selectHeaderWrapper}
  style=" position: relative;{disabled ? 'pointer-events: none;' : ''}"
  id={`color-select-${id}`}
>
  <div
    on:click={() => {
      if (!disabled) {
        toggleSelect();
      }
    }}
    role="button"
    on:keydown={() => {}}
  >
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
      {selectBorderClass}
      {extractBorderHighlight(borderHighlight, isHover, isOpen)}
      {isError ? selectErrorBorderClass : ''}
        d-flex align-items-center justify-content-between"
      style="min-width:{minHeaderWidth}; max-width:{maxHeaderWidth}; border-radius: {borderRounded}; height: {headerHeight};"
    >
      <p
        class=" mb-0 d-flex align-items-center ellipsis text-{selectedRequest?.color}"
      >
        {#if iconRequired}
          <span class="me-2" style="margin-top: -2px;"
            ><Icon height={14} width={14} color={iconColor} /></span
          >
        {/if}

        {#if placeholderText && !selectedRequest}
          <span
            class="ellipsis"
            style="font-weight: {headerFontWeight}; font-size: {headerFontSize};"
          >
            {placeholderText}
          </span>
        {:else if isHeaderCombined}
          <div class="d-flex ellipsis">
            <span
              class="ellipsis {selectedRequest?.default
                ? 'text-textColor'
                : getTextColor(selectedRequest?.color)}"
              style="font-weight: {headerFontWeight}; font-size: {headerFontSize};"
            >
              {selectedRequest?.description ?? ""}
            </span>
            <span
              class="ellipsis me-3 {selectedRequest?.default
                ? 'text-textColor'
                : getTextColor(selectedRequest?.color)}"
              style="font-weight: {headerFontWeight}; font-size: {headerFontSize};"
            >
              /{selectedRequest?.name ?? ""}
            </span>
          </div>
        {:else}
          <span
            class="ellipsis me-3 {selectedRequest?.default
              ? 'text-textColor'
              : getTextColor(selectedRequest?.color)}"
            style="font-weight: {headerFontWeight}; font-size: {headerFontSize}; {disabled ||
            selectedRequest?.hide
              ? 'color:var(--bg-ds-nuetral-100) !important'
              : ''}"
          >
            {selectedRequest?.name}
          </span>
        {/if}
      </p>
      <span
        class="d-flex ps-2 {!isArrowIconRequired ? 'd-none' : ''}"
        class:select-logo-active={isOpen}
      >
        <CaretDownFilled size={"16px"}/>
      </span>
    </div>
  </div>

  <div
    bind:this={selectBodyWrapper}
    class="select-data {position === 'fixed'
      ? 'position-fixed'
      : 'position-absolute'} {selectBodyBackgroundClass}  border-radius-2
    {isOpen ? 'visible' : 'invisible'}"
    style="
  {isOpen
      ? 'opacity: 1; transform: scale(1);'
      : 'opacity: 0; transform: scale(0.8);'}
  min-width:{minBodyWidth}; 
  left: {position === 'fixed'
      ? bodyAlignment === 'right'
        ? `${bodyLeftDistance}px;`
        : `${bodyLeftDistance - (selectBodyWrapper?.offsetWidth || 0) + selectHeaderWrapper.offsetWidth}px;`
      : bodyAlignment === 'right'
        ? '0px;'
        : 'auto;'} 
  top: {bodyDirection === 'down'
      ? position === 'fixed'
        ? `${bodyTopDistance}px;`
        : `${Number(headerHeight.replace(/\D/g, '')) + 5}px;`
      : position === 'fixed'
        ? `${selectHeaderWrapper.getBoundingClientRect().top - selectBodyWrapper.offsetHeight}px;`
        : `-${selectBodyWrapper?.offsetHeight + 5}px;`};  
  right: {position === 'fixed'
      ? bodyAlignment === 'right'
        ? `${bodyRightDistance}px;`
        : 'auto;'
      : bodyAlignment === 'right'
        ? '0px;'
        : '0px;'} 
  z-index:{zIndex}; 
  padding: 8px 6px;
  "
  >
    <div
      on:click={() => {
        isOpen = false;
      }}
      role="button"
      tabindex="0"
      class="main-container"
      on:keydown={() => {}}
    >
      <slot name="pre-select" />
    </div>
    {#if search}
      <div class="position-relative">
        <input
          type="text"
          class="inputField searchField border-radius-2 border-0 p-2 w-100 bg-backgroundDark"
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
          class="{list.hide ? 'd-none' : ''} {list?.disabled
            ? 'disabled-option'
            : ''}"
          on:click={() => {
            isOpen = false;
            onclick(list.id);
          }}
          role="button"
          on:keydown={() => {}}
        >
          {#if menuItem === "v1"}
            <MenuItemsV1
              {list}
              fontSize={headerFontSize}
              {selectedRequest}
              {getTextColor}
            />
          {:else if menuItem === "v2"}
            <MenuItemsv2
              {list}
              fontSize={headerFontSize}
              {selectedRequest}
              {bodyTheme}
              {getTextColor}
              {highlightTickedItem}
              {showDescription}
            />
          {:else if menuItem === "v3"}
            <MenuItemsV3
              {list}
              fontSize={headerFontSize}
              {selectedRequest}
              {getTextColor}
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
</div>
 

<style lang="scss">
  .select-btn {
    outline: none;
    border: none;
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
  .select-background-violet2 {
    background-color: var(--bg-tertiary-300);
  }
  .select-background-dark-violet {
    background-color: var(--bg-secondary-600);
  }
  .select-background-dark-violet2 {
    background-color: var(--bg-tertiary-500);
  }
  .select-background-primary {
    background-color: transparent;
  }
  .select-background-secondary {
    background-color: var(--bg-ds-surface-600);
  }

  // hover or open-body states
  .select-btn-state-active-transparent {
    background-color: var(--bg-ds-surface-600);
  }
  .select-btn-state-active-dark {
    background-color: var(--bg-secondary-600);
  }
  .select-btn-state-active-violet {
    background-color: var(--bg-tertiary-600);
  }
  .select-btn-state-active-violet2 {
    background-color: var(--bg-tertiary-600);
  }
  .select-btn-state-active-dark-violet {
    background-color: var(--bg-tertiary-600);
  }
  .select-btn-state-active-dark-violet2 {
    background-color: var(--bg-tertiary-600);
  }
  .select-btn-state-active-primary {
    background-color: var(--bg-ds-surface-400);
  }
  .select-btn-state-active-secondary {
    background-color: var(--bg-ds-surface-600);
  }

  // clicked states
  .select-btn-state-clicked-transparent {
    background-color: var(--bg-ds-surface-500);
  }
  .select-btn-state-clicked-dark {
    background-color: var(--bg-secondary-400);
  }
  .select-btn-state-clicked-violet {
    background-color: var(--bg-tertiary-700);
  }
  .select-btn-state-clicked-violet2 {
    background-color: var(--bg-tertiary-700);
  }
  .select-btn-state-clicked-dark-violet {
    background-color: var(--bg-tertiary-700);
  }
  .select-btn-state-clicked-dark-violet2 {
    background-color: var(--bg-tertiary-700);
  }
  .select-btn-state-clicked-primary {
    background-color: var(--bg-ds-surface-500);
  }
  .select-btn-state-clicked-secondary {
    background-color: var(--bg-ds-surface-500);
  }

  // focused
  .select-background-transparent:focus-visible {
    border: 2px solid var(--border-ds-primary-300);
    outline: none !important;
    background-color: transparent;
  }
  .select-background-primary:focus-visible {
    border: 2px solid var(--border-ds-primary-300);
    outline: none !important;
    background-color: transparent;
  }
  .select-background-secondary:focus-visible {
    border: 2px solid var(--border-ds-primary-300);
    outline: none !important;
    border-radius: 4px !important;
  }

  .select-body-background-dark {
    background-color: var(--background-dropdown) !important;
  }
  .select-body-background-violet {
    background-color: var(--bg-tertiary-400) !important;
  }
  .select-body-background-surface {
    background-color: var(--bg-ds-surface-600) !important;
  }
  .select-body-background-blur {
    background: var(--background-hover) !important;
    backdrop-filter: blur(2px);
  }
  .select-btn p,
  .select-data p {
    font-size: 12px;
    font-weight: 400;
  }
  .select-data{
    background-color: var(--bg-ds-surface-600);
  }
  .select-active {
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
    border: 1px solid var(--bg-primary-300);
  }

  .select-active-border-bottom {
    border: none;
    border-bottom: 1px solid var(--bg-primary-300);
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
  .select-btn:hover{
    background-color: var(--bg-ds-surface-400) !important;
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
    color: var(--text-ds-neutral-200);
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
