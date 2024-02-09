<script>
  import spin from "$lib/assets/spin.svg";
  export let loaderMessage = "";
  export let messageClassProp = "";
  export let messageStyleProp = "";
  export let loaderContainerClassProp = "";
  export let loaderContainerStyleProp = "";
  export let loaderClassProp = "";
  export let loaderStyleProp = "";
</script>

<div
  class={`d-flex flex-column loading-spinner spinner-item ${loaderContainerClassProp}`}
  style={`${loaderContainerStyleProp}`}
>
  <img
    class={`load-spin ${loaderClassProp} `}
    src={spin}
    style={`${loaderStyleProp}`}
    alt=""
  />
  {#if loaderMessage.length > 0}
    <p class={`mt-2 ${messageClassProp}`} style={`${messageStyleProp}`}>
      {loaderMessage}
    </p>
  {/if}
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
