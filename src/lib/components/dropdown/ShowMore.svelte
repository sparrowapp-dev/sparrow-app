<script lang="ts">
  import Button from "../buttons/Button.svelte";

  export let showMenu: boolean = false;
  export let menuItems = [];
  export let leftDistance = 2;
  export let topDistance = 0;
</script>

{#if showMenu}
  <div class="sparrow-show-more-container z-1">
    <nav
      class="p-0"
      style="position: fixed; left: {leftDistance}px; top: {topDistance}px; z-index:4;"
    >
      <div
        class="navbar pb-0 d-flex flex-column rounded align-items-start justify-content-start text-whiteColor sparrow-navbar"
        id="navbar"
      >
        <ul class="px-2 pt-0 pb-0 w-100 sparrow-menu-list">
          {#each menuItems as item}
            {#if item.visible}
              <li class="align-items-center sparrow-menu-item list-unstyled">
                <Button
                  disable={item.disabled}
                  title={item.displayText}
                  type={"transparent"}
                  textStyleProp={"font-size: 12px"}
                  buttonClassProp={`${
                    item.disabled && "text-requestBodyColor"
                  }`}
                  buttonStyleProp={`${
                    item.disabled
                      ? "color: var(--request-arc);"
                      : item.displayText === "Delete" ||
                        item.displayText === "Leave Team"
                      ? "color: #ff7878"
                      : ""
                  }`}
                  onClick={item.onClick}
                />
              </li>
            {/if}
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
