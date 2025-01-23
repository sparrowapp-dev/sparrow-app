<script lang="ts">
  import { afterUpdate, onMount } from "svelte";

  // ---- Icons ----

  import SidebarItem, { type SidebarItemObj } from "./SidebarItem.svelte";

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

  onMount(() => {});
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
    background-color: var(--bg-secondary-850);
    padding: 5px 0px 0px 0px;
  }

  .secondary-sidebar-items {
    padding: 0px;
  }
  .active-indicator {
    background-color: var(--nav-bar-active-slash);
    position: absolute;
    height: 38px;
    width: 2px;
    left: 5px;
    opacity: 1;
    transition: top 250ms ease-out;
    z-index: 10;
  }
</style>
