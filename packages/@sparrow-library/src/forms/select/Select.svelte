<script lang="ts">
  import { tickIcon } from "./svgs";
  import { onDestroy, onMount } from "svelte";
  import { SearchIcon } from "@sparrow/library/assets";
  import MenuItemsV1 from "./menu-items/MenuItemsV1.svelte";
  import { GitBranchIcon, DownArrowIcon } from "@sparrow/library/assets";
  import MenuItemsv2 from "./menu-items/MenuItemsv2.svelte";
  import { ArrowIcon } from "@sparrow/library/icons";
  import MenuItemsV3 from "./menu-items/MenuItemsV3.svelte";
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
  export let headerHeight = "34px";
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
    | "dark-violet2" = "dark";

  /**
   * Determines the background state for the Select body.
   */
  export let bodyTheme: "dark" | "blur" | "violet" = "dark";

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
  export let borderRounded = "2px";
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

  /**
   * typography
   */
  export let headerFontSize: string = "14px";
  export let headerFontWeight: number = 500;

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
    tabindex="0"
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
          {placeholderText}
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
              ? 'color:var(--text-secondary-200) !important'
              : ''}"
          >
            {selectedRequest?.name}
          </span>
        {/if}
      </p>
      <span class="d-flex ps-2" class:select-logo-active={isOpen}>
        {#if isDropIconFilled}
          <ArrowIcon
            width={"12"}
            height={"12"}
            color={disabled || selectedRequest?.hide
              ? "var( --icon-secondary-220)"
              : "var(--sparrow-text-color)"}
          />
        {:else}
          <DownArrowIcon
            width={"12"}
            height={"12"}
            color={disabled || selectedRequest?.hide
              ? "var( --icon-secondary-220)"
              : "var(--sparrow-text-color)"}
          />
        {/if}
      </span>
    </div>
  </div>

  <div
    bind:this={selectBodyWrapper}
    class="select-data {position === 'fixed'
      ? 'position-fixed'
      : 'position-absolute'}  {selectBodyBackgroundClass} p-1 border-radius-2
    {isOpen ? 'visible' : 'invisible'}"
    style="
      {isOpen
      ? 'opacity: 1; transform: scale(1);'
      : 'opacity: 0; transform: scale(0.8);'}
      min-width:{minBodyWidth}; left: {position === 'fixed'
      ? `${bodyLeftDistance}px;`
      : `0px;`} top: {position === 'fixed'
      ? `${bodyTopDistance}px;`
      : `${
          Number(headerHeight.replace(/\D/g, '')) + 5
        }px;`}  right: {position === 'fixed'
      ? `${bodyRightDistance}px;`
      : `0px;`} z-index:{zIndex};"
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
            <MenuItemsV1 {list} {selectedRequest} {tickIcon} {getTextColor} />
          {:else if menuItem === "v2"}
            <MenuItemsv2
              {list}
              {selectedRequest}
              {tickIcon}
              {bodyTheme}
              {getTextColor}
              {highlightTickedItem}
            />
          {:else if menuItem === "v3"}
            <MenuItemsV3 {list} {selectedRequest} {tickIcon} {getTextColor} />
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

  // hover or open-body states
  .select-btn-state-active-transparent {
    background-color: var(--bg-tertiary-700);
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

  // clicked states
  .select-btn-state-clicked-transparent {
    background-color: var(--bg-tertiary-700);
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
  //////////////////////////
  .select-data {
    color: white;
    border: 1px solid rgb(44, 44, 44);
    transition: 0.3s ease;
    -webkit-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
    -moz-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
  }
  .select-body-background-dark {
    background-color: var(--background-dropdown);
  }
  .select-body-background-violet {
    background-color: var(--bg-tertiary-400);
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
</style>
