<script lang="ts">
  import dropdown from "$lib/assets/dropdown.svg";
  import Dropdown from "$lib/assets/dropdown.svelte";
  import checkIcon from "$lib/assets/check.svg";
  import { afterUpdate, onDestroy, onMount } from "svelte";
  import { Events } from "$lib/utils/enums/mixpanel-events.enum";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import closeIcon from "$lib/assets/close.svg";
  type dropdownType = "text" | "img" | "checkbox";
  type dropdownHoverType = "add" | "remove";
  export let data: Array<{
    name: string;
    id: string;
    dynamicClasses: string;
    hide?: boolean;
    description?: string;
    selectedOptionClasses?: string;
    checked?: boolean;
    isInvalidOption?: boolean;
    img?: string;
    hasDivider?: boolean;
  }>;

  export let staticClasses: { id: string; classToAdd: string[] }[] = [];
  export let staticCustomStyles: {
    id: string;
    styleKey: string;
    styleValue: string;
  }[] = [];
  export let hoverClasses: { id: string; classToAdd: string[] }[] = [];
  export let activeClasses: string = "";
  export let dropdownDataContainer = "";
  export let additonalSelectedOptionText: string = "";
  export let additionalSelectedOptionHeading = "";
  export let additionalType: "environment" | "other" | "memberinfo" | "branch" =
    "other";

  export let onclick: (tab: string) => void;
  export let dropDownType: {
    type: dropdownType;
    title: string;
  };
  export let dropdownId: string = "";
  export let disabled: boolean = false;
  export let mixpanelEvent: Events = Events.NO_EVENT;
  export let showDropdownIcon: boolean = true;

  let selectedOption: {
    name: string;
    id: string;
    dynamicClasses: string;
    description?: string;
    selectedOptionClasses?: string;
    checked?: boolean;
    isInvalidOption?: boolean;
    img?: string;
    hasDivider?: boolean;
  };

  let isOpen: boolean = false;
  let isHover = false;

  function handleDropdownClick(event: MouseEvent) {
    const dropdownElement = document.getElementById(
      `${dropdownId}-dropdown-${dropDownType.title}`,
    );
    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
      isOpen = false;
      isHover = false;
    }
  }

  const toggleDropdown = () => {
    isOpen = !isOpen;
    isHover = !isHover;
    const dataElements = document.getElementsByClassName("dropdown-data");
    const headingElements = document.getElementsByClassName("dropdown-btn");
    for (const box of dataElements) {
      if (box.id !== `${dropdownId}-options-container`) {
        box.classList.remove("dropdown-active");
      }
    }
    for (const box of headingElements) {
      if (box.id !== `${dropdownId}-btn-div`) {
        box.classList.remove("dropdown-btn-hover");
      }
    }
    if (mixpanelEvent && mixpanelEvent !== Events.NO_EVENT) {
      MixpanelEvent(mixpanelEvent);
    }
  };

  $: {
    if (dropDownType?.title) {
      data.forEach((element) => {
        if (element?.id === dropDownType?.title) {
          selectedOption = element;
        }
      });
      if (!selectedOption && dropDownType.type !== "checkbox") {
        selectedOption = data[0];
      }
    }
  }

  onDestroy(() => {
    window.removeEventListener("click", handleDropdownClick);
  });

  function handleHover(elementId: string, handleType: dropdownHoverType) {
    if (hoverClasses && hoverClasses.length > 0) {
      let selectedHoverClasses = hoverClasses.filter((cls) => {
        return cls.id === elementId;
      })[0];
      if (selectedHoverClasses) {
        const elementDiv = document.getElementById(elementId) as HTMLElement;
        if (handleType === "add") {
          elementDiv.classList.add(...selectedHoverClasses.classToAdd);
        } else {
          selectedHoverClasses.classToAdd.forEach((cls) => {
            elementDiv.classList.remove(cls);
          });
        }
      }
    }
  }
  function handleStaticClasses() {
    staticClasses.length > 0 &&
      staticClasses.forEach((classes) => {
        const element = document.getElementById(classes.id);
        element?.classList.add(...classes.classToAdd);
      });
    staticCustomStyles?.length > 0 &&
      staticCustomStyles.forEach((stylesObj) => {
        const element = document.getElementById(stylesObj.id);
        if (element) {
          element.style[stylesObj.styleKey] = stylesObj.styleValue;
        }
      });
  }
  const countCheckedList = (list: any[]) => {
    let count = 0;
    list.forEach((element) => {
      if (element?.checked) {
        count++;
      }
    });
    return count;
  };

  onMount(() => {
    handleStaticClasses();
    window.addEventListener("click", handleDropdownClick);
  });
  afterUpdate(() => {
    handleStaticClasses();
  });
