<script lang="ts">
  export let xAxis = 0;
  export let yAxis = 0;
  export let menuItems: Array<{
    onClick: () => void;
    displayText: string;
    disabled: boolean;
  }> = [];
  export let noOfRows = 0;
  export let noOfColumns = 0;
  let mouseX = 0;
  let mouseY = 0;

  const calculateRightOptionHeight = () => {
    if (noOfRows === 5) {
      return [200, 180];
    } else if (noOfRows === 4) {
      return [160, 150];
    } else if (noOfRows === 3) {
      return [140, 120];
    }
  };
  const calculateRightOptionWidth = () => {
    if (noOfColumns === 180) {
      return [200, 180];
    }
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
    class=" navbar pb-0 pt-0 d-flex flex-column rounded align-items-start justify-content-start text-whiteColor bg-blackColor"
  >
    <ul class="p-2 w-100 mb-0">
      {#each menuItems as item}
        <li class="align-items-center">
          <button
            disabled={item.disabled}
            class={`align-items-center px-2 py-2 ${
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
    overflow: hidden;
  }

  ul li {
    display: block;
  }

  ul li button {
    font-size: 12px;
    display: flex;
    width: 100%;
    border: 0px;
    background-color: var(--blackColor);
  }

  ul li button:hover {
    width: 100%;
    color: var(--white-color);
    border-radius: 8px;
    background-color: var(--right-click-menu);
  }
</style>
