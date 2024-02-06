<script lang="ts">
  /**
   * @deprecated please so not use this file
   * **/
  import closeIcon from "$lib/assets/close.svg";
  import { CustomButton } from "$lib/components";
  import { fly, fade } from "svelte/transition";
  export let title;
  export let description;
  export let onSuccess;
  export let onCancel: () => void;
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
      onCancel();
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
      <button class="btn-close1 border-0 rounded" on:click={onCancel}>
        <img src={closeIcon} alt="" />
      </button>
    </div>
    <div style="font-size: 14px;" class="text-lightGray mb-1">
      {@html description}
    </div>
    <div
      class="d-flex align-items-center justify-content-end gap-3 mt-1 mb-0 pb-3 rounded"
      style="font-size: 16px;"
    >
      <CustomButton
        disable={deleteLoader}
        text={"Cancel"}
        fontSize={14}
        type={"dark"}
        loader={false}
        onClick={onCancel}
      />

      <CustomButton
        disable={deleteLoader}
        text={"Remove"}
        fontSize={14}
        type={"danger"}
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
  }
</style>
