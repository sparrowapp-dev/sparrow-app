<script>
  import { GithubIcon } from "@sparrow/library/icons";
  export let count = "0";
  export let onClick;
</script>

<div
  class="githubStar px-2 py-1 border-radius-2 d-flex align-items-center"
  on:click={onClick}
>
  <GithubIcon
    height={"18px"}
    width={"18px"}
    color={"var(--bg-ds-neutral-50)"}
  />
  <span
    class="text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium"
  >
    {count}
  </span>
</div>

<style>
  .githubStar {
    cursor: pointer;
    background-color: transparent;
    height: 28px;
    gap: 4px;
    padding: 4px;
    padding-right: 8px;
    color: var(--bg-ds-neutral-100);
  }
  .githubStar:hover {
    border-radius: 4px;
    background-color: var(--bg-ds-surface-300);
    color: var(--bg-ds-neutral-100);
  }
  .githubStar:active {
    color: var(--bg-ds-primary-300);
    background-color: var(--bg-ds-surface-400);
    border-radius: 4px;
  }
  .githubStar:focus-visible {
    color: var(--text-ds-neutral-50);
    border-radius: 4px;
    outline: none;
    border: 2px solid var(--border-ds-primary-300);
  }
</style>
