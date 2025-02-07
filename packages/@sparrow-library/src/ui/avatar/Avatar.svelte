<script lang="ts">
  export let type: "person" | "letter" | "image" = "person";
  export let size: "small" | "medium" | "large" = "medium";
  import { PersonIcon } from "../../assets";
  export let Image: any = null;
  export let letter: string = "";
</script>

<div class="avatar {size} {type}">
  {#if type === "person"}
    <PersonIcon />
  {:else if type === "letter"}
    {letter.charAt(0).toUpperCase()}
  {:else if type === "image" && Image}
    <img src={Image} alt="Avatar" class="avatar-image" />
  {/if}
</div>

<style>
  .avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }

  .small {
    width: 24px;
    height: 24px;
  }
  .medium {
    width: 28px;
    height: 28px;
  }
  .large {
    width: 36px;
    height: 36px;
  }

  .person {
    border: 2px solid var(--bg-ds-surface-50);
    background-color: var(--bg-ds-surface-100);
  }

  .letter {
    background-color: var(--bg-ds-secondary-400);
    color: var(--bg-ds-neutral-50);
    border: 2px solid var(--bg-ds-surface-50);
  }

  .image {
    object-fit: cover;
  }
  .avatar-image{
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
</style>
