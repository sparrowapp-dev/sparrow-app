<script lang="ts">
  import dropdown from "$lib/assets/dropdown.svg";
  import { onDestroy, onMount } from "svelte";
  import { slide } from "svelte/transition";
  import closeIcon from "$lib/assets/close.svg";

  interface Data {
    name: string;
    id: string;
    checked: boolean;
  }
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
  export let data: Array<{
    name: string;
    id: string;
    checked: boolean;
  }>;

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
  function handleDropdownClick(event: MouseEvent) {
    const dropdownElement = document.getElementById(`check-dropdown-${id}`);
    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
      isOpen = false;
    }
  }
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
    class="parent-dropdown display-inline-block z-1"
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
          <span>Select</span>
        {:else}
          <div class="me-4 navigator">
            {#each list as element}
              {#if element.checked}
                <span class="bg-backgroundDropdown p-1 ps-2 pe-0 rounded me-2"
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

        <span class="d-flex" class:dropdown-logo-active={isOpen}
          ><img
            style="height:12px; width:12px;"
            class="ms-2"
            src={dropdown}
            alt=""
          /></span
        >
      </div>
    </div>

    {#if isOpen}
      <div
        class="d-none dropdown-data p-1 rounded"
        class:dropdown-active={isOpen}
        transition:slide={{ duration: 100 }}
      >
        <div class="d-flex px-2 py-1 highlight">
          <input
            class="form-check-input"
            type="checkbox"
            bind:checked={controller}
            on:input={handleCheckAll}
          />
          <p class="m-0 ps-2 p-0 text-whiteColor" style="font-size: 12px;">
            Select All
          </p>
        </div>
        {#each list as item, index}
          <div class="d-flex px-2 py-2 highlight">
            <input
              class="form-check-input"
              type="checkbox"
              bind:checked={item.checked}
              on:input={() => {
                updateCheck(index);
              }}
            />
            <p class="m-0 ps-2 p-0 text-whiteColor" style="font-size: 12px;">
              {item.name}
            </p>
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
    height: 34px;
    width: auto;
    padding: 0 10px;
  }
  .dropdown-data {
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    border: 1px solid rgb(44, 44, 44);
    max-height: 200px;
    overflow-y: auto;
    -webkit-backdrop-filter: blur(10px); /* For some older versions of Safari */
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
    border: 1px solid #313233;
    cursor: pointer;
  }
  .dropdown-btn-active {
    border: 1px solid var(--send-button);
  }
  .isError {
    border: 1px solid var(--error--color) !important;
  }
  .navigator {
    white-space: nowrap;
    overflow: hidden;
  }
</style>
