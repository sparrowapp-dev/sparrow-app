<script lang="ts">
  // ---- Icons ----

  import SidebarItem, { type SidebarItemObj } from "./SidebarItem.svelte";
  // import { isGuestUserActive } from "@app/store/auth.store";

  let componentClass = "";
  export { componentClass as class };
  export let user;
  export let sidebarItems: SidebarItemObj[] = [];
  export let isGuestUser;
  export let onLogout: () => void;
  export let type = "desktop";

  // console.log(data);

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
