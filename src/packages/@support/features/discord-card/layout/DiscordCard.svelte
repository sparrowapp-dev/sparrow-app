<script lang="ts">
  import { DiscordIcon } from "@library/icons";
</script>

<div
  class="d-flex flex-column align-items-center gap-2"
  style="height: 236px ; background-color: var(--text-tertiary-400) ; border-radius:4px;"
>
  <div style="padding-top:22px;">
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
    style="color: var(--text-secondary-250); font-size: 14px; "
  >
    Join our Discord channel to connect with the community.
  </div>

  <div
    class="w-100"
    style="padding-top:10px; padding-left:19px; padding-right:19px;"
  >
    <div
      class="w-100 join-button d-flex justify-content-center align-items-center gap-8 align-self-center"
      role="button"
      style=" height:40px; background-color: var(--dropdown-button); border-radius:4px; "
    >
      <div class="fw-normal" style="font-size: 14px;">Join</div>
    </div>
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
