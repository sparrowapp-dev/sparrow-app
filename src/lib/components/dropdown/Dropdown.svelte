<script lang="ts">
  import dropdown from "$lib/assets/dropdown.svg";
  import checkIcon from "$lib/assets/check.svg";
  import {onDestroy, onMount } from "svelte";
  import { Events } from "$lib/utils/enums/mixpanel-events.enum";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";

  type dropdownType = "text" | "img";
  type dropdownHoverType="add"|"remove"
  export let data: Array<{
    name: string;
    id: string;
    textColor: string;
    hide?: boolean;
    description?: string;
    selectedOptionClasses?: string;
  }>;

  export let staticClasses: { id: string; classToAdd: string[] }[] = [];
  export let hoverClasses: { id: string; classToAdd: string[] }[] = [];

  export let onclick: (tab: string) => void;

  export let dropDownType: {
    type: dropdownType;
    title: string;
  };
  export let dropdownId: string = "";
  export let disabled: boolean = false;
  export let mixpanelEvent: Events = Events.NO_EVENT;

  let selectedOption: {
    name: string;
    id: string;
    textColor: string;
    description?: string;
    selectedOptionClasses?: string;
  };

  let isOpen: boolean = false;

  const toggleDropdown = () => {
    isOpen = !isOpen;
    if (mixpanelEvent && mixpanelEvent !== Events.NO_EVENT) {
      MixpanelEvent(mixpanelEvent);
    }
  };

  $: {
    if (dropDownType.title) {
      data.forEach((element) => {
        if (element.id === dropDownType.title) {
          selectedOption = element;
        }
      });
      if (!selectedOption) {
        selectedOption = data[0];
      }
    }
  }

  function handleDropdownClick(event: MouseEvent) {
    const dropdownElement = document.getElementById(
      `${dropdownId}-dropdown-${dropDownType.title}`,
    );
    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
      isOpen = false;
    }
  }

  onDestroy(() => {
    window.removeEventListener("click", handleDropdownClick);
  });

  

  function handleHover(elementId: string, handleType:dropdownHoverType) {
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

  onMount(() => {
    staticClasses.length > 0 &&
      staticClasses.forEach((classes) => {
        const element = document.getElementById(classes.id);
        element?.classList.add(...classes.classToAdd);
      });
    window.addEventListener("click", handleDropdownClick);
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
    {#if dropDownType.type === "text"}
      <div
        id={`${dropdownId}-btn-div`}
        class="dropdown-btn d-flex align-items-center justify-content-between"
        class:dropdown-btn-active={isOpen}
        on:mouseenter={() => {
          handleHover(`${dropdownId}-btn-div`, "add");
        }}
        on:mouseleave={() => {
          handleHover(`${dropdownId}-btn-div`, "remove");
        }}
      >
        <p
          class="{disabled
            ? 'disabled-text'
            : ''} mb-0 {selectedOption?.textColor} {selectedOption?.selectedOptionClasses
            ? selectedOption.selectedOptionClasses
            : ''}"
        >
          {selectedOption?.name}
        </p>
        <span class:dropdown-logo-active={isOpen}
          ><img
            style="margin-left:10px; height:12px; width:12px;"
            src={dropdown}
            alt=""
          /></span
        >
      </div>
    {:else}
      <div id={`${dropdownId}-img`}>
        <img src={dropDownType.title} alt="+" />
      </div>
    {/if}
  </div>
  <div
    class="d-none dropdown-data rounded"
    class:dropdown-active={isOpen}
    id="{dropdownId}-options-container"
  >
    {#each data as list}
      <div
        id="{dropdownId}-options-div"
        class="d-flex px-2 py-1 justify-content-between highlight {list?.hide ===
        true
          ? 'd-none'
          : ''}"
        on:click={(event) => {
          event.stopPropagation();
          isOpen = false;
          onclick(list.id);
        }}
      >
        <p
          class="m-0 p-1 {list?.textColor}"
          style="font-size: 12px;"
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
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .dropdown-btn {
    background: none;
    outline: none;
    border: none;
    height: 26px;
    width: auto;
    padding: 0 10px;
  }
 
  .dropdown-data {
    color: white;
    position: absolute;
    border: 1px solid rgb(44, 44, 44);
    z-index: 2;
    background-color: var(--blackColor);
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
    /* !HANDLE MIN WIDTH */
    min-width: 180px;
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
  }
  .dropdown-btn {
    cursor: pointer;
  }

  .dropdown-btn-active {
    background-color: var(--border-color);
  }
  .disabled-text {
    color: var(--sparrow-text-color) !important;
  }
</style>
