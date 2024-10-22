<script lang="ts">
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
  } from "./common";

  import SidebarItem, { type SidebarItemObj } from "./SidebarItem.svelte";
  import { isGuestUserActive } from "@app/store/auth.store";

  let componentClass = "";
  export { componentClass as class };
  export let user;
  export let onLogout: () => void;
  export let type = "desktop";
  let isGuestUser = false;
  isGuestUserActive.subscribe((value) => {
    isGuestUser = value;
  });

  let sidebarItems: SidebarItemObj[] = [
    {
      route: !isGuestUser ? "/app/home" : "/guest/home",
      heading: "Home",
      defaultLogo: home,
      hoveredLogo: hoveredHome,
      selectedLogo: selectedHome,
      disabled: false,
      position: "primary",
    },
    {
      route: !isGuestUser ? "/app/collections" : "/guest/collections",
      heading: "Workspace",
      defaultLogo: collections,
      hoveredLogo: hoveredCollections,
      selectedLogo: selectedCollections,
      disabled: type === "web" ? true : false,
      position: "primary",
    },
    {
      route: "/app/help",
      heading: "Help",
      defaultLogo: help,
      hoveredLogo: hoveredHelp,
      selectedLogo: selectedHelp,
      disabled: type === "web" ? true : (isGuestUser ?? false),
      position: "secondary",
    },
    {
      route: "/app/setting",
      heading: "Setting",
      defaultLogo: settings,
      hoveredLogo: hoveredSettings,
      selectedLogo: selectedSettings,
      disabled: true,
      position: "secondary",
    },
  ];

  let primarySidebarItems = sidebarItems.filter(
    (item) => item.position === "primary",
  );
  let secondarySidebarItems = sidebarItems.filter(
    (item) => item.position === "secondary",
  );
</script>

<div class={`sidebar ${componentClass}`}>
  <div class="primary-sidebar-items">
    {#each primarySidebarItems as item (item.route)}
      <SidebarItem {item} {isGuestUser} />
    {/each}
  </div>
  <div class="secondary-sidebar-items">
    {#each secondarySidebarItems as item (item.route)}
      <SidebarItem {item} {isGuestUser} />
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
    background-color: var(--bg-secondary-850);
    padding: 5px 0px 0px 0px;
  }

  .secondary-sidebar-items {
    padding: 0px;
  }
</style>
