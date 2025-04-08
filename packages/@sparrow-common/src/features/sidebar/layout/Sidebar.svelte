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
  } from "../images";
  import SidebarItem from "../components/SidebarItem.svelte";

  import {
    type SidebarItemBaseInterface,
    SidebarItemImgEnum,
    SidebarItemPositionBaseEnum,
    type SidebarItemBaseAllIconInterface,
  } from "../../../types/sidebar/sidebar-base";

  export let sidebarItems: SidebarItemBaseInterface[] = [];
  const SidebarImageItem: SidebarItemBaseAllIconInterface[] = [];
  // import { isGuestUserActive } from "@app/store/auth.store";

  let componentClass = "";
  export { componentClass as class };
  export let user;
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

  sidebarItems.forEach((item) => {
    const sidebarItemWithIcons: SidebarItemBaseAllIconInterface = {
      ...item,
      defaultLogo: "",
      hoveredLogo: "",
      selectedLogo: "",
    };

    switch (item.id) {
      case SidebarItemImgEnum.HOME:
        sidebarItemWithIcons.defaultLogo = home;
        sidebarItemWithIcons.hoveredLogo = hoveredHome;
        sidebarItemWithIcons.selectedLogo = selectedHome;
        break;

      case SidebarItemImgEnum.WORKSPACE:
        sidebarItemWithIcons.defaultLogo = collections;
        sidebarItemWithIcons.hoveredLogo = hoveredCollections;
        sidebarItemWithIcons.selectedLogo = selectedCollections;
        break;

      case SidebarItemImgEnum.COMMUNITY:
        sidebarItemWithIcons.defaultLogo = help;
        sidebarItemWithIcons.hoveredLogo = hoveredHelp;
        sidebarItemWithIcons.selectedLogo = selectedHelp;
        break;

      case SidebarItemImgEnum.SETTING:
        sidebarItemWithIcons.defaultLogo = settings;
        sidebarItemWithIcons.hoveredLogo = hoveredSettings;
        sidebarItemWithIcons.selectedLogo = selectedSettings;
        break;
    }

    SidebarImageItem.push(sidebarItemWithIcons);
  });

  let primarySidebarItems = SidebarImageItem.filter(
    (item) => item.position === SidebarItemPositionBaseEnum.PRIMARY,
  );
  let secondarySidebarItems = SidebarImageItem.filter(
    (item) => item.position === SidebarItemPositionBaseEnum.SECONDARY,
  );

  const handleResize = () => {
    logPositions(initialId);
  };

  onMount(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  let initialId = "";
  afterUpdate(() => {
    if (initialId) {
      logPositions(initialId);
    }
  });

  //* @param idCheck - Boolean indicating whether the ID is valid.
  // * @param id - The ID to process.
  const slidebarPlace = (idCheck: boolean, id: string) => {
    if (idCheck) {
      initialId = id;
      logPositions(id);
    }
  };
</script>

<div class={`sidebar ${componentClass}`}>
  <div class="active-indicator" style="top:{divHeight + 3}px"></div>
  <div class="primary-sidebar-items">
    {#each primarySidebarItems as item (item.route)}
      <div id={`sidebar-item-${item.id}`}>
        <SidebarItem
          {item}
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
    border-right: 2px solid black;
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
    left: 4.5px;
    opacity: 1;
    transition: top 250ms ease-out;
    z-index: 10;
  }
</style>
