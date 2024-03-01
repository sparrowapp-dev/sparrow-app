<script lang="ts">
  import { onMount } from "svelte";
  import { notifications } from "$lib/components/toast-notification/ToastNotification";
  import ProgressBar from "$lib/components/Transition/progress-bar/ProgressBar.svelte";
  import { Update, check } from "@tauri-apps/plugin-updater";
  import { relaunch } from "@tauri-apps/plugin-process";
  import { ModalWrapperV1 } from "$lib/components";
  import Button from "$lib/components/buttons/Button.svelte";
  import { platform } from "@tauri-apps/plugin-os";
  import { open } from "@tauri-apps/plugin-shell";
  import constants from "$lib/utils/constants";

  let showProgressBar = false;
  let updateAvailable = false;
  let newAppVersion: string | undefined = "";
  let updater: Update | null;

  const externalSparrowDownloadLink = constants.SPARROW_DOWNLOAD_LINK;

  let windowsUpdateAvailable = false;
  onMount(async () => {
    try {
      updater = await check();
      if (updater?.available) {
        notifications.info("Update Available");
        newAppVersion = updater.version;
        const os = await platform();
        if (os === "windows") {
          windowsUpdateAvailable = true;
        } else if (os === "macos") {
          updateAvailable = true;
        }
      }
    } catch (error) {
      console.error(error);
    }
  });

  const handleUpdatePopUp = (flag: boolean) => {
    updateAvailable = flag;
    windowsUpdateAvailable = flag;
  };

  const initiateUpdate = async () => {
    try {
      updateAvailable = false;
      showProgressBar = true;
      if (updater) {
        await updater.downloadAndInstall();
        notifications.success(
          "Update Completed. Kindly restart the application.",
        );
        await relaunch();
      }
    } catch (e) {
      notifications.error("Update Failed!");
      console.error(e);
    } finally {
      showProgressBar = false;
      updateAvailable = false;
    }
  };
</script>

{#if showProgressBar === true}
  <ProgressBar onClick={handleUpdatePopUp} title="Update in progress" />{/if}

{#if updateAvailable === true}
  <ModalWrapperV1
    title={`New Update Available - v${newAppVersion}`}
    type={"primary"}
    width={"50%"}
    zIndex={1000}
    isOpen={updateAvailable}
    handleModalState={handleUpdatePopUp}
  >
    <div class="text-lightGray mb-1 sparrow-fs-14">
      <p>Update for new features and improvements</p>
    </div>
    <div
      class="d-flex align-items-center justify-content-end gap-3 mt-1 mb-0 rounded"
    >
      <Button
        disable={showProgressBar}
        title={"Cancel"}
        textStyleProp={"font-size: var(--base-text)"}
        type={"dark"}
        loader={false}
        onClick={() => {
          updateAvailable = false;
        }}
      />

      <Button
        disable={showProgressBar}
        title={"Update"}
        textStyleProp={"font-size: var(--base-text)"}
        type={"primary"}
        loader={false}
        onClick={initiateUpdate}
      />
    </div></ModalWrapperV1
  >{/if}

{#if windowsUpdateAvailable === true}
  <ModalWrapperV1
    title={`New Update Available - v${newAppVersion}`}
    type={"primary"}
    width={"50%"}
    zIndex={1000}
    isOpen={windowsUpdateAvailable}
    handleModalState={handleUpdatePopUp}
    icon={"warning"}
  >
    <div class="text-lightGray mb-1 sparrow-fs-14">
      <p>
        Auto update is a known issue for Windows users in Sparrow. Kindly visit
        Github to download the latest version for new features and improvements.
      </p>
    </div>
    <div
      class="d-flex align-items-center justify-content-end gap-3 mt-1 mb-0 rounded"
    >
      <Button
        disable={false}
        title={"Cancel"}
        textStyleProp={"font-size: var(--base-text)"}
        type={"dark"}
        loader={false}
        onClick={() => {
          windowsUpdateAvailable = false;
        }}
      />

      <Button
        disable={false}
        title={"Go to Download Page"}
        textStyleProp={"font-size: var(--base-text)"}
        type={"primary"}
        loader={false}
        onClick={async () => {
          await open(externalSparrowDownloadLink);
          windowsUpdateAvailable = false;
        }}
      />
    </div></ModalWrapperV1
  >{/if}

<style>
</style>
