<script>
  import { appWindow } from "@tauri-apps/api/window";
  import closeIcon from "$lib/assets/close.svg";
  import resizeIcon from "$lib/assets/resize.svg";
  import minimizeIcon from "$lib/assets/minimize.svg";
  import sparrowicon from "$lib/assets/sparrowIcon.svg";

  const onMinimize = () => {
    appWindow.minimize();
  };

  const onClose = () => {
    appWindow.close();
  };

  const toggleSize = () => {
    appWindow.toggleMaximize();
  };
</script>

<section
  class="d-flex justify-content-between align-items-center bg-black border-0 border-bottom border-dark p-0"
  data-tauri-drag-region
>
  <div class="d-flex gap-3">
    <div class="logo">
      <img src={sparrowicon} alt="" class="w-100" />
    </div>
  </div>
  <div class="d-flex gap-0">
    <button on:click={onMinimize} class="btn btn-black button">
      <img src={minimizeIcon} alt="" class="w-100" />
    </button>
    <button on:click={toggleSize} class="btn btn-black button">
      <img src={resizeIcon} alt="" class="w-100" />
    </button>
    <button on:click={onClose} class="btn btn-black">
      <img src={closeIcon} alt="" class="w-100" />
    </button>
  </div>
</section>
