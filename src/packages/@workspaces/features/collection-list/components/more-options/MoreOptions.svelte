<script lang="ts">
  export let xAxis = 0;
  export let yAxis = 0;
  export let menuItems: Array<{
    onClick: () => void;
    displayText: string;
    disabled: boolean;
    hidden: boolean;
  }> = [];
  export let noOfRows = 0;
  export let noOfColumns = 0;
  let mouseX = 0;
  let mouseY = 0;

  const calculateRightOptionHeight = () => {
    const baseHeight = 80; // Base height for each row
    const extraHeight = 30; // Extra height for additional rows

    const firstOptionHeight = baseHeight + (noOfRows - 1) * extraHeight;
    const secondOptionHeight = firstOptionHeight - 20;

    return [firstOptionHeight, secondOptionHeight];
  };
  const calculateRightOptionWidth = () => {
    const firstOptionWidth = noOfColumns + 20;
    const secondOptionWidth = noOfColumns;
    return [firstOptionWidth, secondOptionWidth];
  };

  const calculateAdjustedAxis = () => {
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    mouseX = xAxis;
    mouseY = yAxis;
    const [yHeight, yTranslate] = calculateRightOptionHeight();
    const [xWidth, xTranslate] = calculateRightOptionWidth();
    if (windowHeight < yAxis + yHeight) {
      mouseY = yAxis - yTranslate;
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
    class="overflow-hidden navbar pb-0 pt-0 d-flex flex-column rounded align-items-start justify-content-start text-whiteColor bg-tertiary-400"
  >
    <ul class="p-2 w-100 mb-0">
      {#each menuItems as item}
        <li class="align-items-center {item.hidden ? 'd-none' : 'd-block'}">
          <button
            disabled={item.disabled}
            class={`w-100 d-flex sparrow-fs-12 border-0 align-items-center px-2 py-2 ${
              item.disabled && "text-requestBodyColor"
            }`}
            on:click={item.onClick}
            style={item.displayText === "Delete"
              ? "color: var(--request-delete)"
              : ""}>{item.displayText}</button
          >
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
