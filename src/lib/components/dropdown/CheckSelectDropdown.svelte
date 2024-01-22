<script lang="ts">
  import dropdown from "$lib/assets/dropdown.svg";
  import checkIcon from "$lib/assets/check.svg";
  import { onDestroy, onMount } from "svelte";
  import { fade, fly, slide } from "svelte/transition";

  let isOpen: boolean = false;

  export let list: Array<{
    name: string;
    id: string;
    checked: boolean;
  }>;
  let data = list;
  export let onclick: (tab) => void;
  export let id;
  //   let selectedRequest: {
  //     name: string;
  //     id: string;
  //     color: string;
  //   };

  const toggleDropdown = () => {
    isOpen = !isOpen;
  };

  //   $: {
  //     if (method) {
  //       data.forEach((element) => {
  //         if (element.id === method) {
  //           selectedRequest = element;
  //         }
  //       });
  //     }
  //   }

  function handleDropdownClick(event: MouseEvent) {
    const dropdownElement = document.getElementById(`check-dropdown-${id}`);
    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
      isOpen = false;
    }
  }
  let controller: boolean = false;
  $: {
    if (list) {
      data = list;
      let flag: boolean = false;
      for (let i = 0; i < data.length - 1; i++) {
        if (data[i].checked === false) {
          flag = true;
        }
      }
      if (data[data.length - 1].checked === false) {
        flag = true;
      }
      if (flag) {
        controller = false;
      } else {
        controller = true;
      }
    }
  }
  const updateCheck = (index: number): void => {
    let filteredCheckSelect = data.map((elem, i) => {
      if (i === index) {
        elem.checked = !elem.checked;
      }
      return elem;
    });
    data = filteredCheckSelect;
    onclick(data);
  };

  const handleCheckAll = (): void => {
    let flag: boolean;
    if (controller === true) {
      flag = false;
    } else {
      flag = true;
    }
    let filteredCheckSelect = data.map((elem, i) => {
      elem.checked = flag;
      return elem;
    });
    data = filteredCheckSelect;
    onclick(data);
  };
  onDestroy(() => {
    window.removeEventListener("click", handleDropdownClick);
  });

  onMount(() => {
    window.addEventListener("click", handleDropdownClick);
  });
</script>

<div
  class="parent-dropdown display-inline-block z-1"
  style=" position: relative;"
>
  <div>
    <div
      on:click={handleDropdownClick}
      on:click={toggleDropdown}
      id={`check-dropdown-${id}`}
      class="dropdown-btn rounded d-flex align-items-center justify-content-between"
      class:dropdown-btn-active={isOpen}
    >
      <p class=" mb-0 text-whiteColor">
        {"something"}
      </p>
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
      on:click={toggleDropdown}
      class="d-none dropdown-data p-1 rounded"
      class:dropdown-active={isOpen}
      transition:slide={{ duration: 100 }}
    >
      <div class="d-flex px-2 py-1 justify-content-between highlight">
        <input
          class="form-check-input"
          type="checkbox"
          bind:checked={controller}
          on:input={handleCheckAll}
        />
        <p class="m-0 p-0 text-whiteColor" style="font-size: 12px;">
          Select All
        </p>
      </div>
      {#each data as list, index}
        <div class="d-flex px-2 py-1 justify-content-between highlight">
          <input
            class="form-check-input"
            type="checkbox"
            bind:checked={list.checked}
            on:input={() => {
              updateCheck(index);
            }}
          />
          <p class="m-0 p-0 text-whiteColor" style="font-size: 12px;">
            {list.name}
          </p>
        </div>
      {/each}
    </div>
  {/if}
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
  .dropdown-btn:hover {
    background-color: var(--border-color);
  }
  .dropdown-data {
    background-color: var(--background-dropdown);
    color: white;
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
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
    border: 1px solid #313233;
    cursor: pointer;
  }
  .dropdown-btn-active {
    border: 1px solid var(--send-button);
  }
</style>
