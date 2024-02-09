<script lang="ts">
  export let xAxis = 0;
  export let yAxis = 0;
  export let menuItems: Array<{
    onClick: () => void;
    displayText: string;
    disabled: boolean;
  }> = [];
</script>

<nav style="position: fixed; top:{yAxis}px; left:{xAxis}px; z-index:4;">
  <div
    class="navbar pb-0 pt-0 d-flex flex-column rounded align-items-start justify-content-start text-whiteColor bg-blackColor"
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
            style={item.displayText === "Delete" ? "color: #ff7878" : ""}
            >{item.displayText}</button
          >
        </li>
      {/each}
    </ul>
  </div>
</nav>

<style>
  .navbar {
    width: 180px;
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
    background-color: #232527;
  }
</style>
