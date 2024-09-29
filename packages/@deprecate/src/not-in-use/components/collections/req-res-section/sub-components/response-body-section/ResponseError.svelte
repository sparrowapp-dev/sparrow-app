<script lang="ts">
  import logoType from "@deprecate/assets/logotype.svg";
  import logoSymbol from "@deprecate/assets/logoSymbol.svg";
  import { onDestroy } from "svelte";
  import { currentTab, tabs } from "@deprecate/store/request-response-section";

  let currentTabId = null;
  let tabList = [];

  let url: string = "";

  const fetchBodyData = (id, list) => {
    list.forEach((elem) => {
      if (elem.id === id) {
        url = elem.request.url;
      }
    });
  };

  const tabsUnsubscribe = tabs.subscribe((value) => {
    tabList = value;
    if (currentTabId && tabList) {
      fetchBodyData(currentTabId, tabList);
    }
  });

  const currentTabUnsubscribe = currentTab.subscribe((value) => {
    if (value && value.id) {
      currentTabId = value.id;
      if (currentTabId && tabList) {
        fetchBodyData(currentTabId, tabList);
      }
    }
  });

  onDestroy(() => {
    currentTabUnsubscribe();
    tabsUnsubscribe();
  });
</script>

<div
  class="response-error mt-5 d-flex flex-column align-items-center justify-content-center overflow-hidden"
>
  <div class="d-flex">
    <img src={logoSymbol} alt="" />
    <img src={logoType} alt="" />
  </div>

  <p class="mb-4">Could not send request</p>
  <div
    class="error d-flex align-items-center justify-content-center bg-redColor rounded px-4 border-0"
  >
    <p class="mb-0">Error: getaddrinfo ENOTFOUND <span>{url}</span></p>
  </div>
</div>

<style>
  .error {
    overflow: hidden;
  }
</style>
