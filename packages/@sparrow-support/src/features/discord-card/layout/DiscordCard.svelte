<script lang="ts">
  import {
    DiscordIcon,
    HelpCenterIcon,
    SettingIcon,
  } from "@sparrow/library/icons";
  import { Tooltip } from "@sparrow/library/ui";
  import { DiscordIDs } from "@sparrow/support/constants/discord.constants";
  import { open } from "@tauri-apps/plugin-shell";

  export let onJoin;
</script>

<div
  class="d-flex flex-column align-items-center gap-2"
  style="height: 236px ; background-color: var(--text-tertiary-400) ; border-radius:4px;"
>
  <div style="padding-top:22px; ">
    <div
      class="d-flex justify-content-center align-items-center"
      style="width:56px; height:56px; border-radius:15.56px ; background-color: var(--bg-primary-150 ); "
    >
      <DiscordIcon width="49px" height="49px" />
    </div>
  </div>
  <div class="fw-bold align-self-center" style="font-size: 14px;">
    Join our Discord Channel
  </div>
  <div
    class="fw-light text-center"
    style="color: var(--text-secondary-250); font-size: 14px;  "
  >
    <span> Join our Discord channel to </span>
    <span><br /> connect with the community.</span>
  </div>
  <div
    class="w-100"
    style="padding-top:10px; padding-left:19px; padding-right:19px;"
  >
    <Tooltip title="Join Community" placement="bottom" distance={15}>
      <div
        class="w-100 join-button d-flex justify-content-center align-items-center gap-8 align-self-center"
        role="button"
        style=" height:40px; background-color: var(--dropdown-button); border-radius:4px;"
        on:click={async () => {
          onJoin();
        }}
      >
        <div
          class="fw-normal"
          style="font-size: 14px; color:var(--white-color);"
        >
          Join
        </div>
      </div>
    </Tooltip>
  </div>
</div>
<div class="d-flex flex-column" style="padding-top:17px; padding-left:10px;">
  <div
    class="d-flex p-2 gap-2 align-items-center pt-2"
    style=" height: 44px;  color:var(--text-secondary-50);  "
  >
    <Tooltip placement="right" title="Coming Soon">
      <span style=""> <SettingIcon color={"var(--text-secondary-50)"} /> </span>
      <span class="text-fs-14">Support</span>
    </Tooltip>
  </div>
  <div
    class="d-flex p-2 gap-2 align-items-center"
    style="height: 44px; color:var(--text-secondary-50)"
  >
    <Tooltip placement="right" title="Coming Soon">
      <span> <HelpCenterIcon color={"var(--text-secondary-50)"} /> </span>
      <span class="text-fs-14">Help Center</span>
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
