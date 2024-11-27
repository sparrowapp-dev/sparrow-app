<script>
  import {
    CrossIconV2,
    DoubleResizeIcon,
    ExpandIcon,
    MiniMizeIcon,
    SquareIcon,
  } from "@sparrow/library/icons";
  import { getCurrentWindow } from "@tauri-apps/api/window";

  export let isWindows = true;

  export let isMaximizeWindow = false;

  const appWindow = getCurrentWindow();

  const onMinimize = () => {
    appWindow.minimize();
  };

  const onClose = () => {
    appWindow.close();
  };

  const toggleSize = () => {
    appWindow.toggleMaximize();
    isMaximizeWindow = !isMaximizeWindow;
  };
</script>

{#if isWindows}
  <!-- Windows Style Buttons -->
  <div class="d-flex">
    <div class="controller-btn">
      <button
        on:click={onMinimize}
        class="custom-header-button button-minus border-0 py-1 px-1"
      >
        <MiniMizeIcon
          height={"10"}
          width={"10"}
          color={"var(--text-secondary-300)"}
        />
      </button>
    </div>

    <div class="controller-btn">
      <button
        on:click={toggleSize}
        class="custom-header-button button-resize border-0 py-1 px-1"
        id="resize-button"
      >
        {#if isMaximizeWindow}
          <DoubleResizeIcon
            height={"10"}
            width={"10"}
            color={"var(--text-secondary-300)"}
          />
        {:else}
          <SquareIcon
            height={"10"}
            width={"10"}
            color={"var(--text-secondary-300)"}
          />
        {/if}
      </button>
    </div>

    <div class="controller-btn">
      <button
        on:click={onClose}
        class="custom-header-button button-close border-0 py-1 px-1"
      >
        <CrossIconV2
          height={"10"}
          width={"10"}
          color={"var(--text-secondary-300)"}
        />
      </button>
    </div>
  </div>
{:else}
  <!-- Mac Style Buttons -->
  <div class="d-flex mac-container me-2">
    <div on:click={onClose} class="mac-nav">
      <div class="icon ">
        <CrossIconV2
          height={"6"}
          width={"6"}
          color={"#285F17"}
        />
      </div>
    </div>
    <div on:click={onMinimize} class="mac-nav">
      <div class="icon">
        <MiniMizeIcon
          height={"6"}
          width={"6"}
          color={"black"}
        />
      </div>
    </div>
    <div on:click={toggleSize} id="resize-button" class="mac-nav">
      <div class="icon">
        <ExpandIcon
          height={"6"}
          width={"6"}
          color={"#285F17"}/>
      </div>
    
    </div>
  </div>
{/if}

<style>
  .mac-nav .icon {
    display: none; /* Hide the icons by default */
    margin-bottom: 1px;
  }
  .mac-container:hover .icon {
    display: block; /* Show the icon when the container is hovered */
  }

  .icon{
    display: flex;
    align-items: center;
    justify-content: center;  
  }

  .mac-nav {
    height: 12px;
    width: 12px;
    border-radius: 50%;
    display: flex;
    align-items: center !important;
    justify-content: center !important;
  }

  .mac-nav:nth-child(1) {
    background-color: #EC6A5E;
  }

  .mac-nav:nth-child(2) {
    background-color: #F5BE4F;
    margin: 0 10px;
  }

  .mac-nav:nth-child(3) {
    background-color: #62C554;
    margin-left: 1pxz
  }

  .custom-header-button {
    background-color: transparent;
    color: var(--text-primary-300);
    cursor: pointer;
  }

  .d-flex {
    display: flex;
    align-items: center;
  }


  .button-minus,
  .button-resize,
  .button-close {
    background-color: transparent;
    border: none;
  }

  .button-minus:hover,
  .button-resize:hover {
    background-color: rgba(128, 128, 128, 0.288);
  }

  .button-close:hover {
    background-color: rgb(207, 12, 12);
  }
 
 
 
  .controller-btn button {
    height: 42px;
    width: 42px;
  }
 
</style>
