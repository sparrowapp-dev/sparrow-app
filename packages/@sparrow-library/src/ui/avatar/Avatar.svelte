<script lang="ts">
  export let type: "person" | "letter" | "image" = "person";
  export let size: "extra-small" | "small" | "medium" | "large" = "small";
  import { PersonIcon } from "../../icons";
  export let image: any = null;
  export let letter: string = "";
  export let bgColor = "var(--bg-tertiary-800)";

  let textStyle = "";
  if (size === "extra-small") {
    textStyle =
      "text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium";
  } else if (size === "small") {
    textStyle =
      "text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium";
  } else if (size === "medium") {
    textStyle =
      "text-ds-font-size-14 text-ds-line-height-143 text-ds-font-weight-medium";
  } else if (size === "large") {
    textStyle =
      "text-ds-font-size-16 text-ds-line-height-150 text-ds-font-weight-medium";
  } else {
    textStyle =
      "text-ds-font-size-14 text-ds-line-height-143 text-ds-font-weight-medium";
  }
</script>

<div
  class="avatar {size} {textStyle} {type}"
  style="--avatar-bg-color: {bgColor};"
>
  {#if type === "person"}
    <PersonIcon />
  {:else if type === "letter"}
    {letter.toUpperCase()}
  {:else if type === "image" && Image}
    <img src={image} alt="Avatar" class="avatar-image" />
  {/if}
</div>

<style>
  .avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }

  .extra-small {
    width: 24px;
    height: 24px;
  }
  .small {
    width: 28px;
    height: 28px;
  }
  .medium {
    width: 36px;
    height: 36px;
    /* font-size: 14px; */
  }
  .large {
    width: 40px;
    height: 40px;
    /* font-size: 16px; */
  }
  .person {
    border: 2px solid var(--bg-ds-surface-50);
    background-color: var(--bg-ds-surface-100);
  }
  .letter {
    background-color: var(--avatar-bg-color, var(--bg-ds-secondary-400));
    color: var(--bg-ds-neutral-50);
    border: 2px solid var(--bg-ds-surface-50);
  }
  .image {
    object-fit: cover;
  }
  .avatar-image {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
</style>
