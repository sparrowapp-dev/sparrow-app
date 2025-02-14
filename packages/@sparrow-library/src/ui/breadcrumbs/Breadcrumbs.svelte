<script lang="ts">
  import { Dropdown } from "@sparrow/library/ui";
  import { Button } from "@sparrow/library/ui";
  import { ThreeDotIcon, AngleLeftIcon } from "@sparrow/library/icons";
  import { Tooltip } from "@sparrow/library/ui";

  interface BreadcrumbItem {
    id: string;
    name: string;
  }
  export let breadcrumbs: BreadcrumbItem[][] = [];
  export let icon;
  export let onNavigate: (id: string) => void = () => {};

  let isBreadcrumDropdownVisible = false;
  let isBreadcrumDropdownHovered = false;

  // Handle navigation
  const handleNavigation = (id: string) => {
    onNavigate(id);
  };
</script>

<div
  class="h-100 d-flex align-items-center overflow-auto gap-2"
  style="white-space: nowrap ; padding: 0px 8px;"
>
  <div class="mb-0 text-secondary-200 text-fs-12" style="display: flex;">
    {#each breadcrumbs as section, sectionIndex}
      {#if sectionIndex === 0}
        {#each section as item, itemIndex}
          <div style="display: flex; align-items: center;">
            <Tooltip 
              title={item.name}
              placement="top-center"
              size="small"
              show={true}
            >
              <Button
                type="teritiary-regular"
                title={item.name}
                size="small"
                textStyleProp="font-size:12px; color:{itemIndex === section.length - 1 ? 'var(--text-ds-neutral-500)' : 'var(--text-ds-neutral-100)'}; font-weight:500; line-height:18px; max-width:120px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;"
                onClick={() => handleNavigation(item.id)}
                buttonstartIcon={icon}
              />
            </Tooltip>
            {#if !(breadcrumbs.length === 1 && itemIndex === section.length - 1)}
              <span class="mx-1">
                <AngleLeftIcon width="4.5px" height="8px" />
              </span>
            {/if}
          </div>
        {/each}
      {/if}

      {#if sectionIndex === 1}
        <span
          class="d-inline-block"
          style="display: flex; align-items: center;padding:0px 7px;"
        >
          <Dropdown
            buttonId="gql-breadcrum-dropdown"
            bind:isMenuOpen={isBreadcrumDropdownVisible}
            horizontalPosition="right"
            minWidth={175}
            options={section.map((item) => ({
              name: item.name,
              color: "var(--text-secondary-100)",
              onclick: () => handleNavigation(item.id),
              icon: icon,
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
              class="border-0 pt-0 border-radius-4 "
              style="background-color: transparent; height:24px; width:24px;"
              on:click={() => {
                isBreadcrumDropdownVisible = !isBreadcrumDropdownVisible;
              }}
            >
             <div style="">
               <ThreeDotIcon
                color={isBreadcrumDropdownVisible || isBreadcrumDropdownHovered
                  ? "var(--icon-ds-primary-300) "
                  : "var(--icon-secondary-100)"}
                 width="16px"
                 height="16px" 
              />
              </div>
            </button>
          </Dropdown>
        </span>
        <span class="mx-1" style="display:flex; align-items:center">
          <AngleLeftIcon width="4.5px" height="8px" />
        </span>
      {/if}

      {#if sectionIndex === 2}
        {#each section as item, itemIndex}
          <Tooltip 
            title={item.name}
            placement="top-center"
            size="small"
            show={true}
          >
            <Button
              type="teritiary-regular"
              title={item.name}
              size="small"
              textStyleProp="font-size:12px; color:{itemIndex === section.length - 1 ? 'var(--text-ds-neutral-500)' : 'var(--text-ds-neutral-100)'}; font-weight:500; line-height:18px;"
              onClick={() => handleNavigation(item.id)}
              buttonstartIcon={icon}
            />
          </Tooltip>
          {#if itemIndex !== section.length - 1}
            <span class="mx-1" style="display: flex; align-items:center">
              <AngleLeftIcon width="4.5px" height="8px" />
            </span>
          {/if}
        {/each}
      {/if}
    {/each}
  </div>
</div>