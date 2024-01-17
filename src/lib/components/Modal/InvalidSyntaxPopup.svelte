<script lang="ts">
  import closeIcon from "$lib/assets/close.svg";
  import { fade, fly } from "svelte/transition";
  export let onClick: (flag: boolean) => void;
  export let handleError: () => void;
</script>

<div
  class="background-overlay"
  on:click={() => {
    onClick(false);
  }}
  transition:fade={{ delay: 0, duration: 100 }}
/>

<div
  class="container d-flex flex-column mb-0 px-4 pb-0 pt-4"
  transition:fly={{ y: 50, delay: 0, duration: 100 }}
  on:introstart
  on:outroend
>
  <div class="d-flex align-items-center justify-content-between mb-3">
    <h5 class="format-header mb-0 text-whiteColor" style="font-weight: 500;">
      Incorrect File format
    </h5>
    <button
      class="btn-close1 border-0 rounded"
      on:click={() => {
        onClick(false);
      }}
    >
      <img src={closeIcon} alt="" />
    </button>
  </div>
  <div>
    <p class="format-info">
      We have identified that text you pasted is not the right file format.
      Please ensure that you paste the following file formats only.
    </p>
  </div>
  <div class="format-types-container">
    <p class="format-type">.YAML</p>
    <p class="format-type">.JSON</p>
  </div>
  <div class="format-btns">
    <button
      class="format-btn"
      on:click={() => {
        onClick(false);
      }}>Close</button
    >
    <button
      class="format-btn collection-btn"
      on:click={() => {
        handleError();
      }}>+ Collection</button
    >
  </div>
</div>

<style>
  .background-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: var(--background-hover);
    -webkit-backdrop-filter: blur(3px);
    backdrop-filter: blur(3px);
    z-index: 14;
  }

  .format-header {
    font-family: Roboto;
    font-size: 20px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0em;
    text-align: left;
  }

  .format-info {
    font-family: Roboto;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0em;
    text-align: left;
  }
  .container {
    position: fixed;
    height: 244px;
    width: 540px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--background-color);
    z-index: 14;
    border-radius: 10px;
  }
  .format-types-container {
    display: flex;
    justify-content: space-between;
    width: 25%;
  }
  .format-type {
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0em;
    text-align: left;
    padding: 8px;
    border: 1px solid var(--border-color);
    border-radius: 10px;
  }
  .format-btns {
    width: 100%;
    display: flex;
    justify-content: end;
    gap: 10px;
  }
  .format-btn {
    background-color: var(--border-color);
    border: none;
    width: 20%;
    border-radius: 4px;
    padding: 2px;
    font-family: Roboto;
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
    letter-spacing: 0em;
    text-align: center;
    padding: 4px;
  }
  .format-btn:hover {
    background-color: #616364;
  }
  .collection-btn {
    background-color: var(--send-button);
    color: var(--white-color);
    font-family: Roboto;
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
    letter-spacing: 0em;
    text-align: center;
  }
  .collection-btn:hover {
    background-color: var(--send1-hoverbutton);
  }
  .btn-close1 {
    background-color: var(--background-color);
  }

  .btn-close1:hover {
    background-color: var(--dangerColor);
  }

  .btn-close1:active {
    background-color: var(--dangerColor);
  }
</style>
