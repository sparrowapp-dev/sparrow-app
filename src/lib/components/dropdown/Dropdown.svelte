<script lang="ts">
  import dropdown from "$lib/assets/dropdown.svg";
  import checkIcon from "$lib/assets/check.svg";
  import { afterUpdate, onDestroy, onMount } from "svelte";

  export let data: Array<{
    name: string;
    id: string;
    textColor: string;
    hide?: boolean;
    description?: string;
    dynamicClasses?:
      | {
          id: string;
          classToAdd: string[];
          classToRemove: string;
        }[]
      | null;
  }>;
  export let staticClasses: { id: string; classToAdd: string[] }[] = [];
  export let onclick: (tab: string) => void;
  export let title: string;
  export let dropdownId: string = "";
  export let disabled: boolean = false;

  let selectedTitle: {
    name: string;
    id: string;
    textColor: string;
    description?: string;
    dynamicClasses?:
      | {
          id: string;
          classToAdd: string[];
          classToRemove: string;
        }[]
      | null;
  };

  let isOpen: boolean = false;

  const toggleDropdown = () => {
    isOpen = !isOpen;
  };

  $: {
    if (title) {
      data.forEach((element) => {
        if (element.id === title) {
          selectedTitle = element;
        }
      });
      if (!selectedTitle) {
        selectedTitle = data[0];
      }
    }
  }

  function handleDropdownClick(event: MouseEvent) {
    debugger;
    const dropdownElement = document.getElementById(
      `${dropdownId}-dropdown-${title}`,
    );
    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
      isOpen = false;
    }
  }

  onDestroy(() => {
    window.removeEventListener("click", handleDropdownClick);
  });

  function handleDynamicClasses(
    id: string,
    classes: string[],
    toRemoveClassName: string,
  ) {
    const doc = document.getElementById(id) as HTMLElement;
    doc &&
      doc?.classList?.length > 0 &&
      doc?.classList.forEach((className) => {
        if (className.startsWith(toRemoveClassName)) {
          doc?.classList.remove(className);
        }
      });

    doc &&
      classes.length > 0 &&
      classes.map((classObj) => {
        doc.classList.add(classObj);
      });
  }

  onMount(() => {
    debugger;
    data.length > 0 &&
      data.forEach((dataObj) => {
        dataObj.dynamicClasses &&
          dataObj.dynamicClasses.length > 0 &&
          dataObj.dynamicClasses.forEach((dynamicObj) => {
            handleDynamicClasses(
              dynamicObj.id,
              dynamicObj.classToAdd,
              dynamicObj.classToRemove,
            );
          });
      });

    staticClasses.length > 0 &&
      staticClasses.forEach((classes) => {
        const element = document.getElementById(classes.id);
        element?.classList.add(...classes.classToAdd);
      });
    window.addEventListener("click", handleDropdownClick);
  });
  afterUpdate(() => {
    selectedTitle.dynamicClasses &&
      selectedTitle.dynamicClasses.length > 0 &&
      selectedTitle.dynamicClasses.forEach((dynamicObj) => {
        handleDynamicClasses(
          dynamicObj.id,
          dynamicObj.classToAdd,
          dynamicObj.classToRemove,
        );
      });
  
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
    
    id={`${dropdownId}-dropdown-${title}`}
    
  >
    <div
      id="dropdown-btn-div"
      class="dropdown-btn d-flex align-items-center justify-content-between"
      class:dropdown-btn-active={isOpen}
    >
      <p
        class="{disabled
          ? 'disabled-text'
          : ''} mb-0 {selectedTitle?.textColor}"
      >
        {selectedTitle?.name}
      </p>
      <span class:dropdown-logo-active={isOpen}
        ><img
          style="margin-left:10px; height:12px; width:12px;"
          src={dropdown}
          alt=""
        /></span
      >
    </div>
  </div>
  <div class="d-none dropdown-data p-1 rounded" class:dropdown-active={isOpen}>
    {#each data as list}
      <div
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
          class="m-0 p-0 {list?.textColor}"
          style="font-size: 12px;"
          id="option-name-p-{list.id}"
          class:selected-request={list.id === selectedTitle?.id}
        >
          {list.name}
          {#if list.description}
            <br />
            <small class="text-textColor">{list.description}</small>
          {/if}
        </p>
        {#if selectedTitle?.id === list.id}
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
  /* ! PASS AS PROP */
  /* .dropdown-btn-hover {
      background-color: var(--border-color);
  } */

  /* .dropdown-btn:hover {
    border-bottom: 1px solid var(--send-button);
  } */
  .dropdown-btn:hover {
    background-color: var(--border-color);
  }
  .dropdown-data {
    /* !HANDLE Background color */
    /* background-color: var(--background-dropdown); */
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    position: absolute;
    top: 32px;
    left: 0;
    right: 0;
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
    /* !HANDLE MIN WIDTH */
    /* min-width: 136px; */
    z-index: 2;
    border: 1px solid rgb(44, 44, 44);
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
    /* !PASS AS PROP */
    /* border-bottom: 1px solid var(--send-button); */
  }
  .disabled-text {
    color: var(--sparrow-text-color) !important;
  }
</style>
