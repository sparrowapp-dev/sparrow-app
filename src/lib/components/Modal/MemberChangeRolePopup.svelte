<script lang="ts">
  import closeIcon from "$lib/assets/close.svg";
  import { base64ToURL } from "$lib/utils/helpers";
  import CoverButton from "../buttons/CoverButton.svelte";
  import { fly, fade } from "svelte/transition";

  export let title;
  export let description;
  export let teamName;
  export let teamLogo;
  export let onSuccess;
  export let onCancel;
  export let auth = false;

  let confirmationText = "";
  let confirmationError = "";

  let deleteLoader: boolean = false;
  const handleDelete = async () => {
    deleteLoader = true;
    await onSuccess();
    deleteLoader = false;
  };
</script>

<div class="environment-delete-popup">
  <div
    class="background-overlay"
    on:click={() => {
      onCancel(false);
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
      <h5 class="mb-0 text-whiteColor" style="font-weight: 500;">
        {title}
      </h5>
      <button
        class="btn-close1 border-0 rounded"
        on:click={() => {
          onCancel(false);
        }}
      >
        <img src={closeIcon} alt="" />
      </button>
    </div>
    <div style="font-size: 14px;" class="text-lightGray mb-1">
      {@html description}
    </div>
    {#if auth}
      <p class="confirm-header mb-0">
        Enter Team name to confirm<span class="asterik">*</span>
      </p>
      <input
        id="input"
        placeholder=""
        autocomplete="off"
        autocapitalize="none"
        autofocus
        style="outline:none;border:none;flex-grow:1;"
        bind:value={confirmationText}
        on:input={() => {
          confirmationError = "";
        }}
        on:blur={() => {
          if (confirmationText === "") {
            confirmationError = "Team name cannot be empty.";
          } else if (confirmationText !== teamName) {
            confirmationError = "Team name does not match.";
          } else {
            confirmationError = "";
          }
        }}
        class="input-container mt-2 mb-1 {confirmationError
          ? 'error-border'
          : ''}"
      />
      {#if confirmationError}
        <p class="error-text">{confirmationError}</p>
      {/if}
      <br />
    {/if}
    <div
      class="d-flex align-items-center justify-content-between gap-3 mt-1 pb-3 mb-0 rounded"
      style="font-size: 16px;"
    >
      <div class="d-flex align-items-center">
        {#if teamLogo}
          <img class="team-icon me-2" src={base64ToURL(teamLogo)} alt="" />
        {/if}
        <p style="font-size:16px;" class="mb-0">{teamName}</p>
      </div>
      <CoverButton
        disable={deleteLoader || (confirmationText !== teamName && auth)}
        text={"Update Access"}
        size={14}
        type={"primary"}
        loader={deleteLoader}
        onClick={() => {
          handleDelete();
        }}
      />
    </div>
  </div>
</div>

<style lang="scss">
  .environment-delete-popup {
    .background-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: var(--background-hover);
      -webkit-backdrop-filter: blur(3px);
      backdrop-filter: blur(3px);
      z-index: 11;
    }

    .container {
      display: flex;
      flex-direction: column;
      position: fixed;
      max-width: 540px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: var(--background-color);
      z-index: 12;
      padding: 2%;
      border-radius: 10px;
    }

    .btn-close1 {
      background-color: var(--background-color);
    }

    .btn-close1:hover {
      background-color: var(--background-dropdown);
    }

    .btn-close1:active {
      background-color: var(--background-dropdown);
    }
    .btn-primary {
      background-color: var(--border-color);
    }

    .btn-primary:hover {
      color: var(--blackColor);
      background-color: var(--workspace-hover-color);
    }

    .btn-primary:active {
      color: var(--blackColor);
      background-color: var(--button-pressed);
    }

    .btn-secondary {
      background-color: var(--dangerColor);
    }

    .btn-secondary:hover {
      background-color: var(--delete-hover);
    }
    .team-icon {
      height: 24px;
      width: 24px;
    }
    .asterik {
      color: var(--dangerColor);
      margin-left: 4px;
    }
    .confirm-header {
      font-size: 14px;
    }
    .input-container {
      background-color: var(--background-dropdown);
      padding: 8px;
      border-radius: 4px;
      border: 1px solid var(--border-color) !important;
    }
    .error-text {
      margin-top: 2px;
      margin-bottom: 0 !important;
      color: var(--error--color);
      font-size: 12px;
    }
    .error-border {
      border: 1px solid var(--error--color) !important;
    }
  }
</style>
