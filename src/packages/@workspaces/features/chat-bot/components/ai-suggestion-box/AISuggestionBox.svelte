<script lang="ts">
  import { AISparkle } from "../../assests";

  export let title = "";
  export let onClick: (text: string) => void = () => {};
</script>

<div
  class="generate-curl-button"
  on:click={() => {
    onClick(title);
  }}
>
  <AISparkle />
  <span class="title-txt">{title}</span>
</div>

<style>
  .title-txt {
    font-size: 12px;
    font-weight: 400;
    color: var(--text-secondary-100);
    padding: 5px;
  }
  .generate-curl-button {
    display: flex;
    align-items: center;
    justify-content: end;
    background-color: var(--bg-primary-700); /* Dark blue background color */
    border: 1px solid var(--border-primary-300); /* Blue border color */
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
    /* width: fit-content; */
    /* text-align: right; */
  }

  .generate-curl-button:hover {
    background-color: #1e2a47; /* Slightly lighter dark blue on hover */
    box-shadow: 2px 2px 12px 0.5px #3670f7;
  }
</style>
