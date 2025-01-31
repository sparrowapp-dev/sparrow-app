<script>
  import DownloadIconWeb from "./icons/DownloadIconWeb.svg";
  import { Button } from "@sparrow/library/ui";
  import { createEventDispatcher, onMount } from "svelte";

  export let onInstallRedirect;
  export let onGithubRedirect;
  export let onDocsRedirect;

  const dispatch = createEventDispatcher();
  let visible = false;
  onMount(() => {
    visible = true;
  });

  const openSparrowApp = () => {
    onInstallRedirect();
    dispatch("close");
  };
  function closePopup() {
    visible = false;
    dispatch("close");
  }
</script>

<div class="popup-overlay" class:visible on:click={closePopup}>
  <div class="popup-content" class:visible on:click|stopPropagation>
    <div class="pt-2 pb-4">
      <p class="welcome-text">
        Switch to the <span class="gradient-text">Sparrow</span> desktop app
      </p>
      <p class="description">
        Get the Sparrow desktop app for enhanced experience.
      </p>
      <ul class="feature-list">
        <li>Seamless Sync: Automatically sync between web and desktop.</li>
        <li>
          Exclusive Features: Access full features including REST API,
          WebSockets, Test flows, and more on the desktop version.
        </li>
      </ul>
    </div>
    <div class="d-flex justify-content-between">
      <p class="description">
        Need help? Visit our <a on:click={onDocsRedirect}>Documentation</a>
        <br />
        Check out our
        <a on:click={onGithubRedirect}>GitHub Page</a>
      </p>
      <Button
        title="Install Sparrow Desktop"
        textStyleProp="font-size:16px; font-weight:400;"
        type="primary"
        buttonStyleProp={"height:38px; weight:126px; border-color:var(--border-primary-300) !important; font-size:14px; "}
        buttonClassProp={`mt-2`}
        buttonStartIcon={DownloadIconWeb}
        buttonStartIconStyle="height:16px; width:16px;"
        onClick={openSparrowApp}
      />
    </div>
  </div>
</div>

<style>
  .popup-overlay.visible {
    opacity: 1;
    visibility: visible;
  }
  .popup-content.visible {
    opacity: 1;
    transform: scale(1);
  }
  .gradient-text {
    display: inline-block;
    background: linear-gradient(270deg, #6147ff 2.55%, #1193f0 31.48%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .welcome-text {
    color: var(--text-secondary-100);
    font-size: 20px;
    font-weight: 500;
  }
</style>
