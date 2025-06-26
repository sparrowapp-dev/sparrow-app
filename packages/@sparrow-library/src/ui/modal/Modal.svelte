<script lang="ts">
  import {
    DismissRegular,
    QuestionCircleRegular,
  } from "@sparrow/library/icons";
  import { downloadWarningIcon as warningIcon } from "@sparrow/library/assets";
  import { onDestroy } from "svelte";
  import { Button } from "../button";

  export let isOpen = false;
  export let title: string;
  export let canClose = true;
  export let icon = "";
  /**
   * Takes x-index, recommended values => 1, 100, 1000, 10000, 100000.
   */
  export let zIndex = 1000;
  export let width = "35%";
  /**
   * Callback function to close the modal.
   */
  export let handleModalState: (flag: boolean) => void;
  export let description: string;
  export let helpingIcon: boolean = false;
  export let onClickHelpIcon: () => void;

  const trapTab = (event: KeyboardEvent) => {
    if (event.key === "Tab") {
      event.preventDefault();
    } else if (event.key === "Escape" && canClose) {
      event.preventDefault();
      handleModalState(false);
    }
  };

  $: {
    if (isOpen) {
      document.addEventListener("keydown", trapTab);
    } else {
      document.removeEventListener("keydown", trapTab);
    }
  }

  onDestroy(() => {
    document.removeEventListener("keydown", trapTab);
  });
</script>

{#if isOpen}
  <div
    class="sparrow-modal-bg-overlay"
    style={`z-index: ${zIndex} !important`}
  />
  <div class="sparrow-modal-container" style={`z-index: ${zIndex + 1};`}>
    <div
      on:click={canClose ? handleModalState(false) : null}
      class="sparrow-modal-container-firstChild"
    ></div>

    <div
      class="sparrow-modal-container-data gap-2"
      style={`z-index: ${zIndex + 2}; width: ${width}`}
    >
      <div
        class="sparrow-modal-header justify-content-between d-flex align-items-start"
      >
        <div class="d-flex ellipsis">
          {#if icon === "warning"}
            <img src={warningIcon} height="26px" class="me-2" alt="" />
          {/if}
          <div class="flex-column">
            {#if title}
              <div class="d-flex flex-row align-items-center" style="gap: 8px;">
                <h3
                  class="text-ds-font-size-20 text-ds-line-height-120 text-ds-font-weight-semi-bold ellipsis"
                  style="color: var(--text-ds-neutral-50);"
                >
                  {title}
                </h3>
                {#if helpingIcon}
                  <div class="" style="margin-bottom: 6px;">
                    <Button
                      type="teritiary-regular"
                      size="small"
                      startIcon={QuestionCircleRegular}
                      onClick={() => {
                        onClickHelpIcon();
                      }}
                    />
                  </div>
                {/if}
              </div>
            {/if}
            {#if description}
              <h3 class="sparrow-modal-description fw-normal ellipsis">
                {description}
              </h3>
            {/if}
          </div>
        </div>
        {#if canClose}
          <Button
            size="extra-small"
            startIcon={DismissRegular}
            type="teritiary-regular"
            onClick={() => {
              handleModalState(false);
            }}
          />
        {/if}
      </div>

      <div class="sparrow-modal-body">
        <slot />
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  @keyframes smartFadeIn {
    0% {
      transform: scale(0.8);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes fadeOverlayIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  .sparrow-modal-bg-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: var(--background-hover);
    -webkit-backdrop-filter: blur(3px);
    backdrop-filter: blur(3px);
    animation: fadeOverlayIn 120ms ease-out both;
    animation-delay: 1ms;
  }
  .sparrow-modal-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .sparrow-modal-container-firstChild {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .sparrow-modal-container-data {
    position: relative;
    background-color: var(--bg-ds-surface-600);
    border-radius: 8px;
    padding: 30px 30px 20px 30px;
    animation: smartFadeIn 240ms ease-out both;
  }
  .sparrow-modal-heading {
    width: 400px;
    font-size: 20px;
    color: var(--text-ds-neutral-50);
    font-weight: 600;
    line-height: 24px;
  }

  .sparrow-modal-close-icon-btn {
    background-color: transparent;
    position: absolute;
    top: 24px;
    right: 24px;
  }
  .sparrow-modal-close-icon-btn:hover {
    background-color: var(--bg-tertiary-300);
    border-radius: 2px;
  }
  .sparrow-modal-close-icon-btn:active {
    background-color: var(--bg-danger-200);
    border-radius: 2px;
  }
  .sparrow-modal-description {
    font-size: 14px;
    color: var(--text-ds-neutral-100);
    font-weight: 400;
    line-height: 20px;
  }
</style>
