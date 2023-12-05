<script>
  // pos is cursor position when right click occur
  let pos = { x: 0, y: 0 };
  // menu is dimension (height and width) of context menu
  let menu = { h: 0, y: 0 };
  // browser/window dimension (height and width)
  let browser = { h: 0, y: 0 };
  // showMenu is state of context-menu visibility
  let showMenu = false;
  // to display some text
  let content;

  function rightClickContextMenu(e) {
    showMenu = true;
    browser = {
      w: window.innerWidth,
      h: window.innerHeight,
    };
    pos = {
      x: e.clientX,
      y: e.clientY,
    };
    // If bottom part of context menu will be displayed
    // after right-click, then change the position of the
    // context menu. This position is controlled by `top` and `left`
    // at inline style.
    // Instead of context menu is displayed from top left of cursor position
    // when right-click occur, it will be displayed from bottom left.
    if (browser.h - pos.y < menu.h) pos.y = pos.y - menu.h;
    if (browser.w - pos.x < menu.w) pos.x = pos.x - menu.w;
  }
  function onPageClick(e) {
    // To make context menu disappear when
    // mouse is clicked outside context menu
    showMenu = false;
  }
  function getContextMenuDimension(node) {
    // This function will get context menu dimension
    // when navigation is shown => showMenu = true
    let height = node.offsetHeight;
    let width = node.offsetWidth;
    menu = {
      h: height,
      w: width,
    };
  }
  function addCollections() {
    content.textContent = "Add and item...";
  }
  function renameCollection() {
    content.textContent = "Printed...";
  }
  function addRequest() {
    content.textContent = "Zooom...";
  }

  function addFolder() {
    content.textContent = "Settings...";
  }

  function deleteCollection() {
    content.textContent = "deleting...";
  }

  let menuItems = [
    {
      onClick: addCollections,
      displayText: "Open collection",
    },
    {
      onClick: renameCollection,
      displayText: "Rename collection",
    },
    {
      onClick: addRequest,
      displayText: "Add Request",
    },
    {
      onClick: addFolder,
      displayText: "Add Folder",
    },

    {
      onClick: deleteCollection,
      displayText: "Delete",
    },
  ];
</script>

<div class="content" bind:this={content} />

{#if showMenu}
  <nav
    use:getContextMenuDimension
    style="position: absolute; top:{pos.y}px; left:{pos.x}px"
  >
    <div class="navbar" id="navbar">
      <ul>
        {#each menuItems as item}
          <li>
            <button on:click={item.onClick}>{item.displayText}</button>
          </li>
        {/each}
      </ul>
    </div>
  </nav>
{/if}

<svelte:window
  on:contextmenu|preventDefault={rightClickContextMenu}
  on:click={onPageClick}
/>

<style>
  .navbar {
    display: flex;
    align-items: start;
    justify-content: start;
    width: 170px;
    background-color: #000;
    border-radius: 6px;
    overflow: hidden;
    flex-direction: column;
    color: white;
  }

  ul li {
    display: flex;
    align-items: start;
    justify-content: start;
  }

  ul li button {
    font-size: 12px;
    width: 100%;
    height: 30px;
    text-align: left;
    border: 0px;
    background-color: #000;
  }

  ul li button:hover {
    padding-left: 6px;
    color: #ffffff;
    text-align: left;
    border-radius: 5px;
    background-color: rgba(107, 105, 105, 0.192);
  }
</style>
