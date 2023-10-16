<script>
  import plusIcon from "$lib/assets/actionicon-normal.svg";
  import crossIcon from "$lib/assets/cross.svg";
  import angleLeft from "$lib/assets/angleLeft.svg";
  import angleRight from "$lib/assets/angle-right.svg";
  import linesmallIcon from "$lib/assets/linesmall.svg";

  import PageHeader from "./PageHeader.svelte";

  let tabs = [
    { name: "GET", content: " Untitled Request" },
    { name: "GET", content: " Untitled Request" },
    { name: "GET", content: " Untitled Request" },
    { name: "GET", content: " Untitled Request" },
    { name: "GET", content: " Untitled Request" },
  ];
</script>

<div class="d-flex flex-column">
  <div style="border-top: 1px solid #313233" class="bg-backgroundColor;">
    <div
      class="d-flex align-items-center justify-content-start bg-blackColor ps-2 pe-5"
      style="width:1006px;height:40px;"
    >
      {#if tabs.length >= 5}
        <div class="d-flex gap-2 pe-1">
          <button
            class="btn btn-primary p-1 d-flex align-items-center justify-content-center w-100 h-100 border-0"
          >
            <img src={angleLeft} alt="angleLeft" class="w-100 p-2 h-100" />
          </button>
          <img src={linesmallIcon} alt="" />
        </div>
      {/if}
      {#each tabs as tab}
        <div
          class="d-flex align-items-center gap-2 bg-blackColor rounded"
          style="width: 172px; height:28px"
          data-tauri-drag-region
        >
          <button class="bg-blackColor border-0 w-100">
            <span style="font-size: 12px; color:#69D696">{tab.name}</span>
            <span
              class="text-muted font-weight-normal"
              style="font-size: 12px; line-height: 18px; font-family: Roboto; color: #8A9299;"
            >
              {tab.content}</span
            >
          </button>

          <button class="btn btn-primary border-0 px-1">
            <img src={crossIcon} alt="cross" />
          </button>
          <div class="pe-1">
            <img src={linesmallIcon} alt="" />
          </div>
        </div>
      {/each}
      {#if tabs.length >= 5}
        <div
          class="d-flex align-items-center justify-content-center gap-1 pe-2"
        >
          <button
            class="btn btn-primary p-1 d-flex align-items-center justify-content-center w-100 h-100 border-0"
          >
            <img src={angleRight} alt="angleLeft" class="w-100 h-100" />
          </button>
          <img src={linesmallIcon} alt="" />
        </div>
      {/if}
      <div>
        <button class=" btn btn-primary border-0 ps-1 pe-1 py-0">
          <img src={plusIcon} alt="" />
        </button>
      </div>
    </div>
  </div>
  <PageHeader />
</div>

<style>
  .btn-primary {
    background-color: #000000;
    color: #8a9299;
  }

  .btn-primary:hover {
    background-color: #232527;
  }
</style>
