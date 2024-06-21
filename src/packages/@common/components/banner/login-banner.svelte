<script>
  import Cross from "@library/icons/Cross.svelte";
  import RocketIcon from "@library/icons/RocketIcon.svelte";
  import { Link } from "svelte-navigator";
  export let isVisible = true;
  export let onClose;
  export let onClick;
</script>

{#if isVisible}
  <div class="ticker-container">
    <div class="ticker-container-div">
      <div style="margin-right: 10px;">
        <RocketIcon />
      </div>

      <div>
        <span class="txt-dark">Enjoying Sparrow?</span>
        <span class="txt-light"
          >Unlock the full power by creating an account or signing in.</span
        >
      </div>

      <div class="buttons">
        <button class="click-btn" on:click={onClick}>
          Create an Account or Sign In
        </button>
      </div>
    </div>
    <div class="cross-btn-div">
      <button class="cross-btn" on:click={onClose}>
        <Cross
          height={"16px"}
          width={"12px"}
          color={"var(--icon-secondary-100)"}
        />
      </button>
    </div>
  </div>
{/if}

<style>
  .ticker-container {
    width: 100%;
    height: 46px;
    background-color: var(--bg-primary-300);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
  }
  .cross-btn-div {
    margin-right: 50px;
  }
  .ticker-container-div {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 90vw;
  }
  .cross-btn {
    background: none;
    border: none;
    cursor: pointer;
    /* margin-left: auto; */
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
  .click-btn {
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
  .txt-dark {
    font-weight: 500;
  }
  .txt-light {
    color: var(--white-color);
  }
</style>
