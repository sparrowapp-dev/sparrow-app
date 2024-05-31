<script lang="ts" context="module">
  export type SidebarItemObj = {
    route: string;
    heading: string;
    defaultLogo: any;
    hoveredLogo?: any;
    selectedLogo?: any;
    disabled: boolean;
    position: "primary" | "secondary";
  };
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { Link } from "svelte-navigator";
  import { Tooltip } from "@library/ui";

  /**
   * List of side bar Items
   */
  export let item: SidebarItemObj;
  let isHovered = false;
  let isRouteActive = false;

  onMount(() => {
    const handleMouseEnter = () => {
      isHovered = true;
    };

    const handleMouseLeave = () => {
      isHovered = false;
    };

    return () => {
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  });
</script>

<Tooltip placement="right" title={item.disabled ? "Coming Soon" : item.heading}>
  <div class="sidebar-item-parent" class:disabled={item.disabled}>
    <Link
      to={item.route}
      getProps={({ isCurrent, isPartiallyCurrent }) => {
        isRouteActive = isCurrent || isPartiallyCurrent;
        return {
          class: `d-flex flex-column text-decoration-none align-items-center justify-content-center ${
            item.disabled ? "disabled" : ""
          }`,
        };
      }}
    >
      <div
        class="sidebar-item"
        on:mouseenter={() => (isHovered = true)}
        on:mouseleave={() => (isHovered = false)}
      >
        <div class="d-flex" style="align-items: center;">
          {#if isRouteActive}
            <div
              style="background-color: var(--nav-bar-active-slash); position:fixed; height: 38px; width: 2px; left: 5px;"
            ></div>
          {/if}
          {#if isRouteActive && item.selectedLogo}
            <img src={item.selectedLogo} alt={item.heading} />
          {:else if isHovered && item.hoveredLogo && !item.disabled}
            <img src={item.hoveredLogo} alt={item.heading} />
          {:else}
            <img src={item.defaultLogo} alt={item.heading} />
          {/if}
        </div>
      </div>
    </Link>
  </div>
</Tooltip>

<style>
  .sidebar-item img {
    height: 20px;
    width: 20px;
  }

  .sidebar-item {
    position: relative;
    padding: 12px;
    transition:
      background-color 0.55s ease,
      padding 0.55s ease;
    border-radius: 4px;
  }

  .sidebar-item:hover {
    background-color: var(--nav-bar-hover-background);
    opacity: 1;
  }

  .sidebar-item-parent.disabled {
    pointer-events: none !important;
    opacity: 0.3;
  }
</style>
