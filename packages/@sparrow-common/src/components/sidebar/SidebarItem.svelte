<script lang="ts" context="module">
</script>

<script lang="ts">
  import { Link, Router } from "svelte-navigator";
  import { Tooltip } from "@sparrow/library/ui";

  /**
   * List of side bar Items
   */
  export let item: SidebarItemObj;
  export let isGuestUser;
  export let slidebarPlace;

  let isRouteActive = false;
</script>

<Tooltip
  placement="right-center"
  title={item.disabled ? "Coming Soon" : item.heading}
  zIndex={600}
  show={!(
    isGuestUser &&
    (item.heading === "Setting" || item.heading === "Help")
  )}
>
  <Router>
    <div class="sidebar-item-parent" class:disabled={item.disabled}>
      <Link
        class="delay-class"
        id="divHeight"
        to={item.route}
        getProps={({ isCurrent, isPartiallyCurrent }) => {
          isRouteActive = isCurrent || isPartiallyCurrent;
          slidebarPlace(isRouteActive, item.id);
          return {
            class: `d-flex mb-1 flex-column text-decoration-none align-items-center justify-content-center ${
              item.disabled ? "disabled" : ""
            }`,
          };
        }}
      >
        <div
          class="sidebar-item"
          style="--default-logo: url('{item.defaultLogo}'); --hovered-logo: url('{item.hoveredLogo ||
            item.defaultLogo}'); --selected-logo: url('{item.selectedLogo ||
            item.defaultLogo}');"
        >
          <div class="d-flex" style="align-items: center;">
            <img
              class="sidebar-logo {isRouteActive ? 'selected' : ''}"
              src={item.defaultLogo}
              alt={item.heading}
            />
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
  .sidebar-item img {
    height: 20px;
    width: 20px;
  }

  .sidebar-item {
    position: relative;
    padding: 12px;
    transition: 0.55s ease;
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
  .sidebar-logo {
    content: var(--default-logo);
  }

  .sidebar-item:hover .sidebar-logo {
    content: var(--hovered-logo);
  }

  .sidebar-item .sidebar-logo.selected {
    content: var(--selected-logo);
  }
</style>
