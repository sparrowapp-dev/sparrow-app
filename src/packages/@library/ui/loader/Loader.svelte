<script>
  import Spinner from "../spinner/Spinner.svelte";
  export let loaderMessage = "";
  export let messageClassProp = "";
  export let messageStyleProp = "";
  export let loaderContainerClassProp = "";
  export let loaderContainerStyleProp = "";
  export let loaderSize = "";
</script>

<div
  class={`d-flex flex-column loading-spinner spinner-item ${loaderContainerClassProp}`}
  style={`${loaderContainerStyleProp}`}
>
  <Spinner size={loaderSize} />
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
    z-index: 1000;
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
