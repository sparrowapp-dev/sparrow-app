<script lang="ts">
  import { DownArrow } from "$lib/assets";
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";

  export let labelText: string = "Select";
  export let isRequired: boolean = false;
  export let inputId: string = "";
  export let labelDescription: string = "";
  export let selectInputPlaceholder: string = "Select an option";
  export let options: any[];
  export let invalidValue: boolean = false;
  export let errorText: string = "Invalid Value.";
  export let handleOnSelect: (e: any) => void;
  let isDropdownVisible: boolean = false;
  const closeSparrowDropdown = () => {
    isDropdownVisible = false;
  };
  const openSparrowDropdown = () => {
    isDropdownVisible = true;
  };
  const toggleSparrowDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    isDropdownVisible = !isDropdownVisible;
  };
  onMount(() => {
    console.log(options);
  });
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
      handleOnSelect(e);
    }}
    class={`${
      invalidValue && "invalid"
    } sparrow-select-input py-2 justify-content-between d-flex px-3 w-100`}
  >
    {#if selectInputPlaceholder !== ""}
      <span class="sparrow-placeholder-option">{selectInputPlaceholder}</span>
    {/if}
    <DownArrow classProp="my-auto" />
  </div>
  {#if isDropdownVisible}
    <div
      transition:fly={{ y: -20, duration: 100 }}
      class="{isDropdownVisible
        ? ''
        : 'd-none'} mt-2 position-absolute sparrow-dropdown-options ellipsis w-100 sparrow-thin-scrollbar"
    >
      {#each options as option}
        <option
          class="sparrow-select-option border-0 px-2 py-1 w-100 ellipsis"
          value={option.id}
        >
          {#if option && option.logo}
            <img src={option.logo} alt="sparrow-dropdown-img" />
          {/if}
          <span>{option.name}</span>
        </option>
      {/each}
    </div>
  {/if}
  {#if invalidValue}
    <span class="sparrow-input-error-text">{errorText}</span>
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
  .sparrow-select-option {
    border-radius: 4px;
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
</style>
