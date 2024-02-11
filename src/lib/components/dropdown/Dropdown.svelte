<script lang="ts">
  import dropdown from "$lib/assets/dropdown.svg";
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
    dynamicClasses:string;
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
  export let additonalSelectedOptionText: string = "";

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
    dynamicClasses: string;
    description?: string;
    selectedOptionClasses?: string;
    checked?: boolean;
    isInvalidOption?: boolean;
    img?: string;
    hasDivider?: boolean;
  };

  let isOpen: boolean = false;

  const toggleDropdown = () => {
    isOpen = !isOpen;
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

  function handleDropdownClick(event: MouseEvent) {
    const dropdownElement = document.getElementById(
      `${dropdownId}-dropdown-${dropDownType.title}`,
    ) as HTMLElement;

    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
      isOpen = false;
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
          : ''}"
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
                : ''} mb-0 {selectedOption?.dynamicClasses} {selectedOption?.selectedOptionClasses
                ? selectedOption.selectedOptionClasses
                : ''}"
            >
              {selectedOption?.name}
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
    class="d-none dropdown-data rounded dropdown-menu"
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
          if (dropDownType.type === "checkbox") {
            onclick(list.id);
          } else {
            isOpen = false;
            onclick(list.id);
          }
        }}
      >
        <p
          class="m-0 {list?.dynamicClasses}"
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
        {:else if dropDownType.type === "checkbox"}
          <label>
            <input type="checkbox" bind:checked={list.checked} />
          </label>
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

  .disabled-text {
    color: var(--sparrow-text-color) !important;
  }
</style>
