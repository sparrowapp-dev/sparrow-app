<script>
  import { Circle } from "svelte-loading-spinners";
  import spin from "$lib/assets/spin.svg";
  // export let visible;
  let color = "#1c35f3b9";
  let size = "70";
  //   let unit = "1px";
</script>

<!-- {#if visible} -->
<div class="loading-spinner spinner-item">
<img class="load-spin"  src={spin} style="width: 80px; height:80px;" alt="">
  <!-- Place your loading spinner component here -->
</div>

<!-- {/if} -->

<style>
  .spinner-item {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .loading-spinner {
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.706);
    backdrop-filter: blur(3px);
    z-index: 999;
  }
  .load-spin{
    animation: loader-animation 1s linear infinite; 
  }  
  @keyframes loader-animation { 
      0% { 
          transform: rotate(0deg); 
      } 
      100% { 
          transform: rotate(360deg); 
      } 
  } 
</style>
