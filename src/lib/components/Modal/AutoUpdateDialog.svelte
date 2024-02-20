<script lang="ts">
  import { onMount } from "svelte";
  import { notifications } from "$lib/components/toast-notification/ToastNotification";
  import { checkUpdate, installUpdate } from "@tauri-apps/api/updater";
  import ProgressBar from "$lib/components/Transition/progress-bar/ProgressBar.svelte";
  import { relaunch } from "@tauri-apps/api/process";
  import { ModalWrapperV1 } from "$lib/components";
  import Button from "$lib/components/buttons/Button.svelte";

  let showProgressBar = false;
  let updateAvailable = false;
  let newAppVersion: string | undefined = "";

  onMount(async () => {
    try {
      const { shouldUpdate, manifest } = await checkUpdate();
      if (shouldUpdate) {
        notifications.info("Update Available");
        newAppVersion = manifest?.version;
        updateAvailable = true;
      }
    } catch (error) {
      console.error(error);
    }
  });

  const handleUpdatePopUp = (flag: boolean) => {
    updateAvailable = flag;
  };
</script>

{#if showProgressBar === true}
  <ProgressBar onClick="" title="Update in progress" />{/if}

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
        onClick={() => {
          updateAvailable = false;
          showProgressBar = true;
          installUpdate()
            .then(() => {
              showProgressBar = false;
              notifications.success("Update Completed. App will relaunch now!");
              relaunch();
            })
            .catch(() => {
              showProgressBar = false;
              notifications.error("Update Failed!");
            });
        }}
      />
    </div></ModalWrapperV1
  >{/if}

<style>
</style>
