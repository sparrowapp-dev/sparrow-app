<script lang="ts">
  // ---- Icons ----
  import collections from "$lib/assets/collections.svg";
  import hoveredCollections from "$lib/assets/collections-hovered.svg";
  import selectedCollections from "$lib/assets/collections-selected.svg";

  import environment from "$lib/assets/environment.svg";
  import hoveredEnvironment from "$lib/assets/environment-hovered.svg";
  import selectedEnvironment from "$lib/assets/environment-selected.svg";

  import more from "$lib/assets/more.svg";
  import hoveredMore from "$lib/assets/more-hovered.svg";
  import selectedMore from "$lib/assets/more-selected.svg";

  import help from "$lib/assets/help.svg";
  import hoveredHelp from "$lib/assets/help-hovered.svg";
  import selectedHelp from "$lib/assets/help-selected.svg";

  import settings from "$lib/assets/settings.svg";
  import hoveredSettings from "$lib/assets/settings-hovered.svg";
  import selectedSettings from "$lib/assets/settings-selected.svg";

  import profile from "$lib/assets/profileTab.svg";
  import hoveredProfile from "$lib/assets/profile-hovered.svg";
  import selectedProfile from "$lib/assets/profile-selected.svg";

  import SidebarItem, { type SidebarItemObj } from "./SidebarItem.svelte";

  let componentClass = "";
  export { componentClass as class };

  let sidebarItems: SidebarItemObj[] = [
    {
      route: "/app/collections",
      heading: "Collections",
      defaultLogo: collections,
      hoveredLogo: hoveredCollections,
      selectedLogo: selectedCollections,
      disabled: false,
      position: "primary",
    },
    {
      route: "/app/environment",
      heading: "Environment",
      defaultLogo: environment,
      hoveredLogo: hoveredEnvironment,
      selectedLogo: selectedEnvironment,
      disabled: false,
      position: "primary",
    },
    {
      route: "/app/help",
      heading: "Help",
      defaultLogo: help,
      hoveredLogo: hoveredHelp,
      selectedLogo: selectedHelp,
      disabled: false,
      position: "primary",
    },
    {
      route: "/app/more",
      heading: "More",
      defaultLogo: more,
      hoveredLogo: hoveredMore,
      selectedLogo: selectedMore,
      disabled: false,
      position: "primary",
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
    {
      route: "/app/profile",
      heading: "Profile",
      defaultLogo: profile,
      hoveredLogo: hoveredProfile,
      selectedLogo: selectedProfile,
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
      <SidebarItem {item} />
    {/each}
  </div>

  <div class="secondary-sidebar-items">
    {#each secondarySidebarItems as item (item.route)}
      <SidebarItem {item} />
    {/each}
  </div>
</div>

<style global>
  .sidebar {
    height: calc(100vh - 44px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: 54px;
    background-color: var(--sidebar-background);
    border: 1px solid var(--border-color);
    margin-right: 1px;
    padding: 5px, 0px, 5px, 0px;
  }
</style>
