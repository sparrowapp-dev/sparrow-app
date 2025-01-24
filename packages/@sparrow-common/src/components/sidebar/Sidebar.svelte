<script lang="ts">
  import { afterUpdate, onMount } from "svelte";

  // ---- Icons ----
  import {
    home,
    hoveredHome,
    selectedHome,
    settings,
    selectedSettings,
    hoveredSettings,
    collections,
    hoveredCollections,
    selectedCollections,
    help,
    hoveredHelp,
    selectedHelp,
  } from "../../images";

  import SidebarItem from "./SidebarItem.svelte";
  import { type SidebarItemObj } from "../../types/sidebar/sidebar-base";

  // import { isGuestUserActive } from "@app/store/auth.store";

  let componentClass = "";
  export { componentClass as class };
  export let user;
  export let sidebarItems: SidebarItemObj[] = [];
  export let isGuestUser;
  export let isVisible = true;
  export let onLogout: () => void;
  export let type = "desktop";

  let divHeight = 0;

  function logPositions(id) {
    const div = document.getElementById(`sidebar-item-${id}`);

    if (div) {
      const rect = div.getBoundingClientRect();
      divHeight = rect.top;
    }
  }
  let event1 = "";

  sidebarItems.forEach((item) => {
    if (item.id === "Home") {
      item.defaultLogo = home;
      item.hoveredLogo = hoveredHome;
      item.selectedLogo = selectedHome;
    } else if (item.id === "Workspace") {
      item.defaultLogo = collections;
      item.hoveredLogo = hoveredCollections;
      item.selectedLogo = selectedCollections;
    } else if (item.id === "Community") {
      item.defaultLogo = help;
      item.hoveredLogo = hoveredHelp;
      item.selectedLogo = selectedHelp;
    } else if (item.id === "Setting") {
      item.defaultLogo = settings;
      item.hoveredLogo = hoveredSettings;
      item.selectedLogo = selectedSettings;
    }
  });

  let primarySidebarItems = sidebarItems.filter(
    (item) => item.position === "primary",
  );
  let secondarySidebarItems = sidebarItems.filter(
    (item) => item.position === "secondary",
  );
  let initialId = "";
  afterUpdate(() => {
    if (initialId) {
      logPositions(initialId);
    }
  });

  const slidebarPlace = (idCheck, id) => {
    if (idCheck) {
      initialId = id;
      logPositions(id);
    }
  };
</script>

<div class={`sidebar ${componentClass}`}>
  <div class="active-indicator" style="top:{divHeight + 2}px"></div>

  <div class="primary-sidebar-items">
    {#each primarySidebarItems as item (item.route)}
      <div id={`sidebar-item-${item.id}`}>
        <SidebarItem
          {item}
          {isGuestUser}
          {slidebarPlace}
          on:click={(event) => handleCompo(event.detail)}
        />
      </div>
    {/each}
  </div>
  <div class="secondary-sidebar-items">
    {#each secondarySidebarItems as item (item.route)}
      <div id={`sidebar-item-${item.id}`}>
        <SidebarItem
          {item}
          {isGuestUser}
          {slidebarPlace}
          on:click={(event) => handleCompo(event.detail)}
        />
      </div>
    {/each}
  </div>
</div>

<style>
  .sidebar {
    overflow: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: 54px;
    background-color: var(--bg-ds-surface-700);
    padding: 5px 0px 0px 0px;
  }

  .secondary-sidebar-items {
    padding: 0px;
  }
  .active-indicator {
    background: linear-gradient(
      90deg,
      var(--bg-ds-info-400) 0%,
      var(--bg-ds-secondary-400) 100%
    );
    position: absolute;
    height: 38px;
    width: 2px;
    left: 5px;
    opacity: 1;
    transition: top 250ms ease-out;
    z-index: 10;
  }
</style>
