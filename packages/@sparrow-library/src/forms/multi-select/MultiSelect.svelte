<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { slide } from "svelte/transition";
  import { closeIcon } from "@sparrow/library/assets";
  import type { Data } from "./types";
  import { DownArrowIcon } from "@sparrow/library/icons";

  /**
   * Indicates if there is an error.
   */
  export let isError: boolean = false;
  /**
   * Callback function to handle click events on a tab.
   */
  export let onclick: (list: Data[]) => void;
  /**
   * The ID of the multi select.
   */
  export let id: string;
  /**
   * The data for the multi select.
   */
  export let data: Data[];

  let isOpen: boolean = false;
  let list: Data[];
  if (data && data.length > 0) {
    list = data;
  } else {
    list = [];
  }

  /**
   * Toggles the multi select open state.
   */
  const toggleDropdown = () => {
    isOpen = !isOpen;
  };

  /**
   * Handles clicks outside the dropdown to close it.
   * @param  event - The mouse event.
   */
  const handleDropdownClick = (event: MouseEvent) => {
    const dropdownElement = document.getElementById(`check-dropdown-${id}`);
    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
      isOpen = false;
    }
  };
  let controller: boolean = false;
  $: {
    if (data) {
      list = data;
      let flag: boolean = false;
      for (let i = 0; i < list.length - 1; i++) {
        if (list[i].checked === false) {
          flag = true;
        }
      }
      if (list[list?.length - 1]?.checked === false) {
        flag = true;
      }
      if (flag) {
        controller = false;
      } else {
        controller = true;
      }
    }
  }

  /**
   * Updates the checked status of a dropdown item.
   * @param index - The index of the item to update.
   */
  const updateCheck = (index: number): void => {
    let filteredCheckSelect = list.map((elem, i) => {
      if (i === index) {
        elem.checked = !elem.checked;
      }
      return elem;
    });
    list = filteredCheckSelect;
    onclick(list);
  };

  /**
   * Handles the "Select All" checkbox functionality.
   */
  const handleCheckAll = (): void => {
    let flag: boolean;
    if (controller === true) {
      flag = false;
    } else {
      flag = true;
    }
    let filteredCheckSelect = list.map((elem, i) => {
      elem.checked = flag;
      return elem;
    });
    list = filteredCheckSelect;
    onclick(list);
  };

  /**
   * Counts the number of checked items in the list.
   * @param  ls - The list of items.
   * @returns  The count of checked items.
   */
  const countCheckedList = (ls: Data[]) => {
    let count = 0;
    ls.forEach((element) => {
      if (element.checked) {
        count++;
      }
    });
    return count;
  };
  onDestroy(() => {
    window.removeEventListener("click", handleDropdownClick);
  });

  onMount(() => {
    window.addEventListener("click", handleDropdownClick);
  });
</script>

