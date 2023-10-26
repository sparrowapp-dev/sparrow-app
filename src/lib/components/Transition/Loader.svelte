<script>
  import { Circle } from "svelte-loading-spinners";
  export let visible;
  let color = " #1c35f3b9";
  let size = "70";
  //   let unit = "1px";
</script>

{#if visible}
  <div class="loading-spinner spinner-item">
    <Circle {size} {color} />
    <!-- Place your loading spinner component here -->
  </div>
{/if}

<style>
  .spinner-item {
    min-width: 250px;
    min-height: 250px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  .loading-spinner {
    position: fixed;
    margin: 10px 10px;
    top: 230px;
    right: 0;
    width: 480px;
    height: 70%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.706);
    z-index: 999;
  }
</style>
