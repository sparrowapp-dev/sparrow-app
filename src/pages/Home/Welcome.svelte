<script>
  import spin from "$lib/assets/spin.svg";
</script>

<div
  class="d-flex flex-column align-items-center justify-content-center loading-spinner spinner-item"
>
  <img class="load-spin" src={spin} style="width: 80px; height:80px;" alt="" />
  <p class="mt-2">Please wait while we sign you in....</p>
</div>

<style>
  .loading-spinner {
    width: 100%;
    height: 100%;
    -webkit-backdrop-filter: blur(3px);
    backdrop-filter: blur(3px);
    z-index: 10;
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
