<script lang="ts">
  import { Button } from "@sparrow/library/ui";

  export let TitleName: string = "";
  export let DescriptionContent: string = "";
  export let CardNumber: number = 0;
  export let TotalsCards: number = 0;
  export let rightButtonName: string = "";
  export let placement: "left" | "right" = "left";
  export let onNext: () => void = () => {};
  export let onClose: () => void = () => {};
  export let top: number = 0;
  export let left: number = 0;
  export let right: number = 0;
  export let width: number = 352;

  function handleClose() {
    onClose();
  }

  function handleNext(event: Event) {
    event.stopPropagation();
    onNext();
  }
</script>

<div
  class="tour-container"
  style="
    top: {top}px;
    width: {width}px;
    {placement === 'left' ? `left: ${left}px;` : `right: ${right}px;`}
  "
>
  <div class="py-1 px-2">
    <div class="title-name-text">{TitleName}</div>
    <div class="description-content-text">{DescriptionContent}</div>
  </div>
  <div
    class={`d-flex ${
      rightButtonName === ""
        ? "justify-content-between"
        : CardNumber > 0
          ? "justify-content-between"
          : "justify-content-end"
    } px-2`}
  >
    <div class="d-flex justify-content-center align-items-center">
      <p class="guide-card-text" style="margin: 0px;">
        {#if rightButtonName === "" || CardNumber > 0}
          {CardNumber}/{TotalsCards}
        {/if}
      </p>
    </div>
    <div class="d-flex justify-content-center align-items-center gap-1">
      {#if rightButtonName === ""}
        <Button
          type="outline-secondary"
          size="small"
          title="Dismiss"
          onClick={() => {
            handleClose();
          }}
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
    position: absolute;
    background-color: var(--bg-ds-surface-500);
    border-radius: 8px;
    padding: 12px;
    z-index: 100000;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .title-name-text {
    color: var(--text-ds-neutral-50);
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: 12px;
    text-align: left;
    margin-bottom: 4px;
  }

  .description-content-text {
    color: var(--text-ds-neutral-300);
    font-weight: 400;
    font-size: 12px;
    text-align: left;
    line-height: 1.4;
  }

  .guide-card-text {
    color: var(--text-ds-neutral-300);
    font-weight: 400;
    font-size: 12px;
  }

  @media (max-width: 768px) {
    .tour-container {
      max-width: calc(100vw - 40px);
    }
  }

  @media (max-width: 480px) {
    .tour-container {
      max-width: calc(100vw - 20px);
    }
  }
</style>
