<script lang="ts">
  import { Link } from "svelte-navigator";
  import { Tooltip } from "@sparrow/library/ui";
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
  } from "../../../../@sparrow-common/src/components/sidebar/common";
</script>

<div class="body">
  <div class="sidebar">
    <div class="menu-item">
      <img src={home} class="icon" />
      <span class="tooltip">Home</span>
    </div>
    <div class="menu-item">
      <img src={collections} class="icon" />
      <span class="tooltip">Workspace</span>
    </div>
    <div class="spacer"></div>
    <div class="menu-item">
      <img src={help} class="icon" />
      <span class="tooltip">Community</span>
    </div>
    <div class="menu-item">
      <img src={settings} class="icon" />
      <span class="tooltip">Settings</span>
    </div>
  </div>
</div>

<style lang="scss">
  .body {
    margin: 0;
    font-family: Arial, sans-serif;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 60px;
    background-color: #14181f;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 20px;
  }

  .menu-item {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
    position: relative;
    cursor: pointer;
  }

  .menu-item .icon {
    font-size: 20px;
    color: #fff;
  }

  .menu-item .tooltip {
    position: absolute;
    left: 70px;
    top: 50%;
    transform: translateY(-50%);
    background-color: #444;
    color: #fff;
    padding: 5px 10px;
    border-radius: 5px;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
  }

  .menu-item:hover .tooltip {
    opacity: 1;
  }

  .spacer {
    flex-grow: 1;
  }
</style>
