<script>
  import spin from "$lib/assets/spin.svg";
</script>

<div class="loading-spinner spinner-item">
  <img class="load-spin" src={spin} style="width: 80px; height:80px;" alt="" />
</div>

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
    -webkit-backdrop-filter: blur(3px);
    backdrop-filter: blur(3px);
    z-index: 999;
  }
  .load-spin {
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
