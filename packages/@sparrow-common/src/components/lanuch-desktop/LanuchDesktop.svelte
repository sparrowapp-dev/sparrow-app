<script>
  import { MacIcon, WindowsIcon } from "@sparrow/library/icons";
  import { onMount } from "svelte";
  export let launchSparrowWebApp;
  let windowOs = true;
  const getOS = () => {
    let userAgent = window.navigator.userAgent;
    if (userAgent.indexOf("Mac") != -1) {
      windowOs = true;
    } else if (userAgent.indexOf("Windows") != -1) {
      windowOs = false;
    }
  };
  onMount(() => {
    getOS();
  });
</script>

<section class="px-2 pb-3">
  <button
    id="isExpandLoginButton"
    class="d-flex align-items-center rounded-1 me-0 mb-0 p-2"
    style="border:none; cursor:pointer; justify-content:center; height:32px; background-color:var(--bg-primary-300); width:100%;"
    on:click={launchSparrowWebApp}
  >
    <div class="d-flex align-items-center justify-content-center">
      {#if windowOs}
        <MacIcon height="12px" width="12px" color="white" />
      {:else}
        <WindowsIcon height="12px" width="12px" color="white" />
      {/if}

      <p
        class="ms-2 mb-0 text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium"
      >
        Launch Sparrow App
      </p>
    </div>
  </button>
</section>
