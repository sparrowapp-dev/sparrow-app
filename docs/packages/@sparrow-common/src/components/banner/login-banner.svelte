<script>
  import { CrossIcon } from "@sparrow/library/icons";
  import { RocketIcon } from "@sparrow/library/icons";
  import { Link } from "svelte-navigator";
  export let isVisible = true;
  export let onClose;
  export let onClick;
</script>

{#if isVisible}
  <div class="ticker-container">
    <div class="ticker-container-div">
      <div style="margin-right: 16px;">
        <RocketIcon />
      </div>

      <div>
        <span class="txt-dark text-fs-14">Enjoying Sparrow?</span>
        <span class="txt-light text-fs-14"
          >Unlock the full power by creating an account or signing in.</span
        >
      </div>

      <div class="buttons">
        <button class="click-btn" on:click={onClick}>
          <span> Create an Account or Sign In</span>
        </button>
      </div>
    </div>
    <div class="cross-btn-div">
      <button class="cross-btn" on:click={onClose}>
        <CrossIcon
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
    height: 56px;
    background-color: var(--bg-primary-300);
    box-shadow: 0px 16px 48px 0px rgba(0, 0, 0, 0.17);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .cross-btn-div {
    margin-right: 25px;
  }
  .ticker-container-div {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
  }
  .cross-btn {
    background: none;
    border: none;
    cursor: pointer;
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
    padding-top: 2px;
    padding-bottom: 2px;
    padding-left: 12px;
    padding-right: 12px;
    color: transparent;
    border: 2px solid white;
    border-radius: 4px;
    font-weight: 500;
    font-size: 14px;
    background: white;
    background-clip: border-box;
    position: relative;
    z-index: 1;
  }

  .click-btn::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(270deg, #6147ff -1.72%, #1193f0 100%);
    z-index: -1;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-fill-color: transparent;
    clip-path: inset(0 0 0 0);
  }

  .click-btn span {
    background: linear-gradient(270deg, #6147ff -1.72%, #1193f0 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-fill-color: transparent;
    position: relative;
    z-index: 2;
  }
  .buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-left: 24px;
  }
  .txt-dark {
    font-weight: 500;
  }
  .txt-light {
    color: var(--white-color);
  }
</style>