</script>

<div
  class="parent-dropdown display-inline-block"
  style=" position: relative;"
  on:click={handleDropdownClick}
>
  <div
    on:click={(event) => {
      event.stopPropagation();
      if (!disabled) {
        toggleDropdown();
      }
    }}
    id={`${dropdownId}-dropdown-${dropDownType.title}`}
  >
    {#if dropDownType.type === "text" || dropDownType.type === "checkbox"}
      <div
        id={`${dropdownId}-btn-div`}
        class="dropdown-btn d-flex align-items-center justify-content-between {isOpen
          ? activeClasses
          : ''} {isHover ? 'dropdown-btn-hover' : ''} "
        on:mouseenter={() => {
          handleHover(`${dropdownId}-btn-div`, "add");
        }}
        on:mouseleave={() => {
          handleHover(`${dropdownId}-btn-div`, "remove");
        }}
      >
        {#if dropDownType.type === "checkbox"}
          {#if !countCheckedList(data)}
            <p
              class="{disabled
                ? 'disabled-text'
                : ''} mb-0 w-100 {selectedOption?.dynamicClasses} {selectedOption?.selectedOptionClasses
                ? selectedOption.selectedOptionClasses
                : ''}"
            >
              {selectedOption?.name || ""}
              <span id={`${dropdownId}-additional-option`}
                >{additonalSelectedOptionText}</span
              >
            </p>
          {:else}
            <div class="me-4 navigator">
              {#each data as element}
                {#if element?.checked && !element?.isInvalidOption}
                  <span class="bg-backgroundDropdown p-1 ps-2 pe-0 rounded me-2"
                    >{element.name}
                    <img
                      src={closeIcon}
                      on:click={() => {
                        onclick(element.id);
                      }}
                    /></span
                  >
                {/if}
              {/each}
            </div>
          {/if}
        {:else if additionalSelectedOptionHeading && additionalType === "other"}
          <p
            class="{disabled
              ? 'disabled-text'
              : ''} mb-0 flex-shrink-0 me-1 {selectedOption?.dynamicClasses} {selectedOption?.selectedOptionClasses
              ? selectedOption.selectedOptionClasses
              : ''}"
            style="max-width: 15vh;"
          >
            {additonalSelectedOptionText}
          </p>
          <span
            style="font-size: 12px; width: fit-content;"
            id={`${dropdownId}-additional-option`}
            class="text-whiteColor">{additionalSelectedOptionHeading}</span
          >
        {:else if additionalType === "environment"}
          {#if selectedOption?.id === "none"}
            <p class=" mb-0 ellipsis text-textColor">Select Environment</p>
          {:else}
            <p class=" mb-0 ellipsis">
              <span class="text-sparrowBottomBorder">ENVIRONMENT</span>
              {selectedOption?.name || ""}
            </p>
          {/if}
        {:else if additionalType === "branch"}
          {#if selectedOption?.id === "not exist"}
            <p class=" mb-0 ellipsis text-textColor">Select Branch</p>
          {:else}
            <p class=" mb-0 ellipsis">
              <!-- <span class="text-sparrowBottomBorder">ENVIRONMENT</span> -->
              {selectedOption?.name}
            </p>
          {/if}
        {:else}
          <p
            class="{disabled
              ? 'disabled-text'
              : ''} mb-0 {selectedOption?.dynamicClasses} {selectedOption?.selectedOptionClasses
              ? selectedOption.selectedOptionClasses
              : ''}"
          >
            {selectedOption?.name}
          </p>
          <span style="font-size: 12px;" id={`${dropdownId}-additional-option`}
            >{additonalSelectedOptionText}</span
          >
        {/if}
        {#if showDropdownIcon}
          <span class:dropdown-logo-active={isOpen} style="margin-left: 10px;">
            <Dropdown
              height={12}
              width={12}
              color={disabled ? "var(--sparrow-text-color)" : "white"}
            />
          </span>
        {/if}
      </div>
    {:else}
      <div
        id={`${dropdownId}-img`}
        class="dropdownImg"
        style={isOpen ? "background-color: var(--send-button) !important;" : ""}
      >
        <img src={dropDownType.title} alt="+" />
      </div>
    {/if}
  </div>
  <div
    class="d-none dropdown-data border-1 border-dropdownBorderColor px-2 rounded dropdown-menu"
    class:dropdown-active={isOpen}
    id="{dropdownId}-options-container"
    style={`${dropdownDataContainer} ${
      additionalType === "memberinfo" ? "right: 5%" : ""
    }`}
  >
    {#each data as list}
      <div
        id="{dropdownId}-options-div"
        class="d-flex px-2 py-1 highlight text-break {list?.hide === true
          ? 'd-none'
          : ''}
          {dropDownType.type !== 'checkbox' ? 'justify-content-between' : ''}
          "
        on:click={(event) => {
          event.stopPropagation();
          if (dropDownType.type === "checkbox") {
            onclick(list.id);
          } else {
            isOpen = false;
            onclick(list.id);
          }
        }}
      >
        {#if dropDownType.type === "checkbox"}
          <label class="me-1">
            <input type="checkbox" bind:checked={list.checked} />
          </label>
        {/if}
        <p
          class="m-0 pt-1 {list?.dynamicClasses}"
          style="font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
          id="{dropdownId}-options-name"
          class:selected-request={list.id === selectedOption?.id}
        >
          {list.name}
          {#if list.description}
            <br />
            <small class="text-textColor">{list.description}</small>
          {/if}
        </p>

        {#if selectedOption?.id === list.id && dropDownType.type === "text"}
          <img src={checkIcon} alt="" />
        {:else if list?.img}
          <img src={list.img} />
        {/if}
      </div>
      {#if list?.hasDivider}
        <div style="margin-top:-10px"><hr class="dropdown-divider" /></div>
      {/if}
    {/each}
  </div>
</div>

<style>
  .dropdownImg:hover {
    border: 1px solid transparent;
  }
  .dropdownImg:hover {
    border: 1px solid var(--request-arc);
  }

  .dropdown-btn {
    background: none;
    outline: none;
    height: 26px;
    width: auto;
    padding: 0 10px;
  }

  .dropdown-data {
    color: white;
    position: absolute;
    z-index: 2;
    background-color: var(--background-dropdown);
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
  }

  .dropdown-btn p,
  .dropdown-data p {
    font-size: 12px;
    font-weight: 400;
  }
  .dropdown-active {
    display: block !important;
  }
  .dropdown-logo-active {
    transform: rotateX(180deg) !important;
  }
  .highlight {
    border-radius: 4px;
    cursor: pointer;
  }
  .highlight:hover {
    background-color: #232424;
    color: var(--sparrow-blue);
  }
  .dropdown-btn {
    cursor: pointer;
  }

  .disabled-text {
    color: var(--sparrow-text-color) !important;
  }
  .dropdown-btn-hover {
    background-color: var(--border-color);
  }
  .text-primaryColor {
    color: var(--sparrow-blue);
  }
</style>
