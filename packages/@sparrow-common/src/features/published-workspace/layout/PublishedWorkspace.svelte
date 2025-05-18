<script lang="ts">
  import { fallingConfetti } from "@sparrow/common/images";
  import {
    CheckmarkStarburstFilled,
    LinkRegular,
    CopyRegular,
  } from "@sparrow/library/icons";
  import { Button } from "@sparrow/library/ui";
  import { onMount } from "svelte";

  export let onCopyLink;
  export let workspaceLink;
  export let workspaceName: string;
  let showConfetti = true;
  let isWorkspaceSharing = false;

  onMount(() => {
    setTimeout(() => {
      showConfetti = false;
    }, 4000);
  });
</script>

<div
  class="d-flex flex-column align-items-center"
  style=" gap:8px; padding-bottom: 24px;"
>
  <div>
    <CheckmarkStarburstFilled size="24px" color="var(--icon-ds-success-400)" />
  </div>
  <span
    class="d-flex align-items-center justify-content-center text-ds-font-weight-semi-bold text-ds-neutral-50 text-ds-font-size-16"
  >
    Congratulations! Your Workspace is Now Public</span
  >
  <div class="d-flex flex-column align-items-center">
    <span
      class="text-align-center text-ds-font-weight-medium text-ds-neutral-50 text-ds-font-size-14"
      style="text-align: center;"
      >Your workspace “{workspaceName}” has been successfully
      <br />
      published and is now live! <br /> Anyone with the link can explore what you've
      built.</span
    >
  </div>

  <div class="d-flex flex-row align-items-center" style="gap: 24px;">
    <div class="d-flex flex-row align-items-center" style="gap: 2px;">
      <LinkRegular />
      <span
        class="text-ds-font-size-14 text-ds-font-weight-medium text-decoration-underline text-truncate"
        style="max-width: 180px;"
      >
        {workspaceLink}</span
      >
    </div>
    <div>
      <Button
        title={isWorkspaceSharing ? "Copied" : "Copy link"}
        type={"primary"}
        size={"small"}
        onClick={async () => {
          await onCopyLink();
          isWorkspaceSharing = true;
          setTimeout(() => {
            isWorkspaceSharing = false;
          }, 3000);
        }}
      ></Button>
    </div>
  </div>
</div>
{#if showConfetti}
  <img
    src={fallingConfetti}
    alt="Confetti Animation"
    style="position: absolute; top: -40px; left: -121px; padding-top: 0px; padding-left: 0px; transform: rotate(36deg); width:150px; height:267px; overflow: hidden;"
  />

  <img
    src={fallingConfetti}
    alt="Confetti Animation"
    style="position: absolute; bottom: -40px; right: -121px; padding-top: 0px; padding-left: 0px; transform: rotate(36deg); width: 150px; height: 267px; overflow: hidden;"
  />
{/if}
