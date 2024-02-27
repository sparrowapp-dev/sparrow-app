<script lang="ts">
  /**
   * @deprecated This component is deprecated and will be removed in future releases.
   * Please use Button Component instead.
   */
  import Spinner from "../Transition/Spinner.svelte";

  enum BtnType {
    PRIMARY = "primary",
    DARK = "dark",
    DANGER = "danger",
    TRANSPARENT = "transparent",
  }

  export let text = "Submit";
  export let onClick: () => void;
  export let type: "primary" | "dark" | "danger" | "transparent" = "primary";
  export let fontSize = 16;
  export let disable = false;
  export let loader = false;
  export let classProp = "";
  export let styleProp = "";

  let btnClass = "";
  if (type === BtnType.PRIMARY) {
    btnClass = "custom-btn-primary";
  } else if (type === BtnType.DARK) {
    btnClass = "custom-btn-dark";
  } else if (type === BtnType.DANGER) {
    btnClass = "custom-btn-danger";
  } else if (type === BtnType.TRANSPARENT) {
    btnClass = "custom-btn-transparent";
  }
</script>

<button
  disabled={disable}
  style="font-size: {`${fontSize}px`}; margin-bottom: 4px; border-radius: 4px; padding: 6px 12px; {styleProp}"
  class="py-1 px-3 border-0 d-flex align-items-center {btnClass} {classProp}"
  on:click={() => {
    onClick();
  }}
>
  {#if loader}
    <span class="mx-2">
      {#if type === BtnType.PRIMARY || type === BtnType.DARK || type === BtnType.DANGER}
        <Spinner size={`${fontSize}px`} />
      {/if}
    </span>
  {/if}
  {text}</button
>

<style>
  .custom-btn-primary {
    background-color: var(--primary-btn-color);
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
  .custom-btn-transparent {
    background-color: transparent;
    color: var(--white-color);
  }
  .custom-btn-transparent:hover {
  }
</style>
