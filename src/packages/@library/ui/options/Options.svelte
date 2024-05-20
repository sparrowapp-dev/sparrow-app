<script lang="ts">
  export let xAxis = 0;
  export let yAxis = [0, 0];
  export let menuItems: Array<{
    onClick: () => void;
    displayText: string;
    disabled: boolean;
    hidden: boolean;
    icon?: any;
  }> = [];
  export let noOfColumns = 0;
  let mouseX = 0;
  let mouseY = 0;

  const calculateRightOptionWidth = () => {
    const firstOptionWidth = noOfColumns + 20;
    const secondOptionWidth = noOfColumns;
    return [firstOptionWidth, secondOptionWidth];
  };

  /**
   * @description - recalculates positions for element that overflows window
   */
  const calculateAdjustedAxis = () => {
    const itemHeight = 38;
    const containerPadding = 16;
    const dialogHeight =
      menuItems.filter((elem) => {
        if (elem?.hide) {
          return false;
        }
        return true;
      }).length *
        itemHeight +
      containerPadding;
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    mouseX = xAxis;
    mouseY = yAxis[1];
    const [xWidth, xTranslate] = calculateRightOptionWidth();
    if (windowHeight < yAxis[1] + dialogHeight) {
      mouseY = yAxis[0] - dialogHeight;
    }
    if (windowWidth < xAxis + xWidth) {
      mouseX = xAxis - xTranslate;
    }
  };

  $: {
    if (xAxis) {
      calculateAdjustedAxis();
    }
    if (yAxis) {
      calculateAdjustedAxis();
    }
  }
</script>

<nav style="position: fixed; top:{mouseY}px; left:{mouseX}px; z-index:4;">
  <div
    style={`width: ${noOfColumns}px`}
    class="overflow-hidden navbar pb-0 pt-0 d-flex flex-column border-radius-2 align-items-start justify-content-start text-whiteColor bg-tertiary-400"
  >
    <ul class="p-2 w-100 mb-0">
      {#each menuItems as item}
        <li class="align-items-center {item.hidden ? 'd-none' : 'd-block'}">
          <button
            disabled={item.disabled}
            class={`w-100 d-flex align-items-center sparrow-fs-12 border-0 align-items-center px-2 py-2 ${
              item.disabled && "text-requestBodyColor"
            }`}
            on:click={item.onClick}
            style={item.displayText === "Delete"
              ? "color: var(--request-delete)"
              : ""}
          >
            <span class="me-2">
              <svelte:component this={item.icon} />
            </span>
            <span>
              {item.displayText}
            </span>
          </button>
        </li>
      {/each}
    </ul>
  </div>
</nav>

<style>
  .navbar {
    height: auto;
  }

  ul li button {
    background-color: var(--bg-tertiary-400);
    border-radius: 2px;
  }

  ul li button:hover {
    color: var(--white-color);
    border-radius: 4px;
    background-color: var(--bg-tertiary-600);
  }
</style>
