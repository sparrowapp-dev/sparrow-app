<script>
  import { CloudOffIcon } from "@sparrow/library/icons";
  import { CrossIconRounded } from "@sparrow/library/icons";

  import { Tooltip } from "@sparrow/library/ui";
  import { onMount } from "svelte";

  let showMessage = true;

  onMount(() => {
    //  showMessage = true;
    setTimeout(() => {
      showMessage = false;
    }, 10000); // 10 seconds
  });

  const hideMessage = () => {
    showMessage = false;
  };
</script>

{#if showMessage}
  <div class="tooltip-dropdown-div"></div>
  <div>
    <div class="tooltip-dropdown-data">
      <p style="margin-bottom:0px">
        You are using Sparrow <span style="color:var(--text-primary-300)"
          >Edge</span
        >, Sign in to enjoy all features!
      </p>
      <div class="CrossIcon-container" on:click={hideMessage}>
        <CrossIconRounded height="12px" width="12px" />
      </div>
    </div>
  </div>
{/if}

<Tooltip
  title={"You are using Sparrow <span style='color:var(--text-primary-300);'>Edge</span>, Sign in to enjoy all features!"}
  placement="bottom"
  show={!showMessage}
>
  <CloudOffIcon height="19px" width="23px" color="var(--icon-secondary-290)" />
</Tooltip>

<style>
  .CrossIcon-container {
    cursor: pointer;
  }
  .tooltip-dropdown-div {
    z-index: 0;
    position: absolute;
    top: 36px;
    border-radius: 2px;
    height: 20px;
    width: 20px;
    background-color: var(--bg-tertiary-400);
    transform: rotate(45deg); /* Rotate 45 degrees */
  }
  .tooltip-dropdown-data {
    font-weight: 400;
    z-index: 1;

    gap: 6px;
    top: 40px;
    border-radius: 3px;
    right: 245px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    height: 25px;
    width: 335px;
    font-size: 12px;
    background-color: var(--bg-tertiary-400);
  }
</style>
