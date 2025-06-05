<script lang="ts">
  import {
    DiscordIcon,
    DiscordLogo,
    HelpCenterIcon,
    QuestionCircleRegular,
    SettingIcon,
    SettingsRegular,
  } from "@sparrow/library/icons";
  import { Tooltip } from "@sparrow/library/ui";
  import { DiscordIDs } from "@sparrow/support/constants/discord.constants";
  import { open } from "@tauri-apps/plugin-shell";

  export let onJoin;
</script>

<div
  class="d-flex flex-column align-items-center gap-2"
  style="height: 234px ; background-color: var(--bg-ds-surface-600); border-radius: 6px;"
>
  <div style="padding-top:22px;">
    <DiscordLogo width="74px" height="56px" />
  </div>
  <div
    class="align-self-center text-ds-font-size-14 text-ds-font-weight-medium pt-1"
  >
    Join our Discord Channel
  </div>
  <div
    class="text-center text-ds-font-size-14"
    style="color: var(--text-ds-neutral-400);"
  >
    <span> Join our Discord channel to </span>
    <span><br /> connect with the community.</span>
  </div>
  <div
    class="w-100"
    style="padding-top:10px; padding-left:19px; padding-right:19px;"
  >
    <Tooltip title="Join Community" placement="bottom-center" distance={15}>
      <div
        class="w-100 join-button d-flex justify-content-center align-items-center gap-8 align-self-center"
        role="button"
        style=" height:36px; background-color: var(--dropdown-button); border-radius:6px;"
        on:click={async () => {
          onJoin();
        }}
      >
        <div
          class="fw-normal text-ds-font-size-14"
          style=" color:var(--white-color);"
        >
          Join
        </div>
      </div>
    </Tooltip>
  </div>
</div>
<div class="d-flex flex-column" style="padding-top:24px; padding-left:10px;">
  <div
    class="d-flex align-items-center gap-2"
    style="height: 36px; color:var(--text-ds-neutral-200);"
  >
    <Tooltip placement="right-center" title="Coming Soon">
      <div class="d-flex gap-2">
        <SettingsRegular />
        <span class="text-ds-font-size-14">Support</span>
      </div>
    </Tooltip>
  </div>
  <div
    class="d-flex align-items-center gap-2"
    style="height: 36px; color:var(--text-ds-neutral-200);"
  >
    <Tooltip placement="right-center" title="Coming Soon">
      <div class="d-flex gap-2">
        <QuestionCircleRegular />
        <span class="text-ds-font-size-14">Help Center</span>
      </div>
    </Tooltip>
  </div>
</div>

<style>
  .join-button:hover {
    background-color: var(--dropdown-hover) !important;
  }

  .join-button:active {
    background-color: var(--bg-primary-500) !important;
  }
</style>
