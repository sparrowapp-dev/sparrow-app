<script lang="ts">
  import { AISparkle } from "@sparrow/library/icons";

  export let title = "";
  export let onClick: (text: string) => void = () => {};
</script>

<div
  class="suggestion-button"
  on:click={() => {
    onClick(title);
  }}
>
  <AISparkle height={"20px"} width={"20px"} color={"var(--icon-primary-300)"} />
  <span class="title-txt">{title}</span>
</div>

<style>
  .title-txt {
    font-size: 12px;
    font-weight: 400;
    color: var(--text-secondary-100);
    padding: 5px;
  }
  .suggestion-button {
    display: flex;
    align-items: center;
    justify-content: end;
    background-color: var(--bg-primary-700);
    border: 1px solid var(--border-primary-300);
    border-radius: 4px;
    padding: 5px;
    height: 28px;
    font-size: 16px;
    cursor: pointer;
    transition:
      background-color 0.3s,
      box-shadow 0.3s;
    margin-bottom: 8px;
    right: 0;
  }

  .suggestion-button:hover {
    background-color: var(--bg-primary-800);
    box-shadow: 0px 0px 6px 0px var(--bg-primary-300);
  }
</style>
