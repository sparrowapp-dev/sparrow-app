<script lang="ts">
  import { SparkleFilled } from "@sparrow/common/icons";

  export let title = "";
  export let onClick: (text: string) => void = () => {};
</script>

<div
  class="suggestion-button"
  on:click={() => {
    onClick(title);
  }}
>
  <SparkleFilled
    height="20px"
    width="20px"
    colors={[
      "var(--icon-ds-info-400)",
      "var(--icon-ds-primary-400)",
      "var(--icon-ds-secondary-300)",
    ]}
  />

  <span
    class="title-txt text-ds-font-size-12 text-ds-font-weight-medium text-ds-line-height-150"
    >{title}</span
  >
</div>

<style>
  .title-txt {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary-100);
    padding: 5px;
  }
  .suggestion-button {
    display: flex;
    align-items: center;
    justify-content: end;
    background-color: var(--bg-ds-surface-700);
    border: 1px solid var(--border-ds-surface-100);
    border-radius: 4px;
    padding: 5px;
    height: 28px;
    font-size: 16px;
    cursor: pointer;
    transition:
      background-color 0.3s,
      box-shadow 0.3s;
    margin-bottom: 4px;
    right: 0;
  }

  .suggestion-button:hover {
    box-shadow: 0px 0px 6px 0px var(--bg-primary-300);
  }
</style>
