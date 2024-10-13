<script lang="ts">
  import { onMount } from "svelte";
  import { notifications } from "@sparrow/library/ui";
  import { Progress } from "@sparrow/library/ui";
  import { Update, check } from "@tauri-apps/plugin-updater";
  import { relaunch } from "@tauri-apps/plugin-process";
  import { Modal } from "@sparrow/library/ui";
  import { Button } from "@sparrow/library/ui";

  let showProgressBar = false;
  let updateAvailable = false;
  let newAppVersion: string | undefined = "";
  let updater: Update | null;
  const WAIT_TIME_BEFORE_RESTART_IN_SECONDS = 5;
  onMount(async () => {
    try {
      updater = await check();
      if (updater?.available) {
        // notifications.info("Update Available");
        newAppVersion = updater.version;
        updateAvailable = true;
      }
    } catch (error) {
      console.error(error);
    }
  });

  const handleUpdatePopUp = (flag: boolean) => {
    updateAvailable = flag;
  };

  const initiateUpdate = async () => {
    try {
      updateAvailable = false;
      showProgressBar = true;
      if (updater) {
        await updater.downloadAndInstall();
        notifications.success(
          "Update Completed. Application will restart automatically.",
        );
        setTimeout(async () => {
          await relaunch();
        }, WAIT_TIME_BEFORE_RESTART_IN_SECONDS * 1000);
      }
    } catch (e) {
      notifications.error("Update Failed.");
      console.error(e);
    } finally {
      showProgressBar = false;
      updateAvailable = false;
    }
  };
</script>

{#if showProgressBar === true}
  <Progress onClick={handleUpdatePopUp} title="Update in progress" />{/if}

{#if updateAvailable === true}
  <Modal
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
    </div></Modal
  >{/if}

<style>
</style>