<div on:click={handleDropdownClick}>
  <div
    id={`check-dropdown-${id}`}
    class="parent-dropdown display-inline-block"
    style=" position: relative;"
  >
    <div on:click={toggleDropdown}>
      <div
        class="dropdown-btn rounded d-flex align-items-center justify-content-between {isError
          ? 'isError'
          : ''}"
        class:dropdown-btn-active={isOpen}
      >
        {#if !countCheckedList(list)}
          <span class="text-fs-12 text-secondary-200"> Select</span>
        {:else}
          <div class="me-4 navigator">
            {#each list as element}
              {#if element.checked}
                <span class="header-item text-fs-12 py-2 ps-2 pe-0 rounded me-2"
                  >{element.name}
                  <img
                    src={closeIcon}
                    on:click={() => {
                      const filteredData = list.map((elem) => {
                        if (elem.id === element.id) {
                          elem.checked = false;
                        }
                        return elem;
                      });
                      list = filteredData;
                      onclick(list);
                    }}
                  /></span
                >
              {/if}
            {/each}
          </div>
        {/if}

        <span class="d-flex" class:dropdown-logo-active={isOpen}>
          <DownArrowIcon
            width={12}
            height={14}
            color={"var(--icon-secondary-200)"}
          />
        </span>
      </div>
    </div>

    {#if isOpen}
      <div
        class="d-none dropdown-data p-1 rounded select-data"
        class:dropdown-active={isOpen}
        transition:slide={{ duration: 100 }}
      >
        {#if list?.length}
          <div class="d-flex align-items-center px-2 py-2 highlight">
            <label class="check-box">
              <input
                id="select-all-{id}"
                class="form-check-input mt-0"
                type="checkbox"
                bind:checked={controller}
                on:input={handleCheckAll}
              />
              <span class="checkmark"></span>
            </label>
            <label
              for="select-all-{id}"
              role="button"
              class="text-fs-12 m-0 ps-2 p-0 text-whiteColor w-100"
              >Select All</label
            >
          </div>
        {/if}

        <hr class="mt-0 mb-1 text-secondary-250" />
        {#each list as item, index}
          <div class="d-flex align-items-center px-2 py-2 highlight">
            <label class="check-box">
              <input
                id="multi-select-item-{index}-{id}"
                class="form-check-input mt-0"
                type="checkbox"
                bind:checked={item.checked}
                on:input={() => {
                  updateCheck(index);
                }}
              />
              <span class="checkmark"></span>
            </label>
            <label
              for="multi-select-item-{index}-{id}"
              role="button"
              class="text-fs-12 m-0 ps-2 p-0 text-whiteColor w-100 ellipsis"
            >
              {item.name}
            </label>
          </div>
        {/each}
        {#if !list?.length}
          <p
            class="m-0 ps-2 p-0 pt-1 pb-1 text-whiteColor"
            style="font-size: 12px;"
          >
            {"Workspace not found!"}
          </p>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .dropdown-btn {
    background: none;
    outline: none;
    border: none;
    height: 38px;
    width: auto;
    padding: 0 10px;
    background-color: var(--header-background-color, black);
  }
  .dropdown-data {
    background-color: var(--body-background-color, black);
    color: white;
    position: absolute;
    bottom: -5px;
    left: 0;
    right: 0;
    transform: translateY(100%);
    border: 1px solid rgb(44, 44, 44);
    max-height: 200px;
    overflow-y: auto;
    -webkit-backdrop-filter: blur(10px); /* For some older versions of Safari */
    backdrop-filter: blur(10px);
  }

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
  }
  .highlight:hover {
    background-color: transparent;
  }
  .dropdown-btn {
    border: 1px solid #313233;
    cursor: pointer;
  }
  .dropdown-btn-active {
    border: 1px solid var(--border-primary-300);
  }
  .isError {
    border: 1px solid var(--border-danger-200) !important;
  }
  .navigator {
    white-space: nowrap;
    overflow: hidden;
  }
  .header-item {
    height: 16px;
    background-color: var(--header-item-background-color, black);
  }

  .check-box {
    display: block;
    position: relative;
    padding-left: 15px;
    margin-bottom: 12px;
    cursor: pointer;
    font-size: 22px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  /* Hide the browser's default checkbox */
  .check-box input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
    background-color: transparent;
    border: 2px solid var(--border-secondary-500);
  }

  /* Create a custom checkbox */
  .check-box .checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 12px;
    width: 12px;
    border-radius: 3px;
    background-color: transparent;
    border: 1px solid var(--border-secondary-100);
  }

  /* When the checkbox is checked, add a blue background */
  .check-box input:checked ~ .checkmark {
    border: none;
    background-color: var(--bg-primary-300);
  }

  /* Create the checkmark/indicator (hidden when not checked) */
  .check-box .checkmark:after {
    content: "";
    position: absolute;
    display: none;
  }

  /* Show the checkmark when checked */
  .check-box input:checked ~ .checkmark:after {
    display: block;
  }

  /* Style the checkmark/indicator */
  .check-box .checkmark:after {
    left: 4px;
    top: 1px;
    width: 4px;
    height: 8px;
    border: solid var(--border-secondary-800);
    border-width: 0 2px 2px 0;
    -webkit-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
  }

  .select-data {
    color: white;
    border: 1px solid rgb(44, 44, 44);
    transition: 0.3s ease;
    -webkit-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
    -moz-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
  }
</style>
