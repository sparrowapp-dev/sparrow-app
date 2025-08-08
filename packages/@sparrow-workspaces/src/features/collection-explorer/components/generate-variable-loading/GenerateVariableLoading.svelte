<script>
  import { SparkleFilled } from "@sparrow/common/icons";
</script>

<div
  class="generate-variable-loading d-flex justify-content-center align-items-center"
>
  <div class="content-wrapper d-flex flex-column justify-content-center">
    <div class="d-flex justify-content-center sparkle-container">
      <div class="sparkle-icon">
        <SparkleFilled width="48" height="48" />
      </div>
    </div>
    <div class="d-flex flex-column text-block">
      <p class="text-center common-text title-text">
        Sparrow AI is on the Job
        <span class="dot-container">
          <span class="dot dot-1">.</span>
          <span class="dot dot-2">.</span>
          <span class="dot dot-3">.</span>
        </span>
      </p>
      <p class="text-center description-text common-text">
        Finding potential variables for you. This may take a
      </p>
      <p class="text-center description-text common-text">few moments</p>
    </div>
  </div>
</div>

<style>
  .generate-variable-loading {
    z-index: 100000;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: var(--background-hover);
  }

  .content-wrapper {
    gap: 12px;
  }

  .sparkle-icon {
    animation: fadeInOut 2.4s ease-in-out infinite;
    display: inline-block;
  }

  @keyframes fadeInOut {
    0% {
      opacity: 0.2;
      transform: scale(0.95);
    }
    50% {
      opacity: 1;
      transform: scale(1);
    }
    100% {
      opacity: 0.2;
      transform: scale(0.95);
    }
  }

  .title-text {
    font-size: 16px;
    color: var(--text-ds-neutral-50);
    margin: 0px;
    margin-bottom: 8px;
  }

  .description-text {
    font-size: 12px;
    color: var(--text-ds-neutral-100);
    margin: 0px;
  }

  .common-text {
    font-family: "Inter", sans-serif;
    font-weight: 500;
    line-height: 150%;
    letter-spacing: 0;
    text-align: right;
  }

  .dot-container {
    display: inline-block;
    margin-left: 2px;
  }

  .dot {
    opacity: 0;
    animation: blink 1.5s infinite;
    font-weight: bold;
  }

  .dot-1 {
    animation-delay: 0s;
  }

  .dot-2 {
    animation-delay: 0.2s;
  }

  .dot-3 {
    animation-delay: 0.4s;
  }

  @keyframes blink {
    0% {
      opacity: 0;
    }
    20% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
</style>
