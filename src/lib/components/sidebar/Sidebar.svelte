<script lang="ts">
  import collections from "$lib/assets/collections.svg";
  import collectionsFaded from "$lib/assets/collections-faded.svg";
  import mock from "$lib/assets/mock.svg";
  import environment from "$lib/assets/environment.svg";
  import environmentFaded from "$lib/assets/environment-faded.svg";
  import home from "$lib/assets/home.svg";
  import help from "$lib/assets/help.svg";
  import settings from "$lib/assets/setting.svg";

  import SidebarItem, { type SidebarItemObj } from "./SidebarItem.svelte";

  let componentClass = "";
  export { componentClass as class };

  let sidebarItems: SidebarItemObj[] = [
    {
      route: "/app/collections",
      heading: "Collections",
      logo: collections,
      disabled: false,
      position: "primary",
    },
    {
      route: "/app/workspaces",
      heading: "Workspaces",
      logo: home,
      disabled: false,
      position: "primary",
    },
    {
      route: "/app/mock",
      heading: "Mock",
      logo: mock,
      disabled: false,
      position: "primary",
    },
    {
      route: "/app/environment",
      heading: "Environment",
      logo: environment,
      disabled: false,
      position: "primary",
    },
    {
      route: "/help",
      heading: "Help",
      logo: help,
      disabled: false,
      position: "secondary",
    },
    {
      route: "/settings",
      heading: "Settings",
      logo: settings,
      disabled: false,
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
    width: 72px;
    background-color: var(--sidebar-background);
    border: 1px solid var(--border-color);
    padding: 12px 4px;
  }
</style>
