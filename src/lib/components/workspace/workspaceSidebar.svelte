<script lang="ts">
  import { user } from "$lib/store/auth.store";
  import { onDestroy } from "svelte";
  import icons from "$lib/assets/app.asset";

  let name: string = "";
  let firstLetter;
  const unsubscribeUser = user.subscribe((value) => {
    if (value) {
      if (value.personalWorkspaces) {
        name = value?.personalWorkspaces[0]?.name;
      }
      if (name) {
        firstLetter = name[0];
      }
    }
  });

  onDestroy(() => {
    unsubscribeUser();
  });
</script>

<div class="main-container">
  <div class="sidebar w-100 p-4">
    <div
      class="d-flex align-items-center gap-2 mt-2 info-setting-hover rounded py-2 cursor-pointer"
    >
      <img src={icons.info} alt="info" class="ps-2" />
      <p class="mb-0">About</p>
    </div>
    <div
      class="d-flex align-items-center gap-2 info-setting-hover rounded py-2"
    >
      <img src={icons.setting} alt="settings" class="ps-2" />
      <p class="mb-0">Workspace Settings</p>
    </div>
    <div class="border my-3 border-bottom border-dark" />
    <div class="fs-6 p-2 pt-1">
      <p class="text-secondary font-family-roboto fs-6 fw-bold">
        Last Activity by
      </p>
      <p style="margin-top: -10px;">{name}</p>
    </div>
  </div>
  <div class="workspace-info">
    <p class="gap-2"><span class="api-info">{0}</span>API REQUESTS</p>
    <p class="gap-2">
      <span class="api-info">{0}</span>COLLECTION
    </p>
  </div>
</div>

<style>
  .main-container {
    width: 280px;
    position: fixed;
    font-family: Roboto;
    right: 0;
    top: 80px;
    border-left: 1px solid var(--border-color);
    height: calc(100vh - 80px);
    z-index: 99;
  }

  .workspace-info {
    position: fixed;
    bottom: 0;
    padding: 15px;
    display: flex;
    width: 100%;
    color: #45494d;
    font-size: 12px;
  }
  .workspace-info > :first-child {
    margin-right: 10px;
  }
  .api-info {
    color: #85c2ff;
    line-height: 18px;
    font-size: 16px;
    padding-left: 10px;
  }
</style>
