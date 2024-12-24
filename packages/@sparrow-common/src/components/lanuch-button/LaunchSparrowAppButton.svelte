<script>
  import { MacIcon, WindowsIcon } from "@sparrow/library/icons";
  export let windowOs;
  export let handleMouseOver;
  export let handleMouseOut;
  export let launchSparrowWebApp;
</script>

<section class="px-3 pb-3">
  <button
    id="isExpandLoginButton"
    class="d-flex align-items-center rounded-1 me-0 mb-0 p-2"
    style="border:none; cursor:pointer; justify-content:center; height:32px; background-color:var(--bg-primary-300); width:100%;"
    on:mouseover={handleMouseOver}
    on:mouseout={handleMouseOut}
    on:click={launchSparrowWebApp}
  >
    <div class="d-flex align-items-center justify-content-center">
      {#if windowOs}
        <MacIcon height="12px" width="12px" color="white" />
      {:else}
        <WindowsIcon height="12px" width="12px" color="white" />
      {/if}

      <p class="ms-2 mb-0 text-fs-12" style="font-weight: 500;">
        Launch Sparrow App
      </p>
    </div>
  </button>
</section>
