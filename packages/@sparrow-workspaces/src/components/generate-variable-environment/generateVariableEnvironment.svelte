<script lang="ts">
  import { Button } from "@sparrow/library/ui";
  export let environmentAxisX: number;
  export let environmentAxisY: number;
  export let handleCloseMode: () => void;
</script>

<div
  class="main-container"
  style="
      top:{environmentAxisY}px;
      left:{environmentAxisX}px;
      "
>
  <p class="title-text">How to Use Variables</p>
  <p class="description-text">
    {`Great work! Your new variables are ready. To use one in the URL bar or any input, 
    just type {{ to open a list of your saved variables.`}<br />
    <span>{`For example: {{base_url}/users`}</span>
  </p>

  <Button
    disable={false}
    type="primary"
    size="medium"
    title="Got it"
    onClick={handleCloseMode}
  />
</div>

<style>
  .main-container {
    width: 271px;
    padding: 12px;
    border-radius: 8px;
    background-color: var(--bg-ds-surface-600);
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: relative;
    z-index: 10000;
  }

  .title-text {
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: 12px;
    line-height: 130%;
    color: var(--text-ds-neutral-50);
    margin: 4px 8px;
  }

  .description-text {
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: 12px;
    line-height: 150%;
    color: var(--text-ds-neutral-200);
    margin: 0px 8px;
  }
</style>
