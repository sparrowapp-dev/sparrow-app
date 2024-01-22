<script lang="ts">
  export let showMenu: boolean = false;
  export let menuItems = [];
  export let rightDistance = 2;
  export let topDistance = 0;
</script>

{#if showMenu}
  <div class="sparrow-show-more-container z-1">
    <nav
      class="p-0"
      style="position: absolute; right: {rightDistance}vw; top: {topDistance}vh; z-index:4;"
    >
      <div
        class="navbar pb-0 d-flex flex-column rounded align-items-start justify-content-start text-whiteColor sparrow-navbar"
        id="navbar"
      >
        <ul class="px-2 pt-0 pb-0 w-100 sparrow-menu-list">
          {#each menuItems as item}
            <li class="align-items-center sparrow-menu-item list-unstyled">
              <button
                disabled={item.disabled}
                class={`sparrow-menu-item-btn align-items-center bg-transparent mb-0 px-2 py-2 border-0  ${
                  item.disabled && "text-requestBodyColor "
                }`}
                on:click={item.onClick}
                style={item.displayText === "Delete" ? "color: #ff7878" : ""}
                >{item.displayText}</button
              >
            </li>
          {/each}
        </ul>
      </div>
    </nav>
  </div>
{/if}

<style lang="scss">
  .sparrow-show-more-container,
  .sparrow-navbar {
    background-color: var(--blackColor);
  }
  .sparrow-menu-item {
    border-radius: 8px;
    background-color: var(--blackColor);
  }
  .sparrow-menu-item:hover {
    background-color: #232527;
  }
</style>
