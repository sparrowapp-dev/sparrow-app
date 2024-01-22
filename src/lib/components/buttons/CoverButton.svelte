<script lang="ts">
  import Spinner from "../Transition/Spinner.svelte";

  export let text: string;
  export let onClick;
  export let type;
  export let size;
  export let disable: boolean = false;
  export let loader = false;
  let btnClass = "";
  if (type === "primary") {
    btnClass = "custom-btn-primary";
  } else if (type === "dark") {
    btnClass = "custom-btn-dark";
  } else if (type === "danger") {
    btnClass = "custom-btn-danger";
  }
</script>

<button
  disabled={disable}
  style="font-size: {`${size}px`}; margin-bottom:4px; padding: 6px 12px;"
  class="btn d-flex align-items-center {btnClass}"
  on:click={() => {
    onClick();
  }}
>
  {#if loader}
    <span class="mx-2">
      {#if type === "primary" || type === "dark" || type === "danger"}
        <Spinner size={`${size}px`} />
      {/if}
    </span>
  {/if}
  {text}</button
>

<style>
  .custom-btn-primary {
    background-color: var(--sparrow-blue);
    color: var(--white-color);
  }
  .custom-btn-dark {
    background-color: var(--border-color);
    color: var(--white-color);
  }
  .custom-btn-dark:hover {
    background-color: var(--sparrow-button-background);
  }
  .custom-btn-danger {
    background-color: var(--dangerColor);
    color: var(--blackColor);
  }
  .custom-btn-danger:hover {
    background-color: var(--delete-hover);
  }
</style>
