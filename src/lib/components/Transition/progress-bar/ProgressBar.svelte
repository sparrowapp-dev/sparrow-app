<script>
  import { fade, fly } from "svelte/transition";
  export let onClick;
  export let title = "";
  export let isProgress = true;
  /**
   * Takes x-index, recommended values => 1, 100, 1000, 10000, 100000.
   */
  export let zIndex = 1000;
  $: {
    if (isProgress === true) {
      setTimeout(() => {
        onClick(false);
      }, 1000);
    }
  }
</script>

<div
  class="sparrow-progress-bg-overlay position-fixed"
  style={`z-index: ${zIndex}`}
  on:click={onClick(false)}
  transition:fade={{ delay: 0, duration: 100 }}
/>

<div class="progress position-fixed" style={`z-index: ${zIndex + 1};`}>
  <div class="container d-flex flex-column justify-content-center">
    <h1 class="syntax-highlighting lh-1 sparrow-fs-12 fw-normal text-center">
      {title}
    </h1>
    <div class="progresser w-100 overflow-hidden rounded">
      {#if isProgress}
        <div
          class="progress-bar"
          id="progress-id"
          role="progressbar"
          style={`width: 0%; `}
          aria-valuenow="0"
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      {/if}
    </div>
  </div>
</div>

<style>
  .sparrow-progress-bg-overlay {
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: var(--background-hover);
    backdrop-filter: blur(3px);
  }
  .progress {
    width: 30%;
    height: 10%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: transparent !important;
  }
  .progresser {
    background-color: var(--send-button);
    height: 10px;
  }

  .container {
    background-color: transparent !important;
  }

  .syntax-highlighting {
    letter-spacing: 0em;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(270deg, #6147ff -1.72%, #1193f0 100%);
    animation: increaseWidth 1s forwards;
  }

  @keyframes increaseWidth {
    0% {
      width: 0%;
    }
    50% {
      width: 50%;
    }
    100% {
      width: 100%;
    }
  }
</style>
