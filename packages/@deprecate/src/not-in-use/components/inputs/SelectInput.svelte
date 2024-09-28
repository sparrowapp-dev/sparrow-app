<script lang="ts">
  import { DownArrow } from "@deprecate/assets";
  import { PeopleIcon } from "@deprecate/assets/app.asset";
  import { fly } from "svelte/transition";

  export let labelText = "Select";
  export let isRequired = false;
  export let inputId = "";
  export let labelDescription = "";
  export let selectInputPlaceholder = "Select an option";
  export let options: any[];
  export let invalidValue = false;
  export let endIconVisible = false;
  export let errorText = "Invalid Value.";
  export let handleOnSelect: (value: any) => void;

  let isDropdownVisible = false;
  let selectedOption = "";

  const closeSparrowDropdown = () => {
    isDropdownVisible = false;
  };

  const handleSelectOption = (name: string, e) => {
    e.stopPropagation();
    selectedOption = name;
  };

  const toggleSparrowDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    isDropdownVisible = !isDropdownVisible;
  };
</script>

<svelte:window
  on:click={closeSparrowDropdown}
  on:contextmenu|preventDefault={closeSparrowDropdown}
/>
<div class="sparrow-select-input-container position-relative mt-3 w-100">
  <div class="sparrow-input-label-container mb-1">
    <div class="sparrow-input-label-heading">
      <label class="sparrow-input-label text-lightGray fw-light" for={inputId}
        >{labelText}</label
      >
      {#if isRequired}
        <span class="sparrow-input-required">*</span>
      {/if}
    </div>
    <span class="sparrow-input-label-desc">{labelDescription}</span>
  </div>
  <div
    on:click={(e) => {
      toggleSparrowDropdown(e);
    }}
    class={`${
      invalidValue && "invalid"
    } sparrow-select-input py-2 justify-content-between d-flex px-3 w-100`}
  >
    {#if selectedOption !== ""}
      <span class="sparrow-selected-option w-100">{selectedOption}</span>
    {:else if selectInputPlaceholder !== ""}
      <span class="sparrow-placeholder-option">{selectInputPlaceholder}</span>
    {/if}
    <DownArrow classProp="my-auto" />
  </div>
  {#if isDropdownVisible}
    <div
      transition:fly={{ y: -20, duration: 100 }}
      class="mt-2 position-absolute sparrow-dropdown-options ellipsis w-100 sparrow-thin-scrollbar"
    >
      {#each options as option}
        <div
          class="sparrow-select-option border-0 d-flex justify-content-between w-100 ellipsis"
          on:click={(e) => {
            handleSelectOption(option.name, e);
            handleOnSelect(option.id);
            closeSparrowDropdown();
          }}
        >
          <div class="d-flex ellipsis overflow-hidden" style="max-width: 93%;">
            <div
              class="sparrow-img-logo-container me-2 overflow-hidden w-10"
              style="min-width: 20px;"
            >
              {#if option.logo == "" || option.logo == undefined}
                <div
                  class={`m-0 text-defaultColor me-2 text-center align-items-center justify-content-center bg-transparent border-defaultColor sparrow-option-name`}
                  style={`font-size: 15px; padding-top: 2px; width: 20px !important; height: 20px !important; display: flex; border: 1px solid #45494D; border-radius: 50%;`}
                >
                  {option.name[0] ? option.name[0].toUpperCase() : ""}
                </div>
              {:else}
                <img
                  class="w-100"
                  src={option.logo}
                  alt="sparrow-dropdown-img"
                />
              {/if}
            </div>
            <span class="ellipsis">{option.name}</span>
          </div>
          {#if option.endIconVisible}
            <div style="width: 5%;">
              <PeopleIcon color={"#45494D"} />
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
  {#if invalidValue}
    <span class="sparrow-input-error-text ms-1">{errorText}</span>
  {/if}
</div>

<style lang="scss">
  .sparrow-input-label {
    font-size: 14px;
  }
  .sparrow-select-input {
    background-color: var(--blackColor);
    outline: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    border: 1px solid var(--border-color);
  }
  .sparrow-input-required {
    color: var(--dangerColor);
  }
  .sparrow-placeholder-option {
    color: var(--request-arc) !important;
  }
  .sparrow-select-option:hover {
    background: rgba(19, 19, 19, 0.8);
    backdrop-filter: blur(10px);
    color: var(--send-button);
  }
  .sparrow-select-option:active {
    background: var(--border-color);
    color: var(--white-color);
  }
  .sparrow-select-option {
    border-radius: 4px;
    padding: 8px 7px;
    border: 1px solid var(--border-color);
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    cursor: pointer;
    font-size: 12px;
  }
  .sparrow-dropdown-options {
    max-height: 20vh;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    overflow-y: scroll;
  }
  .sparrow-input-error-text {
    font-size: 12px;
    color: var(--dangerColor);
  }
  .sparrow-img-logo-container {
    width: 20px !important;
    height: 20px !important;
  }
</style>
