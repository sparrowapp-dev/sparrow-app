<script>
  import { CrossIcon } from "@sparrow/library/icons";
  import { RocketIcon } from "@sparrow/library/icons";
  import { Link } from "svelte-navigator";

  export let show = true;
  export let hideUpdater;
  export let onUpdate;
</script>

{#if show}
  <div class="ticker-container">
    <div>
      <RocketIcon />
    </div>

    <div>
      <span class="update-txt-dark">A new update is available : </span>
      <span class="update-txt-light"
        >Update & restart now for new features and improvements.</span
      >
    </div>

    <div class="buttons">
      <button class="relase-btn">
        <Link
          to="/app/help/updates"
          class="text-decoration-none text-whiteColor sparrow-fs-14 sparrow-fw-500"
        >
          See Release Notes
        </Link>
        <!-- See Release button -->
      </button>

      <button class="update-btn" on:click={onUpdate}> Update </button>

      <button class="cross-btn" on:click={hideUpdater}>
        <CrossIcon height={"16px"} width={"12px"} color={"var(--cross-icon)"} />
      </button>
    </div>
  </div>
{/if}

<style>
  .ticker-container {
    width: 100%;
    height: 56px;
    background-color: var(--bg-primary-300);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
  }

  .cross-btn {
    background: none;
    border: none;
    cursor: pointer;
    margin-left: 12px;
  }

  .relase-btn {
    padding-top: 4px;
    padding-bottom: 4px;
    padding-left: 12px;
    padding-right: 12px;
    color: white;
    border: 1px solid white;
    border-radius: 7px;
    background: transparent;
  }
  .update-btn {
    padding-top: 4px;
    padding-bottom: 4px;
    padding-left: 12px;
    padding-right: 12px;
    color: blue;
    border: 2px solid white;
    border-radius: 7px;
    font-weight: 500;
    background: white;
  }

  .buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-left: 32px;
  }

  .update-txt-dark {
    font-weight: 500;
  }

  .update-txt-light {
    color: var(--white-color);
  }
</style>
