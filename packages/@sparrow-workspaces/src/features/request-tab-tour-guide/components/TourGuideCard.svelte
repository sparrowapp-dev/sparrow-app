<script lang="ts">
  import { Button } from "@sparrow/library/ui";

  export let titleName: string = "";
  export let descriptionContent: string = "";
  export let cardNumber: number = 0;
  export let totalsCards: number = 0;
  export let rightButtonName: string = "";
  export let onNext: () => void = () => {};
  export let onClose: () => void = () => {};
  export let width: number = 352;

  function handleClose(event: Event) {
    event.stopPropagation();
    onClose();
  }

  function handleNext(event: Event) {
    event.stopPropagation();
    onNext();
  }
</script>

<div class="tour-container" style="width: {width}px;">
  <div class="card-header">
    <div class="title-name-text">{titleName}</div>
  </div>

  <div class="card-content">
    {#if descriptionContent}
      <div class="description-content-text">{descriptionContent}</div>
    {:else}
      <div class="description-content-text">
        <slot name="description-content" />
      </div>
    {/if}
  </div>

  <div class="card-footer">
    <div class="step-counter">
      {#if rightButtonName === "" || cardNumber > 0}
        <span class="guide-card-text">{cardNumber}/{totalsCards}</span>
      {/if}
    </div>

    <div class="button-group">
      {#if rightButtonName === ""}
        <Button
          type="outline-secondary"
          size="small"
          title="Dismiss"
          onClick={handleClose}
        />
      {/if}
      <Button
        type="primary"
        size="small"
        title={rightButtonName !== "" ? rightButtonName : "Next"}
        onClick={handleNext}
      />
    </div>
  </div>
</div>

<style>
  .tour-container {
    background-color: var(--bg-ds-surface-500);
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    overflow: hidden;
    font-family: "Inter", sans-serif;
  }

  .card-header {
    padding: 12px 16px 0 16px;
  }

  .card-content {
    padding: 8px 16px 12px 16px;
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px 12px 16px;
  }

  .title-name-text {
    color: var(--text-ds-neutral-50);
    font-weight: 600;
    font-size: 14px;
    margin: 0;
    line-height: 1.4;
  }

  .description-content-text {
    color: var(--text-ds-neutral-300);
    font-weight: 400;
    font-size: 12px;
    line-height: 1.5;
    margin: 0;
  }

  .step-counter {
    display: flex;
    align-items: center;
  }

  .guide-card-text {
    color: var(--text-ds-neutral-400);
    font-weight: 500;
    font-size: 11px;
    margin: 0;
  }

  .button-group {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  @media (max-width: 768px) {
    .tour-container {
      max-width: calc(100vw - 32px);
    }

    .card-header,
    .card-content,
    .card-footer {
      padding-left: 12px;
      padding-right: 12px;
    }
  }
</style>
