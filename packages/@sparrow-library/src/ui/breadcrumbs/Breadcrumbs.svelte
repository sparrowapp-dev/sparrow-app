<script lang="ts">
  import { Dropdown } from "@sparrow/library/ui";
  import { Button } from "@sparrow/library/ui";
  import {ThreeDotIcon , AngleLeftIcon} from "@sparrow/library/icons";

  // Define interface for breadcrumb item
  interface BreadcrumbItem {
    id: string;
    name: string;
  }

  // Props
  export let breadcrumbs: BreadcrumbItem[][] = [];
  export let icon: string = "";
  export let onNavigate: (id: string) => void = () => {};

  // Local state
  let isBreadcrumDropdownVisible = false;
  let isBreadcrumDropdownHovered = false;

  // Handle navigation
  const handleNavigation = (id: string) => {
    onNavigate(id);
  };
</script>

<div
  class="py-3 ps-3 h-100 d-flex align-items-center overflow-auto"
  style="white-space: nowrap ;"
>
  <div class="mb-0 text-secondary-200 text-fs-12" style="display: flex;">
    {#if icon}
      <img src={icon} alt="breadcrumb icon" class="me-2" />
    {/if}

    {#each breadcrumbs as section, sectionIndex}
      {#if sectionIndex === 0}
        {#each section as item, itemIndex}
          <!-- <span
            class={breadcrumbs.length === 1 && itemIndex === section.length - 1 ? 
              'bread-item-active' : 'bread-item'}
            on:click={() => handleNavigation(item.id)}
          >
            {item.name}
            
          </span> -->
          <div style="display: flex; align-items: center;">
            <Button
              type="teritiary-regular"
              title={item.name}
              size="small"
              textStyleProp="font-size:12px; color:var(--text-ds-neutral-100); font-weight:500; line-height:18px;"
              onClick={() => handleNavigation(item.id)}
            />
            {#if !(breadcrumbs.length === 1 && itemIndex === section.length - 1)}
              <!-- <span class="mx-1">/</span> -->
               <AngleLeftIcon width="4.5px" height="8px"/>
            {/if}
            </div>
        {/each}
      {/if}

      {#if sectionIndex === 1}
        <span class="d-inline-block" style="display: flex; align-items: center;"> 
          <Dropdown
            buttonId="gql-breadcrum-dropdown"
            bind:isMenuOpen={isBreadcrumDropdownVisible}
            horizontalPosition="right"
            minWidth={175}
            options={section.map((item) => ({
              name: item.name,
              color: "var(--text-secondary-100)",
              onclick: () => handleNavigation(item.id),
            }))}
          >
            <button
              on:mouseenter={() => {
                isBreadcrumDropdownHovered = true;
              }}
              on:mouseleave={() => {
                isBreadcrumDropdownHovered = false;
              }}
              id="gql-breadcrum-dropdown"
              class="border-0 pt-0 border-radius-4 {isBreadcrumDropdownVisible
                ? 'bread-parent'
                : ''}"
              style="background-color: transparent; height:24px; width:24px;"
              on:click={() => {
                isBreadcrumDropdownVisible = !isBreadcrumDropdownVisible;
              }}
            >
            
              <ThreeDotIcon
                color={isBreadcrumDropdownVisible || isBreadcrumDropdownHovered
                  ? "var(--icon-secondary-100)"
                  : "var(--icon-secondary-950)"}
              />
            </button>
          </Dropdown>
        </span>
        <span class="mx-1" style="display:flex; align-items:center"> /</span>
      {/if}

      {#if sectionIndex === 2}
        {#each section as item, itemIndex}
          <!-- <span
            class={itemIndex === section.length - 1
              ? "bread-item-active"
              : "bread-item"}
            on:click={() => handleNavigation(item.id)}
          >
            {item.name}
           
          </span> -->
           <Button
              type="teritiary-regular"
              title={item.name}
              size="small"
              textStyleProp="font-size:12px; color:var(--text-ds-neutral-100); font-weight:500; line-height:18px;"
              onClick={() => handleNavigation(item.id)}
            />
             {#if itemIndex !== section.length - 1}
              <span class="mx-1" style="display: flex; align-items:center">/</span>
            {/if}
        {/each}
      {/if}
    {/each}
        </div>
</div>

<style>
  .bread-item {
    cursor: pointer;
    color: var(--text-secondary-200);
    display: flex;
    align-items: center;
  }

  .bread-item:hover {
    color: var(--text-secondary-100);
  }

  .bread-item-active {
    cursor: pointer;
    color: var(--text-secondary-100);
  }

  .bread-parent {
    background-color: var(--bg-secondary-500) !important;
  }
</style>
