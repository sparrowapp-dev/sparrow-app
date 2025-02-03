<script lang="ts">
  import { Link, Router } from "svelte-navigator";
  import { Tooltip } from "@sparrow/library/ui";

  export let item: SidebarItemObj;
  export let slidebarPlace;

  let isRouteActive = false;
  let isPressed = false;

  $: iconSrc = isRouteActive
    ? item.selectedLogo || item.defaultLogo
    : isPressed
      ? item.selectedLogo || item.defaultLogo
      : item.defaultLogo;

  $: hoverIconSrc = item.hoveredLogo || item.defaultLogo;
</script>

<Tooltip
  placement="right-center"
  title={item.disabled ? "Coming Soon" : item.heading}
  zIndex={600}
>
  <Router>
    <div
      class="sidebar-item-parent"
      tabindex={item.disabled ? -1 : 0}
      on:keydown={() => {}}
      class:disabled={item.disabled}
    >
      <Link
        class="delay-class"
        tabindex={item.disabled ? -1 : 1}
        id={item.id}
        to={item.route}
        getProps={({ isCurrent, isPartiallyCurrent }) => {
          isRouteActive = isCurrent || isPartiallyCurrent;
          slidebarPlace(isRouteActive, item.id);
          return {
            class: `d-flex  flex-column text-decoration-none align-items-center justify-content-center ${
              item.disabled ? "disabled" : ""
            }`,
          };
        }}
      >
        <div
          class="sidebar-item"
          on:mousedown={() => {
            if (!isRouteActive) {
              isPressed = true;
              iconSrc = item.selectedLogo || item.defaultLogo;
            }
          }}
          on:mouseup={() => {
            isPressed = false;
          }}
          on:mouseleave={() => {
            if (!isRouteActive) {
              iconSrc = item.defaultLogo;
            }
          }}
          on:mouseenter={() => {
            if (!isRouteActive) {
              iconSrc = hoverIconSrc;
            }
          }}
        >
          <div class="d-flex" style="align-items: center;">
            <img class="sidebar-logo" src={iconSrc} alt={item.heading} />
          </div>
        </div>
      </Link>
    </div>
  </Router>
</Tooltip>

<style>
  .delay-class {
    transition: top 250ms ease-in-out 150ms;
  }

  .sidebar-item-parent:focus {
    outline: none;
    border-radius: 4px;
    border: 2px solid var(--border-ds-primary-300) !important;
    background-color: var(--bg-ds-surface-500) !important;
  }
  .sidebar-item img {
    height: 24px;
    width: 24px;
  }

  .sidebar-item {
    position: relative;
    padding: 12px;
    transition: 0.55s ease;
    border-radius: 4px;
  }

  .sidebar-item:hover {
    background-color: var(--bg-ds-surface-500);
    opacity: 1;
  }

  .sidebar-item-parent.disabled {
    pointer-events: none !important;
    opacity: 0.3;
  }
  .sidebar-logo {
    content: var(--default-logo);
  }

  .sidebar-item:hover .sidebar-logo {
    content: var(--hovered-logo);
  }
  .sidebar-item:active .sidebar-logo {
    content: var(--selected-logo);
  }

  .sidebar-item .sidebar-logo.selected {
    content: var(--selected-logo);
  }
</style>
