<script lang="ts">
  import { DismissRegular, SparkleRegular } from "@sparrow/library/icons";
  import { Button } from "@sparrow/library/ui";
  import { SparkleColored } from "../../assets/images";

  // Props
  export let title: string = "Level Up Your Workflow!";
  export let message: string =
    "Great job on those successful API calls! We see a pattern here. We can automatically organize and create reusable variables for you.";
  export let buttonText: string = "Show Me How";
  export let onClose: () => void | Promise<void> = () => {};
  export let onAction: () => void | Promise<void> = () => {};
</script>

<div class="card custom-card gradient-border">
  <!-- header -->
  <div class="d-flex align-items-center mb-3">
    <div class="me-2">
      <span
        class="d-flex align-items-center justify-content-center"
        style="height: 32px; width: 32px; border-radius: 9999px; background-color: var(--bg-ds-surface-300);"
      >
        <SparkleColored />
      </span>
    </div>
    <div class="flex-grow-1 fw-semibold">{title}</div>
    <Button
      size="small"
      startIcon={DismissRegular}
      type={"teritiary-regular"}
      onClick={onClose}
    />
  </div>

  <!-- message -->
  <div class="card-message me-2 mb-4">
    {message}
  </div>

  <div class="d-flex align-items-center justify-content-end">
    <Button
      type="secondary"
      size="medium"
      startIcon={SparkleRegular}
      title={buttonText}
      onClick={onAction}
    />
  </div>
</div>

<style>
  .custom-card {
    background: var(--bg-ds-surface-600);
    color: var(--text-ds-neutral-50);
    padding: 16px;
    border-radius: 8px;
    width: 320px;
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: 12px;
    line-height: 1.5;
    letter-spacing: 0%;
    vertical-align: middle;
  }
  .card-message {
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-style: normal;
    font-size: 12px;
    color: var(--text-ds-neutral-100);
    line-height: 1.5;
    letter-spacing: 0;
    vertical-align: middle;
  }
  .gradient-border {
    border: double 1px transparent;
    border-radius: 8px;
    background-image: linear-gradient(
        var(--bg-ds-surface-600),
        var(--bg-ds-surface-600)
      ),
      linear-gradient(124.46deg, #11adf0 0%, #316cf6 50.69%, #6147ff 101.37%);
    background-origin: border-box;
    background-clip: padding-box, border-box;
  }
</style>
